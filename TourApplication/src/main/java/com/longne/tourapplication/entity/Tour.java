package com.longne.tourapplication.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.List;

@Entity
@Data
@Table(name = "tour")
public class Tour {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    private String name;
    private String slug;
    private String description;
    private String location;
    private BigDecimal price;
    private Integer duration;

    @Column(name = "available_seats")
    private Integer availableSeats;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;
    private String status;
    private String featured;

    @Column(name = "created_at")
    private Timestamp createdAt;

    @Column(name = "updated_at")
    private Timestamp updatedAt;

    @OneToMany(mappedBy = "tour", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TourImage> images;
    @OneToMany(mappedBy = "tour", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TourItinerary> itineraries;
    @OneToMany(mappedBy = "tour", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TourSchedule> schedules;

    @Column(name = "adult_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal adultPrice;

    @Column(name = "child_price", precision = 10, scale = 2)
    private BigDecimal childPrice = BigDecimal.ZERO;

    @Column(name = "infant_price", precision = 10, scale = 2)
    private BigDecimal infantPrice = BigDecimal.ZERO;

    @Column(name = "single_room_surcharge", precision = 10, scale = 2)
    private BigDecimal singleRoomSurcharge = BigDecimal.ZERO;

    @Column(name = "departure_point")
    private String departurePoint;

    @Column(name = "return_point")
    private String returnPoint;

}
