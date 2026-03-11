package com.longne.tourapplication.repository;

import com.longne.tourapplication.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByBookingCode(String bookingCode);

    List<Booking> findByUserId(Long userId);

    List<Booking> findAllByTourScheduleIdInAndStatusAndPaymentStatus(
            List<Long> scheduleIds,
            Booking.BookingStatus status,
            Booking.PaymentStatus paymentStatus
    );

    @Query("SELECT YEAR(b.bookingDate) as year, MONTH(b.bookingDate) as month, SUM(b.finalPrice) as revenue " +
            "FROM Booking b " +
            "WHERE b.status = 'CONFIRMED' AND b.paymentStatus = 'SUCCESS' " +
            "GROUP BY YEAR(b.bookingDate), MONTH(b.bookingDate) " +
            "ORDER BY year DESC, month DESC")
    List<Object[]> getMonthlyRevenueStats();

    @Query("SELECT YEAR(b.bookingDate) as year, SUM(b.finalPrice) as revenue " +
            "FROM Booking b " +
            "WHERE b.status = 'CONFIRMED' AND b.paymentStatus = 'SUCCESS' " +
            "GROUP BY YEAR(b.bookingDate) " +
            "ORDER BY year DESC")
    List<Object[]> getYearlyRevenueStats();

    @Query("SELECT b FROM Booking b LEFT JOIN FETCH b.tour LEFT JOIN FETCH b.tourSchedule WHERE b.bookingCode = :bookingCode")
    Optional<Booking> findByBookingCodeWithTourAndSchedule(@Param("bookingCode") String bookingCode);
}
