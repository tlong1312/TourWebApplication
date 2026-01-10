package com.longne.tourapplication.controller;

import com.longne.tourapplication.dto.TourItineraryRequest;
import com.longne.tourapplication.dto.TourItineraryResponse;
import com.longne.tourapplication.entity.TourItinerary;
import com.longne.tourapplication.service.TourItineraryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tour-itinerary")
@RequiredArgsConstructor
public class TourItineraryController {
    private final TourItineraryService tourItineraryService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TourItineraryResponse> createTourItinerary(@RequestBody TourItineraryRequest tourItineraryRequest) {
        TourItineraryResponse createdItinerary = tourItineraryService.createTourItinerary(tourItineraryRequest);
        return new ResponseEntity<>(createdItinerary, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TourItineraryResponse> getTourItineraryById(@PathVariable Long id) {
        TourItineraryResponse itineraryResponse = tourItineraryService.getTourItineraryById(id);
        return ResponseEntity.ok(itineraryResponse);
    }

    @GetMapping
    public ResponseEntity<List<TourItineraryResponse>> getAllTourItineraries() {
        List<TourItineraryResponse> itineraries = tourItineraryService.getAllTourItineraries();
        return ResponseEntity.ok(itineraries);
    }

    @GetMapping("/of_tour/{tourId}")
    public ResponseEntity<List<TourItineraryResponse>> getTourItinerariesByTourId(@PathVariable Long tourId) {
        List<TourItineraryResponse> itineraries = tourItineraryService.getTourItinerariesByTourId(tourId);
        return ResponseEntity.ok(itineraries);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<TourItineraryResponse> updateTourItinerary(@PathVariable Long id, @RequestBody TourItineraryRequest tourItineraryRequest) {
        TourItineraryResponse updatedItinerary = tourItineraryService.updateTourItinerary(id, tourItineraryRequest);
        return ResponseEntity.ok(updatedItinerary);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteTourItinerary(@PathVariable Long id) {
        tourItineraryService.deleteTourItinerary(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Xóa chi tiết tour thành công");
        return ResponseEntity.ok(response);
    }
}