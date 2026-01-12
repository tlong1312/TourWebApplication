package com.longne.tourapplication.service;

import com.longne.tourapplication.entity.Tour;
import com.longne.tourapplication.repository.TourRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class TourVectorService {

    public final TourRepository tourRepository;
    public final VectorStore vectorStore;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional(readOnly = true, transactionManager = "primaryTransactionManager")
    public void initializeVectorStore() {
        log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        log.info("🚀 Initializing Vector Store...");
        log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        try{
            List<Tour> allTours = tourRepository.findAllWithItineraries();

            if(allTours.isEmpty()){
                log.warn("⚠️  No tours found in MySQL database");
                return;
            }
            log.info("📊 Found {} tours in database", allTours.size());
            log.info("⏳ Generating embeddings... (this may take a while)");

            indexTours(allTours);

            log.info("✅ Vector Store initialized successfully!");
            log.info("📦 Indexed {} tours", allTours.size());
            log.info("🔍 Ready for semantic search");

        }catch (Exception e){
            log.error("❌ Error initializing vector store: {}", e.getMessage(), e);
            log.error("💡 Application will continue, but chatbot may not work properly");
        }
        log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    }

    public void indexTours(List<Tour> tours){
        List<Document> documents = tours.stream()
                .map(this::tourToDocument)
                .collect(Collectors.toList());

        vectorStore.add(documents);
        log.info("📥 Indexed {} tours into Vector Store", documents.size());
    }

    public void indexTour(Tour tour){
        try{
            Document doc = tourToDocument(tour);
            vectorStore.add(List.of(doc));
            log.info("📥 Indexed tour ID {} '{}' into Vector Store",
                    tour.getId(), tour.getName());
        }catch (Exception e){
            log.error("❌ Failed to index tour ID {}: {}", tour.getId(), e.getMessage());
        }
    }

    List<Document> searchSimilarTours(String query, int topK){
        log.info("🔍 Searching for tours similar to: '{}'", query);

        SearchRequest request = SearchRequest.builder()
                .query(query)
                .topK(topK)
                .similarityThreshold(0.5)
                .build();

        List<Document> results = vectorStore.similaritySearch(request);
        log.info("✅ Found {} similar tours (threshold: 0.5)", results.size());

        return results;
    }

    private Document tourToDocument(Tour tour){
        String content = buildTourContent(tour);
        Map<String, Object> metadata = buildTourMetadata(tour);

        String documentId = generateUuidFromTourId(tour.getId());
        return new Document(documentId, content, metadata);
    }

    private String generateUuidFromTourId(Long tourId) {
        // Create deterministic UUID from tour ID
        // Format: "00000000-0000-0000-0000-{tourId padded}"
        String paddedId = String.format("%012d", tourId);
        return String.format("00000000-0000-0000-0000-%s", paddedId);
    }

    private String buildTourContent(Tour tour){
        StringBuilder content = new StringBuilder();

        content.append("Tên tour: ").append(tour.getName()).append("\n");
        content.append("Địa điểm: ").append(tour.getLocation()).append("\n");
        content.append("Danh mục: ").append(tour.getCategory().getName()).append("\n");
        content.append("Mô tả: ").append(tour.getDescription()).append("\n");
        content.append("Thời gian: ").append(tour.getDuration())
                .append(" ngày ").append(tour.getDuration() - 1).append(" đêm\n");
        content.append("Giá người lớn: ").append(tour.getAdultPrice()).append(" VND\n");

        if (tour.getChildPrice() != null) {
            content.append("Giá trẻ em: ").append(tour.getChildPrice()).append(" VND\n");
        }

        if (tour.getDeparturePoint() != null) {
            content.append("Điểm khởi hành: ").append(tour.getDeparturePoint()).append("\n");
        }

        if (tour.getItineraries() != null && !tour.getItineraries().isEmpty()) {
            content.append("\nLịch trình chi tiết:\n");
            tour.getItineraries().forEach(it -> {
                content.append("▪ Ngày ").append(it.getDayNumber()).append(": ");
                content.append(it.getTitle());
                if (it.getDescription() != null) {
                    content.append(" - ").append(it.getDescription());
                }
                content.append("\n");
            });
        }

        return content.toString();
    }

    private Map<String, Object> buildTourMetadata(Tour tour){
        Map<String, Object> metadata = new HashMap<>();

        metadata.put("tourId", tour.getId().toString());
        metadata.put("tourName", tour.getName());
        metadata.put("location", tour.getLocation());
        metadata.put("price", tour.getAdultPrice().toString());
        metadata.put("duration", tour.getDuration().toString());

        String frontendUrl = "http://157.230.46.199:5173/tours/" + tour.getId();
        metadata.put("url", frontendUrl);

        String imageUrl = "";
        if(tour.getImages() != null && !tour.getImages().isEmpty()){
            imageUrl = tour.getImages().getFirst().getImageUrl();
        }
        metadata.put("imageUrl", imageUrl);
        return metadata;
    }

    public void clearVectorStore() {
        log.warn("🗑️ Clearing Vector Store...");
        log.warn("⚠️  Clear operation not implemented");
    }

}
