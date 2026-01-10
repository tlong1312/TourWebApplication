package com.longne.tourapplication.service;

import com.longne.tourapplication.Mapper.TourItineraryMapper;
import com.longne.tourapplication.dto.TourItineraryRequest;
import com.longne.tourapplication.dto.TourItineraryResponse;
import com.longne.tourapplication.entity.Tour; // <-- IMPORT THÊM
import com.longne.tourapplication.entity.TourItinerary;
import com.longne.tourapplication.repository.TourItineraryRepository;
import com.longne.tourapplication.repository.TourRepository; // <-- IMPORT THÊM
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
// (Nên tạo class exception này để trả về lỗi 404)
// import com.longne.tourapplication.exception.ResourceNotFoundException;

@Service
@RequiredArgsConstructor
@Transactional
public class TourItineraryService {
    private final TourItineraryRepository tourItineraryRepository;
    private final TourItineraryMapper tourItineraryMapper;

    private final TourRepository tourRepository;

    //CREATE
    public TourItineraryResponse createTourItinerary(TourItineraryRequest tourItineraryRequest) {

        Tour tour = tourRepository.findById(tourItineraryRequest.getTourId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Tour với ID: " + tourItineraryRequest.getTourId()));

        TourItinerary tourItinerary = tourItineraryMapper.toEntity(tourItineraryRequest);

        tourItinerary.setTour(tour);

        TourItinerary newTourItinerary = tourItineraryRepository.save(tourItinerary);
        return tourItineraryMapper.toTourResponse(newTourItinerary);
    }

    //FIND
    public TourItineraryResponse getTourItineraryById(Long idTourItinerary) {
        return tourItineraryRepository.findById(idTourItinerary)
                .map(tourItineraryMapper::toTourResponse)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Itinerary với ID: " + idTourItinerary));
    }

    public List<TourItineraryResponse> getAllTourItineraries() {
        List<TourItinerary> tourItineraries = tourItineraryRepository.findAll();
        return tourItineraryMapper.toDtoList(tourItineraries);
    }

    // Lấy danh sách TourItinerary theo Tour ID
    public List<TourItineraryResponse> getTourItinerariesByTourId(Long tourId) {
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Tour với ID: " + tourId));

        List<TourItinerary> tourItineraries = tourItineraryRepository.findByTour(tour);
        return tourItineraryMapper.toDtoList(tourItineraries);
    }

    // UPDATE
    public TourItineraryResponse updateTourItinerary(Long idTourItinerary, TourItineraryRequest tourItineraryRequest) {
        TourItinerary existingTourItinerary = tourItineraryRepository.findById(idTourItinerary)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Itinerary với ID: " + idTourItinerary));

        if (tourItineraryRequest.getTourId() != null) {
            Tour tour = tourRepository.findById(tourItineraryRequest.getTourId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy Tour với ID: " + tourItineraryRequest.getTourId()));
            existingTourItinerary.setTour(tour);
        }

        tourItineraryMapper.updateTourItineraryFromRequest(tourItineraryRequest, existingTourItinerary);
        TourItinerary updatedTourItinerary = tourItineraryRepository.save(existingTourItinerary);
        return tourItineraryMapper.toTourResponse(updatedTourItinerary);
    }

    // DELETE
    public void deleteTourItinerary(Long idTourItinerary) {
        if (!tourItineraryRepository.existsById(idTourItinerary)) {
            throw new RuntimeException("Không tìm thấy Itinerary với ID: " + idTourItinerary + " để xóa");
        }
        tourItineraryRepository.deleteById(idTourItinerary);
    }
}