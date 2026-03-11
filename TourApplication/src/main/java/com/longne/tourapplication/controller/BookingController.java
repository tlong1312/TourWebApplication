package com.longne.tourapplication.controller;

import com.longne.tourapplication.dto.*;
import com.longne.tourapplication.service.BookingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    @Value("${app.frontend.url}")
    private String frontendUrl;

    private final BookingService bookingService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingResponse> createBooking(
            @RequestBody BookingRequest request,
            HttpServletRequest httpRequest) {
        BookingResponse response = bookingService.createBooking(request, httpRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/vnpay-return")
    public void vnpayReturn(@RequestParam Map<String, String> params, HttpServletResponse response) throws IOException {
        // Xử lý thanh toán (cập nhật booking, transaction...)
        bookingService.handleVNPayReturn(params);

        // Chuyển hướng về frontend với tất cả query params từ VNPAY
        String queryString = params.entrySet().stream()
                .map(e -> e.getKey() + "=" + URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8))
                .collect(Collectors.joining("&"));

        String redirectUrl = frontendUrl + "/vnpay-return?" + queryString;
        response.sendRedirect(redirectUrl);
    }

    @GetMapping("/my-bookings")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BookingResponse>> getMyBookings() {
        List<BookingResponse> bookings = bookingService.getUserBookings();
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/{bookingCode}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingResponse> getBookingByCode(@PathVariable String bookingCode) {
        BookingResponse booking = bookingService.getBookingByCode(bookingCode);
        return ResponseEntity.ok(booking);
    }

    @GetMapping("/revenue/monthly")
    public ResponseEntity<List<MonthlyRevenueDTO>> getMonthlyRevenueStats() {
        return ResponseEntity.ok(bookingService.getMonthlyRevenueStats());
    }

    @GetMapping("/revenue/yearly")
    public ResponseEntity<List<YearlyRevenueDTO>> getYearlyRevenueStats() {
        return ResponseEntity.ok(bookingService.getYearlyRevenueStats());
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        List<BookingResponse> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(bookings);
    }

    @PutMapping("/{bookingCode}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> updateBookingStatus(
            @PathVariable String bookingCode,
            @RequestBody UpdateBookingStatusRequest request
    ) {
        try {
            bookingService.updateBookingStatus(bookingCode, request.getStatus());
            return ResponseEntity.ok(Map.of("message", "Update status thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Update status thất bại"));
        }
    }

    @PutMapping("/{bookingCode}/admin-notes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> updateAdminNotes(
            @PathVariable String bookingCode,
            @RequestBody UpdateBookingAdminNotesRequest request
    ) {
        try {
            bookingService.updateAdminNotes(bookingCode, request.getAdminNotes());
            return ResponseEntity.ok(Map.of("message", "Update note thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Update note thất bại"));
        }
    }

    @DeleteMapping("/{bookingCode}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteBooking(@PathVariable String bookingCode) {
        try {
            bookingService.deleteBooking(bookingCode);
            return ResponseEntity.ok(Map.of("message", "Xóa booking thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Xóa booking thất bại"));
        }
    }
}
