package com.longne.tourapplication.service;

import com.longne.tourapplication.Mapper.TourMapper;
import com.longne.tourapplication.dto.PageResponse;
import com.longne.tourapplication.dto.TourRequest;
import com.longne.tourapplication.dto.TourResponse;
import com.longne.tourapplication.entity.Booking;
import com.longne.tourapplication.entity.Category;
import com.longne.tourapplication.entity.Tour;
import com.longne.tourapplication.entity.TourSchedule;
import com.longne.tourapplication.repository.BookingRepository;
import com.longne.tourapplication.repository.CategoryRepository;
import com.longne.tourapplication.repository.TourRepository;
import com.longne.tourapplication.repository.TourScheduleRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class TourService {

    private final TourRepository tourRepository;
    private final TourMapper tourMapper;
    private final CategoryRepository categoryRepository;
    private final TourScheduleRepository tourScheduleRepository;
    private final BookingRepository bookingRepository;
    @CacheEvict(value = "tour_list", allEntries = true)
    public TourResponse createTour(TourRequest tourRequest) {

        Category category = categoryRepository.findById(tourRequest.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));


        Tour tour = tourMapper.toEntity(tourRequest);
        tour.setCategory(category);
        Tour newTour = tourRepository.save(tour);
        return tourMapper.toTourResponse(newTour);
    }
    @Transactional(readOnly = true)
    @Cacheable(value = "tour_detail", key = "#idTour")
    public TourResponse getTourById(Long idTour) {
        return tourRepository.findById(idTour)
                .map(tourMapper::toTourResponse)
                .orElseThrow(() -> new RuntimeException("Tour không tồn tại"));
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "tour_list", key = "'all'")
    public List<TourResponse> getAllTours() {
        List<Tour> tours = tourRepository.findAll();
        return tourMapper.toDtoList(tours);
    }

    @Transactional(readOnly = true)
    public Page<TourResponse> getAllToursWithPagination(Pageable pageable) {
        Page<Tour> tourPage = tourRepository.findAll(pageable);
        return tourPage.map(tourMapper::toTourResponse);
    }
    @Caching(evict = {
            @CacheEvict(value = "tour_detail", key = "#idTour"),
            @CacheEvict(value = "tour_list", allEntries = true)
    })
    public TourResponse updateTour(Long idTour, TourRequest tourRequest) {
        Tour existingTour = tourRepository.findById(idTour)
                .orElseThrow(() -> new RuntimeException("Tour không tồn tại"));
        if (!existingTour.getCategory().getId().equals(tourRequest.getCategoryId())) {
            Category category = categoryRepository.findById(tourRequest.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category không tồn tại"));

            if (!category.getIsActive()) {
                throw new RuntimeException("Category đã bị vô hiệu hóa");
            }
            existingTour.setCategory(category);
        }

        tourMapper.updateTourFromRequest(tourRequest, existingTour);
        Tour updatedTour = tourRepository.save(existingTour);
        return tourMapper.toTourResponse(updatedTour);
    }
    @Caching(evict = {
            @CacheEvict(value = "tour_detail", key = "#idTour"),
            @CacheEvict(value = "tour_list", allEntries = true)
    })
    public void deleteTour(Long idTour) {
        if (!tourRepository.existsById(idTour)) {
            throw new RuntimeException("Tour không tồn tại");
        }
        tourRepository.deleteById(idTour);
    }


    @Cacheable(value = "tour_list")
    public PageResponse<TourResponse> searchTours(
            String keyword, Long categoryId,
            BigDecimal minPrice, BigDecimal maxPrice,
            Integer minDuration, Integer maxDuration,
            LocalDate startDateFrom, LocalDate startDateTo,
            Pageable pageable
    ) {
        Specification<Tour> spec = Specification.where(null);

        if (keyword != null) {
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("name")), "%" + keyword.toLowerCase() + "%"),
                    cb.like(cb.lower(root.get("description")), "%" + keyword.toLowerCase() + "%")
            ));
        }
        if (categoryId != null) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("category").get("id"), categoryId));
        }
        if (minPrice != null) {
            spec = spec.and((root, query, cb) ->
                    cb.greaterThanOrEqualTo(root.get("price"), minPrice));
        }
        if (maxPrice != null) {
            spec = spec.and((root, query, cb) ->
                    cb.lessThanOrEqualTo(root.get("price"), maxPrice));
        }
        if (minDuration != null) {
            spec = spec.and((root, query, cb) ->
                    cb.greaterThanOrEqualTo(root.get("duration"), minDuration));
        }
        if (maxDuration != null) {
            spec = spec.and((root, query, cb) ->
                    cb.lessThanOrEqualTo(root.get("duration"), maxDuration));
        }
        if (startDateFrom != null) {
            spec = spec.and((root, query, cb) ->
                    cb.greaterThanOrEqualTo(root.get("startDate"), startDateFrom));
        }
        if (startDateTo != null) {
            spec = spec.and((root, query, cb) ->
                    cb.lessThanOrEqualTo(root.get("startDate"), startDateTo));
        }

        Page<Tour> pageResult = tourRepository.findAll(spec, pageable);

        List<TourResponse> tourResponses = pageResult.getContent().stream()
                .map(tourMapper::toTourResponse)
                .toList();

        return PageResponse.<TourResponse>builder()
                .content(tourResponses)
                .pageNumber(pageResult.getNumber())
                .pageSize(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .last(pageResult.isLast())
                .build();
    }

    @Cacheable(value = "tour_list", key = "'cat_' + #categoryId + '_' + #pageable.pageNumber")
    public Page<TourResponse> findByCategoryId(Long categoryId, Pageable pageable) {
        return tourRepository.findByCategoryId(categoryId, pageable)
                .map(tourMapper::toTourResponse);
    }

    @Cacheable(value = "tour_list", key = "'price_' + #min + '_' + #max")
    public List<TourResponse> findByPriceBetween(BigDecimal min, BigDecimal max) {
        return tourRepository.findByPriceBetween(min, max).stream()
                .map(tourMapper::toTourResponse)
                .toList();
    }

    @Cacheable(value = "tour_list", key = "'duration_' + #days")
    public List<TourResponse> findByDurationDays(Integer days) {
        return tourRepository.findByDuration(days).stream()
                .map(tourMapper::toTourResponse)
                .toList();
    }

    public Map<String, Integer> getTourBookingStats(Long tourId){
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new RuntimeException("Tour không tồn tại"));

        List<TourSchedule> schedules = tourScheduleRepository.findByTourId(tourId);

        List<Long> scheduleIds = schedules.stream()
                .map(TourSchedule::getId)
                .toList();

        List<Booking> bookings = bookingRepository.findAllByTourScheduleIdInAndStatusAndPaymentStatus(
                scheduleIds,
                Booking.BookingStatus.CONFIRMED,
                Booking.PaymentStatus.SUCCESS
        );

        int totalBooked = bookings.stream()
                .mapToInt(b -> b.getNumAdults() + b.getNumChildren() + b.getNumInfants())
                .sum();

        Map<String, Integer> stats = new HashMap<>();
        stats.put("booked", totalBooked);
        stats.put("available", tour.getAvailableSeats());
        return stats;
    }

    @Cacheable(value = "tour_list", key = "'cat_name_' + #categoryName")
    public List<TourResponse> getToursByCategoryName(String categoryName) {
        Category category = categoryRepository.findByName(categoryName)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        List<Tour> tours = tourRepository.findByCategoryId(category.getId());
        return tourMapper.toDtoList(tours);
    }
}