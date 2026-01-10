package com.longne.tourapplication.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TourRequest {
    @NotNull(message = "Category không được để trống")
    private Long categoryId;

    @NotBlank(message = "Tên tour không được để trống")
    private String name;
    private String slug;
    private String description;
    private String location;

    @NotNull(message = "Giá không được để trống")
    @Positive(message = "Giá phải lớn hơn 0")
    private BigDecimal price;

    @NotNull(message = "Thời gian không được để trống")
    @Positive(message = "Thời gian phải lớn hơn 0")
    private Integer duration;
    private Integer availableSeats;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private String featured;

    private List<MultipartFile> images;

    // THÊM MỚI:
    @NotNull(message = "Giá người lớn không được để trống")
    @DecimalMin(value = "0.0", message = "Giá người lớn phải >= 0")
    private BigDecimal adultPrice;

    @DecimalMin(value = "0.0", message = "Giá trẻ em phải >= 0")
    private BigDecimal childPrice;

    @DecimalMin(value = "0.0", message = "Giá trẻ nhỏ phải >= 0")
    private BigDecimal infantPrice;

    @DecimalMin(value = "0.0", message = "Phụ thu phòng đơn phải >= 0")
    private BigDecimal singleRoomSurcharge;

    private String departurePoint;
    private String returnPoint;
}
