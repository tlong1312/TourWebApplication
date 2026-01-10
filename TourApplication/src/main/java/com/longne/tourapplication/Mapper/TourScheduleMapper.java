package com.longne.tourapplication.Mapper;

import com.longne.tourapplication.dto.TourScheduleRequest;
import com.longne.tourapplication.dto.TourScheduleResponse;
import com.longne.tourapplication.entity.Tour;
import com.longne.tourapplication.entity.TourSchedule;
import com.longne.tourapplication.repository.TourRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TourScheduleMapper {

    private final TourRepository tourRepository;

    public TourSchedule toEntity(TourScheduleRequest request) {
        Tour tour = tourRepository.findById(request.getTourId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tour"));

        return TourSchedule.builder()
                .tour(tour)
                .departureDate(request.getDepartureDate())
                .returnDate(request.getReturnDate())
                .departureTime(request.getDepartureTime())
                .returnTime(request.getReturnTime())
                .availableSeats(request.getAvailableSeats())
                .status(request.getStatus() != null
                        ? TourSchedule.ScheduleStatus.valueOf(request.getStatus())
                        : TourSchedule.ScheduleStatus.ACTIVE)
                .departureLocation(request.getDepartureLocation())
                .returnLocation(request.getReturnLocation())
                .build();
    }

    public void updateEntity(TourSchedule schedule, TourScheduleRequest request) {
        schedule.setDepartureDate(request.getDepartureDate());
        schedule.setReturnDate(request.getReturnDate());
        schedule.setDepartureTime(request.getDepartureTime());
        schedule.setReturnTime(request.getReturnTime());
        schedule.setAvailableSeats(request.getAvailableSeats());

        if (request.getStatus() != null) {
            schedule.setStatus(TourSchedule.ScheduleStatus.valueOf(request.getStatus()));
        }

        schedule.setDepartureLocation(request.getDepartureLocation());
        schedule.setReturnLocation(request.getReturnLocation());
    }

    public TourScheduleResponse toResponse(TourSchedule schedule) {
        return TourScheduleResponse.builder()
                .id(schedule.getId())
                .tourId(schedule.getTour().getId())
                .departureDate(schedule.getDepartureDate())
                .returnDate(schedule.getReturnDate())
                .departureTime(schedule.getDepartureTime())
                .returnTime(schedule.getReturnTime())
                .availableSeats(schedule.getAvailableSeats())
                .status(schedule.getStatus().name())
                .departureLocation(schedule.getDepartureLocation())
                .returnLocation(schedule.getReturnLocation())
                .build();
    }
}