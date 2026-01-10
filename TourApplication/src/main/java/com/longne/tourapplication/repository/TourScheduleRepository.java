package com.longne.tourapplication.repository;

import com.longne.tourapplication.entity.TourSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TourScheduleRepository extends JpaRepository<TourSchedule, Long> {
    List<TourSchedule> findByTourIdAndStatusAndDepartureDateGreaterThanEqual(
            Long tourId,
            TourSchedule.ScheduleStatus status,
            LocalDate date
    );
    List<TourSchedule> findByTourId(Long tourId);
}
