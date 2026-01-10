package com.longne.tourapplication.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatResponse {
    private String response;
    private List<TourSuggestion> suggestedTours;
    private String conversationId;
    private Long processingTimeMs;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TourSuggestion {
        private Long tourId;
        private String tourName;
        private String location;
        private String price;
        private Integer duration;
        private Double relevanceScore;
    }
}
