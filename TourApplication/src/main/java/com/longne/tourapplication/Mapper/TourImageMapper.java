package com.longne.tourapplication.Mapper;

import com.longne.tourapplication.dto.TourImageRequest;
import com.longne.tourapplication.dto.TourImageResponse;
import com.longne.tourapplication.entity.Tour;
import com.longne.tourapplication.entity.TourImage;
import com.longne.tourapplication.repository.TourRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class TourImageMapper {

    @Autowired
    private TourRepository tourRepository;

    public TourImageResponse toTourImageResponse(TourImage tourImage) {
        if (tourImage == null) {
            return null;
        }
        TourImageResponse response = new TourImageResponse();
        response.setId(tourImage.getId());
        response.setTourId(tourImage.getTour().getId());
        response.setImageUrl(tourImage.getImageUrl());
        response.setIsPrimary(tourImage.getIsPrimary());
        response.setDisplayOrder(tourImage.getDisplayOrder());
        return response;
    }

    public TourImage toEntity(TourImageRequest request) {
        if (request == null) {
            return null;
        }
        TourImage tourImage = new TourImage();
        if (request.getTourId() != null) {
            Tour tour = tourRepository.findById(request.getTourId()).orElse(null);
            tourImage.setTour(tour);
        }
        tourImage.setIsPrimary(request.getIsPrimary());
        tourImage.setDisplayOrder(request.getDisplayOrder());
        return tourImage;
    }

}
