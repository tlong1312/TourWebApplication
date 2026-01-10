package com.longne.tourapplication.controller;

import com.longne.tourapplication.dto.ChatRequest;
import com.longne.tourapplication.dto.ChatResponse;
import com.longne.tourapplication.service.TourChatBotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class ChatBotController {

    private final TourChatBotService chatbotService;

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@Valid @RequestBody ChatRequest request) {
        log.info("📨 Received chat request from user: {}",
                request.getUserId() != null ? request.getUserId() : "Anonymous");
        log.info("   Message: '{}'", request.getMessage());

        try {
            ChatResponse response = chatbotService.chat(request);

            log.info("✅ Chat completed: {} chars, {} suggestions, {} ms",
                    response.getResponse().length(),
                    response.getSuggestedTours().size(),
                    response.getProcessingTimeMs());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Chat error: {}", e.getMessage(), e);

            // Return error response
            ChatResponse errorResponse = ChatResponse.builder()
                    .response("Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại sau. 🙏")
                    .suggestedTours(java.util.Collections.emptyList())
                    .conversationId(request.getConversationId())
                    .processingTimeMs(0L)
                    .build();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Clear conversation history
     *
     * DELETE /api/chatbot/conversation/{conversationId}
     */
    @DeleteMapping("/conversation/{conversationId}")
    public ResponseEntity<Map<String, Object>> clearConversation(@PathVariable String conversationId) {
        log.info("🗑️ Clearing conversation: {}", conversationId);

        try {
            chatbotService.clearConversation(conversationId);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Conversation cleared successfully");
            response.put("conversationId", conversationId);

            log.info("✅ Conversation cleared: {}", conversationId);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error clearing conversation: {}", e.getMessage());

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "Failed to clear conversation: " + e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Health check endpoint
     *
     * GET /api/chatbot/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> health = new HashMap<>();

        try {
            health.put("status", "UP");
            health.put("service", "Tour Chatbot");
            health.put("features", Map.of(
                    "rag", "enabled",
                    "chatMemory", "JDBC (MySQL)",
                    "vectorStore", "PgVector (PostgreSQL)",
                    "tools", "enabled"
            ));
            health.put("activeConversations", chatbotService.getActiveConversationsCount());
            health.put("timestamp", java.time.LocalDateTime.now().toString());

            log.debug("Health check: OK");

            return ResponseEntity.ok(health);

        } catch (Exception e) {
            log.error("❌ Health check failed: {}", e.getMessage());

            health.put("status", "DOWN");
            health.put("error", e.getMessage());

            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(health);
        }
    }

    /**
     * Get conversation statistics
     *
     * GET /api/chatbot/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        log.info("📊 Retrieving chatbot statistics");

        Map<String, Object> stats = new HashMap<>();
        stats.put("activeConversations", chatbotService.getActiveConversationsCount());
        stats.put("timestamp", java.time.LocalDateTime.now().toString());

        return ResponseEntity.ok(stats);
    }

    /**
     * Test endpoint - Quick test without conversation tracking
     *
     * GET /api/chatbot/test?message=Hello
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> test(@RequestParam(defaultValue = "Hello") String message) {
        log.info("🧪 Test endpoint called with message: '{}'", message);

        try {
            ChatRequest request = new ChatRequest();
            request.setMessage(message);

            ChatResponse response = chatbotService.chat(request);

            Map<String, Object> testResponse = new HashMap<>();
            testResponse.put("status", "success");
            testResponse.put("input", message);
            testResponse.put("response", response.getResponse());
            testResponse.put("processingTimeMs", response.getProcessingTimeMs());

            return ResponseEntity.ok(testResponse);

        } catch (Exception e) {
            log.error("❌ Test failed: {}", e.getMessage());

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Global exception handler for validation errors
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        Map<String, Object> response = new HashMap<>();
        response.put("status", "error");
        response.put("message", "Validation failed");
        response.put("errors", errors);

        log.warn("⚠️ Validation error: {}", errors);

        return ResponseEntity.badRequest().body(response);
    }
}
