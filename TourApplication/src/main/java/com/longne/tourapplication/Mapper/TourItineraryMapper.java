package com.longne.tourapplication.Mapper;

import com.longne.tourapplication.dto.TourItineraryRequest;
import com.longne.tourapplication.dto.TourItineraryResponse;
import com.longne.tourapplication.entity.TourItinerary;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class TourItineraryMapper {

    public TourItinerary toEntity(TourItineraryRequest request) {
        if (request == null) {
            return null;
        }
        TourItinerary tourItinerary = new TourItinerary();
        tourItinerary.setDayNumber(request.getDayNumber());
        tourItinerary.setTitle(request.getTitle());
        tourItinerary.setDescription(request.getDescription());
        tourItinerary.setActivities(request.getActivities());
        tourItinerary.setMeals(request.getMeals());
        tourItinerary.setAccommodation(request.getAccommodation());
        return tourItinerary;
    }

    public TourItineraryResponse toTourResponse(TourItinerary tourItinerary) {
        if (tourItinerary == null) {
            return null;
        }
        TourItineraryResponse response = new TourItineraryResponse();
        response.setId(tourItinerary.getId());
        response.setDayNumber(tourItinerary.getDayNumber());
        response.setTitle(tourItinerary.getTitle());
        response.setDescription(tourItinerary.getDescription());
        response.setActivities(tourItinerary.getActivities());
        response.setMeals(tourItinerary.getMeals());
        response.setAccommodation(tourItinerary.getAccommodation());
        return response;
    }

    public void updateTourItineraryFromRequest(TourItineraryRequest request, TourItinerary tourItinerary) {
        if (request == null || tourItinerary == null) {
            return;
        }
        tourItinerary.setDayNumber(request.getDayNumber());
        tourItinerary.setTitle(request.getTitle());
        tourItinerary.setDescription(request.getDescription());
        tourItinerary.setActivities(request.getActivities());
        tourItinerary.setMeals(request.getMeals());
        tourItinerary.setAccommodation(request.getAccommodation());
    }

    public List<TourItineraryResponse> toDtoList(List<TourItinerary> tourItineraries) {
        return tourItineraries.stream()
                .map(this::toTourResponse)
                .collect(Collectors.toList());
    }
}
