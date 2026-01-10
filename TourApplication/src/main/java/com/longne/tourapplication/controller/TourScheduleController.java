package com.longne.tourapplication.controller;


import com.longne.tourapplication.dto.TourScheduleRequest;
import com.longne.tourapplication.dto.TourScheduleResponse;
import com.longne.tourapplication.service.TourScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tour-schedules")
@RequiredArgsConstructor
public class TourScheduleController {

    private final TourScheduleService tourScheduleService;

    @GetMapping("/tour/{tourId}")
    public ResponseEntity<List<TourScheduleResponse>> getSchedulesByTour(@PathVariable Long tourId) {
        List<TourScheduleResponse> schedules = tourScheduleService.getAvailableSchedules(tourId);
        return ResponseEntity.ok(schedules);
    }

    @GetMapping("/tour/{tourId}/all")
    public ResponseEntity<List<TourScheduleResponse>> getAllSchedulesByTour(@PathVariable Long tourId) {
        List<TourScheduleResponse> schedules = tourScheduleService.getAllSchedulesByTour(tourId);
        return ResponseEntity.ok(schedules);
    }

    @PostMapping
    public ResponseEntity<TourScheduleResponse> createSchedule(@RequestBody TourScheduleRequest request) {
        return ResponseEntity.ok(tourScheduleService.createSchedule(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TourScheduleResponse> updateSchedule(
            @PathVariable Long id,
            @RequestBody TourScheduleRequest request) {
        return ResponseEntity.ok(tourScheduleService.updateSchedule(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSchedule(@PathVariable Long id) {
        tourScheduleService.deleteSchedule(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TourScheduleResponse> getScheduleById(@PathVariable Long id) {
        return ResponseEntity.ok(tourScheduleService.getScheduleById(id));
    }
}
