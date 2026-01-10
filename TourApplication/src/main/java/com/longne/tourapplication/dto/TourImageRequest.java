package com.longne.tourapplication.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TourImageRequest {

    @NotNull(message = "Tour không được để trống")
    private Long tourId;

    @NotNull(message = "Ảnh không được để trống")
    private MultipartFile image;

    private Boolean isPrimary = false;
    private Integer displayOrder;
}
