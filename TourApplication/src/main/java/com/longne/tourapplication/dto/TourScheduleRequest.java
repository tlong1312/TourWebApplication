package com.longne.tourapplication.dto;


import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TourScheduleRequest {
    @NotNull(message = "Tour ID không được để trống")
    private Long tourId;

    @NotNull(message = "Ngày khởi hành không được để trống")
    private LocalDate departureDate;

    @NotNull(message = "Ngày về không được để trống")
    private LocalDate returnDate;

    @NotNull(message = "Giờ khởi hành không được để trống")
    private LocalTime departureTime;

    @NotNull(message = "Giờ về không được để trống")
    private LocalTime returnTime;

    @NotNull(message = "Số chỗ trống không được để trống")
    private Integer availableSeats;

    private String status;
    private String departureLocation;
    private String returnLocation;
}