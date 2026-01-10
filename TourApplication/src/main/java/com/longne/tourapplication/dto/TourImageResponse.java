package com.longne.tourapplication.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TourImageResponse implements Serializable {
    private Long id;
    private Long tourId;
    private String imageUrl;
    private Boolean isPrimary;
    private Integer displayOrder;
}
