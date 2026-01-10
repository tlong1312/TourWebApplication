package com.longne.tourapplication.repository;

import com.longne.tourapplication.entity.Tour;
import com.longne.tourapplication.entity.TourItinerary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TourItineraryRepository extends JpaRepository<TourItinerary, Long> {
    List<TourItinerary> findByTour(Tour tour);
//    List<TourItinerary> findByTourId(Long tourId);
    Long id(Long id);
}
