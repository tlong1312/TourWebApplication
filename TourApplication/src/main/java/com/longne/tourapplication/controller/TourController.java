package com.longne.tourapplication.controller;

import com.longne.tourapplication.dto.PageResponse;
import com.longne.tourapplication.dto.TourRequest;
import com.longne.tourapplication.dto.TourResponse;
import com.longne.tourapplication.service.TourService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/tour")
@RequiredArgsConstructor
public class TourController {
    private final TourService tourService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TourResponse> createTour(@Valid @RequestBody TourRequest tourRequest) {
        TourResponse createdTour = tourService.createTour(tourRequest);
        return new ResponseEntity<>(createdTour, HttpStatus.CREATED);
    }

    @GetMapping("/{idTour}")
    public ResponseEntity<TourResponse> getTourById(@PathVariable Long idTour) {
        TourResponse tourResponse = tourService.getTourById(idTour);
        return ResponseEntity.ok(tourResponse);
    }

    @GetMapping
    public ResponseEntity<?> getAllTours(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        // TRƯỜNG HỢP 1: CÓ PHÂN TRANG (Dùng cho trang Listing/Search)
        if (page != null && size != null) {
            // 1. Xử lý hướng sắp xếp (ASC/DESC)
            Sort.Direction direction = sortDir.equalsIgnoreCase("asc")
                    ? Sort.Direction.ASC
                    : Sort.Direction.DESC;
            Sort sort = Sort.by(direction, sortBy);

            int pageNo = Math.max(0, page);
            Pageable pageable = PageRequest.of(pageNo, size, sort);

            return ResponseEntity.ok(tourService.getAllToursWithPagination(pageable));
        }

        // TRƯỜNG HỢP 2: KHÔNG PHÂN TRANG (Dùng cho Dropdown, Homepage)
        return ResponseEntity.ok(tourService.getAllTours());
    }

    //UPDATED
    @PutMapping("/{idTour}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TourResponse> updateTour(
            @PathVariable Long idTour,
            @Valid @RequestBody TourRequest tourRequest) {
        TourResponse updatedTour = tourService.updateTour(idTour, tourRequest);
        return ResponseEntity.ok(updatedTour);
    }

    // DELETE
    @DeleteMapping("/{idTour}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteTour(@PathVariable Long idTour) {
        tourService.deleteTour(idTour);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Xóa tour thành công");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<PageResponse<TourResponse>> searchTours(
            @RequestParam(required = false) String keyword,          // Tìm theo tên/mô tả
            @RequestParam(required = false) Long categoryId,         // Lọc theo danh mục
            @RequestParam(required = false) BigDecimal minPrice,     // Giá tối thiểu
            @RequestParam(required = false) BigDecimal maxPrice,     // Giá tối đa
            @RequestParam(required = false) Integer minDuration,     // Số ngày tối thiểu
            @RequestParam(required = false) Integer maxDuration,     // Số ngày tối đa
            @RequestParam(required = false) LocalDate startDateFrom, // Khởi hành từ
            @RequestParam(required = false) LocalDate startDateTo,   // Khởi hành đến
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        PageResponse<TourResponse> tours = tourService.searchTours(
                keyword, categoryId, minPrice, maxPrice,
                minDuration, maxDuration, startDateFrom, startDateTo,
                PageRequest.of(page, size, sort)
        );
        return ResponseEntity.ok(tours);
    }

    // Lọc nhanh theo giá
    @GetMapping("/filter/price-range")
    public ResponseEntity<List<TourResponse>> filterByPriceRange(
            @RequestParam BigDecimal min,
            @RequestParam BigDecimal max
    ) {
        return ResponseEntity.ok(tourService.findByPriceBetween(min, max));
    }

    // Lọc theo duration
    @GetMapping("/filter/duration")
    public ResponseEntity<List<TourResponse>> filterByDuration(
            @RequestParam Integer days
    ) {
        return ResponseEntity.ok(tourService.findByDurationDays(days));
    }

    @GetMapping("/{tourId}/booking-stats")
    public ResponseEntity<Map<String, Integer>> getTourBookingStats(@PathVariable Long tourId) {
        Map<String, Integer> stats = tourService.getTourBookingStats(tourId);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/by-category")
    public ResponseEntity<List<TourResponse>> getToursByCategoryName(@RequestParam String categoryName) {
        List<TourResponse> tours = tourService.getToursByCategoryName(categoryName);
        return ResponseEntity.ok(tours);
    }
}
