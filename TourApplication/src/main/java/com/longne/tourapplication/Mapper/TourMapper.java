package com.longne.tourapplication.Mapper;

import com.longne.tourapplication.dto.TourRequest;
import com.longne.tourapplication.dto.TourResponse;
import com.longne.tourapplication.entity.Category;
import com.longne.tourapplication.entity.Tour;
import com.longne.tourapplication.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class TourMapper {

    @Autowired
    CategoryRepository categoryRepository;

    @Autowired
    private TourImageMapper tourImageMapper;

    @Autowired
    private TourItineraryMapper tourItineraryMapper;
    @Autowired
    private TourScheduleMapper tourScheduleMapper;

    public TourResponse toTourResponse(Tour tour) {
        TourResponse response = new TourResponse();
        response.setId(tour.getId());
        response.setCategoryName(tour.getCategory().getName());
        response.setName(tour.getName());
        response.setSlug(tour.getSlug());
        response.setDescription(tour.getDescription());
        response.setLocation(tour.getLocation());
        response.setPrice(tour.getPrice());
        response.setDuration(tour.getDuration());
        response.setAvailableSeats(tour.getAvailableSeats());
        response.setStartDate(tour.getStartDate());
        response.setEndDate(tour.getEndDate());
        response.setStatus(tour.getStatus());
        response.setFeatured(tour.getFeatured());
        response.setCreatedAt(tour.getCreatedAt());
        response.setUpdatedAt(tour.getUpdatedAt());
        response.setAdultPrice(tour.getAdultPrice());
        response.setChildPrice(tour.getChildPrice());
        response.setInfantPrice(tour.getInfantPrice());
        response.setSingleRoomSurcharge(tour.getSingleRoomSurcharge());
        response.setDeparturePoint(tour.getDeparturePoint());
        response.setReturnPoint(tour.getReturnPoint());

        if (tour.getImages() != null && !tour.getImages().isEmpty()) {
            response.setImages(tour.getImages().stream()
                    .map(tourImageMapper::toTourImageResponse)
                    .collect(Collectors.toList()));
        }

        if (tour.getItineraries() != null && !tour.getItineraries().isEmpty()) {
            response.setItineraries(tour.getItineraries().stream()
                    .map(tourItineraryMapper::toTourResponse)
                    .collect(Collectors.toList()));
        }

        if(tour.getSchedules() != null && !tour.getSchedules().isEmpty()) {
            response.setSchedules(tour.getSchedules().stream()
                    .map(tourScheduleMapper::toResponse)
                    .collect(Collectors.toList()));
        }

        return response;
    }

    public Tour toEntity(TourRequest request) {
        Tour tour = new Tour();
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            tour.setCategory(category);
        }
        tour.setName(request.getName());
        tour.setDescription(request.getDescription());
        tour.setLocation(request.getLocation());
        tour.setPrice(request.getPrice() != null ? request.getPrice() : BigDecimal.ZERO);
        tour.setDuration(request.getDuration());
        tour.setAvailableSeats(request.getAvailableSeats());
        tour.setStartDate(request.getStartDate());
        tour.setEndDate(request.getEndDate());
        tour.setStatus(request.getStatus() != null ? request.getStatus() : "ACTIVE");
        tour.setFeatured(request.getFeatured());
        tour.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        tour.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
        tour.setAdultPrice(request.getAdultPrice() != null ? request.getAdultPrice() : BigDecimal.ZERO);
        tour.setChildPrice(request.getChildPrice() != null ? request.getChildPrice() : BigDecimal.ZERO);
        tour.setInfantPrice(request.getInfantPrice() != null ? request.getInfantPrice() : BigDecimal.ZERO);
        tour.setSingleRoomSurcharge(request.getSingleRoomSurcharge() != null ? request.getSingleRoomSurcharge() : BigDecimal.ZERO);
        tour.setDeparturePoint(request.getDeparturePoint());
        tour.setReturnPoint(request.getReturnPoint());

        return tour;
    }

    public void updateTourFromRequest(TourRequest request, Tour tour) {
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            tour.setCategory(category);
        }
        tour.setName(request.getName());
        tour.setDescription(request.getDescription());
        tour.setLocation(request.getLocation());
        tour.setPrice(request.getPrice() != null ? request.getPrice() : tour.getPrice());
        tour.setDuration(request.getDuration());
        tour.setAvailableSeats(request.getAvailableSeats());
        tour.setStartDate(request.getStartDate());
        tour.setEndDate(request.getEndDate());
        tour.setStatus(request.getStatus());
        tour.setFeatured(request.getFeatured());
        tour.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
        if (request.getAdultPrice() != null) {
            tour.setAdultPrice(request.getAdultPrice());
        }
        if (request.getChildPrice() != null) {
            tour.setChildPrice(request.getChildPrice());
        }
        if (request.getInfantPrice() != null) {
            tour.setInfantPrice(request.getInfantPrice());
        }
        if (request.getSingleRoomSurcharge() != null) {
            tour.setSingleRoomSurcharge(request.getSingleRoomSurcharge());
        }
        if (request.getDeparturePoint() != null) {
            tour.setDeparturePoint(request.getDeparturePoint());
        }
        if (request.getReturnPoint() != null) {
            tour.setReturnPoint(request.getReturnPoint());
        }
    }

    public List<TourResponse> toDtoList(List<Tour> tours) {
        if (tours == null) {
            return null;
        }
        return tours.stream()
                .map(this::toTourResponse)
                .collect(Collectors.toList());
    }
}
