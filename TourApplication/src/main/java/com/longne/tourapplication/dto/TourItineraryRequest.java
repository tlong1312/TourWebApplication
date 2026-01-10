package com.longne.tourapplication.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TourItineraryRequest {
    private Long tourId;
    private Integer dayNumber;
    private String title;
    private String description;
    private String activities;
    private String meals;
    private String accommodation;
}
