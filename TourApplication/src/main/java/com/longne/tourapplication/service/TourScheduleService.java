package com.longne.tourapplication.service;

import com.longne.tourapplication.Mapper.TourScheduleMapper;
import com.longne.tourapplication.dto.TourScheduleRequest;
import com.longne.tourapplication.dto.TourScheduleResponse;
import com.longne.tourapplication.entity.Tour;
import com.longne.tourapplication.entity.TourSchedule;
import com.longne.tourapplication.repository.TourRepository;
import com.longne.tourapplication.repository.TourScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TourScheduleService {
    private final TourScheduleRepository tourScheduleRepository;
    private final TourScheduleMapper tourScheduleMapper;
    private final TourRepository tourRepository;

    public List<TourScheduleResponse> getAvailableSchedules(Long tourId) {
        List<TourSchedule> schedules = tourScheduleRepository
                .findByTourIdAndStatusAndDepartureDateGreaterThanEqual(
                        tourId,
                        TourSchedule.ScheduleStatus.ACTIVE,
                        LocalDate.now()
                );

        return schedules.stream()
                .map(tourScheduleMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<TourScheduleResponse> getAllSchedulesByTour(Long tourId) {
        List<TourSchedule> schedules = tourScheduleRepository.findByTourId(tourId);
        return schedules.stream()
                .map(tourScheduleMapper::toResponse)
                .collect(Collectors.toList());
    }

    public TourScheduleResponse createSchedule(TourScheduleRequest request) {
        if (request.getDepartureDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Ngày khởi hành phải từ hôm nay trở đi");
        }

        if (request.getReturnDate().isBefore(request.getDepartureDate())) {
            throw new RuntimeException("Ngày về phải sau ngày khởi hành");
        }

        Tour tour = tourRepository.findById(request.getTourId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tour"));
        List<TourSchedule> schedules = tourScheduleRepository.findByTourId(request.getTourId());
        int currentTotalSeats = schedules.stream()
                .mapToInt(TourSchedule::getAvailableSeats)
                .sum();
        int newTotalSeats = currentTotalSeats + request.getAvailableSeats();
        if (newTotalSeats > tour.getAvailableSeats()) {
            throw new RuntimeException("Tổng số chỗ của các lịch trình vượt quá sức chứa tối đa của tour (" + tour.getAvailableSeats() + ")");
        }

        TourSchedule schedule = tourScheduleMapper.toEntity(request);
        TourSchedule saved = tourScheduleRepository.save(schedule);
        return tourScheduleMapper.toResponse(saved);
    }

    public TourScheduleResponse updateSchedule(Long id, TourScheduleRequest request) {
        TourSchedule schedule = tourScheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch khởi hành"));

        Tour tour = schedule.getTour();
        List<TourSchedule> schedules = tourScheduleRepository.findByTourId(tour.getId());
        int otherSchedulesSeats = schedules.stream()
                        .filter(s -> !s.getId().equals(id))
                                .mapToInt(TourSchedule::getAvailableSeats)
                                        .sum();
        int newTotalSeats = otherSchedulesSeats + request.getAvailableSeats();
        if (newTotalSeats > tour.getAvailableSeats()) {
            throw new RuntimeException("Tổng số chỗ của các lịch trình vượt quá sức chứa tối đa của tour (" + tour.getAvailableSeats() + ")");
        }

        tourScheduleMapper.updateEntity(schedule, request);
        TourSchedule updated = tourScheduleRepository.save(schedule);
        return tourScheduleMapper.toResponse(updated);
    }

    public void deleteSchedule(Long id) {
        if (!tourScheduleRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy lịch khởi hành");
        }
        tourScheduleRepository.deleteById(id);
    }

    public TourScheduleResponse getScheduleById(Long id) {
        TourSchedule schedule = tourScheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch khởi hành"));
        return tourScheduleMapper.toResponse(schedule);
    }
}
