package com.longne.tourapplication.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.List;

@Data
public class TourResponse implements Serializable {
        private Long id;
        private String categoryName;
        private String name;
        private String slug;
        private String description;
        private String location;
        private BigDecimal price;
        private Integer duration;
        private Integer availableSeats;
        private LocalDate startDate;
        private LocalDate endDate;
        private String status;
        private String featured;
        private Timestamp createdAt;
        private Timestamp updatedAt;

        private List<TourImageResponse> images;
        private List<TourItineraryResponse> itineraries;
        private List<TourScheduleResponse> schedules;
        private BigDecimal adultPrice;
        private BigDecimal childPrice;
        private BigDecimal infantPrice;
        private BigDecimal singleRoomSurcharge;
        private String departurePoint;
        private String returnPoint;
    }
