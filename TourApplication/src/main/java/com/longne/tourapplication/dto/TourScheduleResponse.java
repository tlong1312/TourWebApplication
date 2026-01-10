package com.longne.tourapplication.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TourScheduleResponse implements Serializable {
    private Long id;
    private Long tourId;
    private LocalDate departureDate;
    private LocalDate returnDate;
    private LocalTime departureTime;
    private LocalTime returnTime;
    private Integer availableSeats;
    private String status;
    private String departureLocation;
    private String returnLocation;
}
