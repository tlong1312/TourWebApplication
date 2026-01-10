package com.longne.tourapplication.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "tour_itineraries")
@Data
public class TourItinerary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "tour_id", nullable = false)
    private Tour tour;
    @Column(name = "day_number")
    private Integer dayNumber;
    private String title;
    private String description;
    private String activities;
    private String meals;
    private String accommodation;
}
