package com.longne.tourapplication.repository;
import com.longne.tourapplication.entity.Tour;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TourRepository extends JpaRepository<Tour, Long>, JpaSpecificationExecutor<Tour> {
    List<Tour> findByName(String name);
    List<Tour> findByStartDate(LocalDate startDate);
    Page<Tour> findByCategoryId(Long categoryId, Pageable pageable);

    List<Tour> findByCategoryId(Long categoryId);

    List<Tour> findByPriceBetween(BigDecimal min, BigDecimal max);

    List<Tour> findByDuration(Integer days);

    @Query("SELECT t FROM Tour t " +
            "LEFT JOIN FETCH t.category " +
            "LEFT JOIN FETCH t.itineraries " +
            "WHERE t.status = 'ACTIVE'")
    List<Tour> findAllWithItineraries();

    @Query(value = """
        SELECT t.* 
        FROM tours t
        LEFT JOIN bookings b ON b.tour_id = t.id 
            AND b.status IN ('CONFIRMED', 'COMPLETED')
        WHERE t.status = 'ACTIVE'
        GROUP BY t.id
        ORDER BY COUNT(b.id) DESC, t.created_at DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<Tour> findTopPopularTours(@Param("limit") int limit);

    @Query(value = """
        SELECT t.*, COUNT(b.id) as booking_count
        FROM tours t
        LEFT JOIN bookings b ON b.tour_id = t.id
        GROUP BY t.id
        ORDER BY booking_count DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<Tour> findPopularToursWithCount(@Param("limit") int limit);
}
