package com.longne.tourapplication.repository;

import com.longne.tourapplication.entity.Tour;
import com.longne.tourapplication.entity.TourImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TourImageRepository extends JpaRepository<TourImage, Long> {
    List<TourImage> findByTour(Tour tour);
}
