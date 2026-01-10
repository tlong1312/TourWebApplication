package com.longne.tourapplication.dto;

import lombok.Data;

import java.io.Serializable;

@Data
public class TourItineraryResponse implements Serializable {
    private Long id;
    private Integer dayNumber;
    private String title;
    private String description;
    private String activities;
    private String meals;
    private String accommodation;
}
