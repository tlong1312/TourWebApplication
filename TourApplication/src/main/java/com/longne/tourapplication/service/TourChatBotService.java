package com.longne.tourapplication.service;

import com.longne.tourapplication.dto.ChatResponse;
import com.longne.tourapplication.dto.ChatRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.ai.chat.memory.repository.jdbc.JdbcChatMemoryRepository;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.document.Document;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class TourChatBotService {

    private final ChatClient chatClient;
    private final TourVectorService tourVectorService;
    private final TourToolService tourToolService;
    private final JdbcChatMemoryRepository jdbcChatMemoryRepository;

    public TourChatBotService(
            ChatClient.Builder builder,
            TourVectorService tourVectorService,
            TourToolService tourToolService,
            JdbcChatMemoryRepository jdbcChatMemoryRepository
    ) {
        this.tourVectorService = tourVectorService;
        this.tourToolService = tourToolService;
        this.jdbcChatMemoryRepository = jdbcChatMemoryRepository;

        // Setup ChatMemory
        ChatMemory chatMemory = MessageWindowChatMemory.builder()
                .chatMemoryRepository(jdbcChatMemoryRepository)
                .maxMessages(10)
                .build();

        // Build ChatClient
        this.chatClient = builder
                .defaultAdvisors(MessageChatMemoryAdvisor.builder(chatMemory).build())
                .build();

        log.info("✅ TourChatbotService initialized with JDBC ChatMemory");
    }


    public ChatResponse chat(ChatRequest request) {
        long startTime = System.currentTimeMillis();

        String conversationId = request.getConversationId() != null
                ? request.getConversationId()
                : "user-" + (request.getUserId() != null ? request.getUserId() : "anonymous");

        log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        log.info("💬 Chat Request: '{}'", request.getMessage());
        log.info("   Conversation: {}", conversationId);
        log.info("   User: {}", request.getUserId() != null ? request.getUserId() : "Anonymous");

        String msg = request.getMessage().toLowerCase();
        List<String> resetKeywords = List.of(
                // ✅ CHỈ GIỮ LẠI ĐỘNG TỪ (Hành động muốn tìm mới)
                "tìm tour", "tìm kiếm", "muốn đi", "cần đi", "có tour",
                "du lịch", "khám phá", "tham quan",
                "đổi địa điểm", "chỗ khác",
                "quốc tế", "nước ngoài", "nội địa", "trong nước"
        );

        // Nếu câu chat chứa bất kỳ từ khóa nào ở trên -> Xóa bộ nhớ cũ ngay
        boolean isNewSearch = resetKeywords.stream().anyMatch(msg::contains);

        if (isNewSearch) {
            log.info("🧹 Detected SEARCH intent ('{}') -> Clearing memory to avoid hallucinations.", msg);
            this.jdbcChatMemoryRepository.deleteByConversationId(conversationId);
        } else {
            log.info("🧠 Detected FOLLOW-UP intent -> Keeping memory for context.");
        }

        try {

            log.info("🔍 RAG - Searching similar tours...");
            List<Document> relevantDocs = tourVectorService.searchSimilarTours(
                    request.getMessage(), 5
            );
            log.info("✅ Found {} relevant tours", relevantDocs.size());



            SystemMessage systemMessage = new SystemMessage(buildSystemPrompt(""));
            UserMessage userMessage = new UserMessage(request.getMessage());
            Prompt prompt = new Prompt(systemMessage, userMessage);

            log.info("🤖 Calling AI with chat memory...");
            String response = chatClient
                    .prompt(prompt)
                    .advisors(advisorSpec -> advisorSpec.param(
                            ChatMemory.CONVERSATION_ID, conversationId
                    ))
                    .tools(tourToolService)
                    .call()
                    .content();

            log.info("✅ Response received ({} chars)", response.length());

            List<ChatResponse.TourSuggestion> suggestions = buildTourSuggestions(relevantDocs);

            long processingTime = System.currentTimeMillis() - startTime;
            log.info("✅ Completed in {} ms", processingTime);
            log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

            return ChatResponse.builder()
                    .response(response)
                    .suggestedTours(suggestions)
                    .conversationId(conversationId)
                    .processingTimeMs(processingTime)
                    .build();

        } catch (Exception e) {
            log.error("❌ Error: {}", e.getMessage(), e);

            return ChatResponse.builder()
                    .response("Xin lỗi, hệ thống gặp sự cố. Vui lòng thử lại. 🙏")
                    .suggestedTours(new ArrayList<>())
                    .conversationId(conversationId)
                    .processingTimeMs(System.currentTimeMillis() - startTime)
                    .build();
        }
    }

    private String buildSystemPrompt(String context) {
        return """
    You are a dedicated **Data Renderer Bot**.
    
    🛑 **CORE IDENTITY:**
    - You are NOT a conversational assistant. You are a middleware.
    - Your ONLY job is to execute tools and **DISPLAY THE RAW OUTPUT**.
    
    ⚡ **CRITICAL OUTPUT RULES (BẮT BUỘC CÓ ẢNH & LINK):**
    1. When `searchTours` returns a list (which contains Markdown Images `![...]` and Links `[...]`):
       - You must output that content **EXACTLY AS RECEIVED**.
       - **DO NOT** summarize. **DO NOT** remove the images or links.
       
    2. If the tool returns "Found X tours...", just print that result.
    
    ⚡ **CRITICAL MEMORY RULE (CONTEXT SWITCHING):**
    - **IF** the user asks for a NEW location, category, or criteria (e.g., switching from "Da Nang" to "International"):
       1. **IGNORE** all previous tool outputs.
       2. **ASSUME** you know nothing about the new request.
       3. **MUST CALL THE TOOL AGAIN** with the new parameters.
    - **NEVER** reuse old search results for a new request.
    
    ⚡ **TRIGGERS & MAPPING (QUY TRÌNH XỬ LÝ):**
    
    1. **Search/Location** (e.g., "Da Nang", "tìm tour", "có tour không"):
       -> Call `searchTours`.
       
    2. **Category Search**:
       - "Quốc tế", "Nước ngoài" -> Call `searchTours(categoryName="Quốc tế")`.
       - "Nội địa", "Trong nước" -> Call `searchTours(categoryName="Nội địa")`.
    
    3. **Price (`calculatePrice`) OR Details (`getTourDetails`):**
       🛑 **RULE:** These tools require a numeric `tourId`.
       - **CASE A (User gives Name):** "Chi tiết tour Đà Nẵng", "Giá tour Sapa"
         -> You DON'T have the ID yet.
         -> **ACTION:** Call `searchTours(location="Name")` FIRST.
       
       - **CASE B (User refers to Context):** "Giá tour này", "Chi tiết nó"
         -> **ACTION:** Use `tourId` from chat history -> Call `calculatePrice` or `getTourDetails`.
         
       ⚠️ **WARNING:** NEVER invent an ID (like 12345). If you don't have an ID, execute CASE A (Search).

    (Remember: Check for context switch first. Only answer if you can call a Tool. REFUSE all general knowledge questions.)
    """;
    }

    private String buildContext(List<Document> documents) {
        if (documents.isEmpty()) {
            return "⚠️ Không tìm thấy tour phù hợp.";
        }

        StringBuilder context = new StringBuilder();
        int index = 1;

        for (Document doc : documents) {
            context.append("\n━━━ TOUR ").append(index++).append(" ━━━\n");
            context.append(doc.getText()).append("\n");
        }

        return context.toString();
    }

    private List<ChatResponse.TourSuggestion> buildTourSuggestions(List<Document> documents) {
        return documents.stream()
                .limit(3)
                .map(doc -> {
                    Map<String, Object> metadata = doc.getMetadata();
                    return ChatResponse.TourSuggestion.builder()
                            .tourId(Long.parseLong(metadata.get("tourId").toString()))
                            .tourName(metadata.get("tourName").toString())
                            .location(metadata.get("location").toString())
                            .price(metadata.get("price").toString())
                            .duration(Integer.parseInt(metadata.get("duration").toString()))
                            .relevanceScore(doc.getScore() != null ? doc.getScore() : 0.0)
                            .build();
                })
                .collect(Collectors.toList());
    }

    public void clearConversation(String conversationId) {
        log.info("🗑️ Cleared conversation: {}", conversationId);
    }

    public int getActiveConversationsCount() {
        return 0;
    }
}
