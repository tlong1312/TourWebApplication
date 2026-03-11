package com.longne.tourapplication.service;

import com.longne.tourapplication.dto.BookingRequest;
import com.longne.tourapplication.dto.BookingResponse;
import com.longne.tourapplication.dto.MonthlyRevenueDTO;
import com.longne.tourapplication.dto.YearlyRevenueDTO;
import com.longne.tourapplication.entity.*;
import com.longne.tourapplication.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final TourRepository tourRepository;
    private final TourScheduleRepository tourScheduleRepository;
    private final UserRepository userRepository;
    private final VNPayService vnPayService;
    private final TransactionRepository transactionRepository;
    private final RedissonClient redissonClient;
    private final RabbitTemplate rabbitTemplate;

    public BookingResponse createBooking(BookingRequest request, HttpServletRequest httpRequest) {
        String lockKey = "bookingLock:" +request.getTourScheduleId();
        RLock lock = redissonClient.getLock(lockKey);
        try{
            boolean isLocked = lock.tryLock(5, 10, TimeUnit.SECONDS);
            if (isLocked){
                User user = getCurrentUser();

                Tour tour = tourRepository.findById(request.getTourId())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy tour với ID: " + request.getTourId()));
                TourSchedule schedule = tourScheduleRepository.findById(request.getTourScheduleId())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch khởi hành"));

                int totalParticipants = request.getNumAdults() + request.getNumChildren() + request.getNumInfants();
                if (schedule.getAvailableSeats() < totalParticipants) {
                    throw new RuntimeException("Không đủ chỗ trống. Chỉ còn " + schedule.getAvailableSeats() + " chỗ");
                }

                if (request.getNumAdults() < 1) {
                    throw new RuntimeException("Phải có ít nhất 1 người lớn");
                }

                BigDecimal totalPrice = calculateTotalPrice(
                        tour,
                        request.getNumAdults(),
                        request.getNumChildren(),
                        request.getNumInfants(),
                        request.getNumSingleRooms()
                );

                Booking booking = Booking.builder()
                        .bookingCode(generateBookingCode())
                        .user(user)
                        .tour(tour)
                        .tourSchedule(schedule)
                        .bookingDate(LocalDateTime.now())
                        .numAdults(request.getNumAdults())
                        .numChildren(request.getNumChildren())
                        .numInfants(request.getNumInfants())
                        .numSingleRooms(request.getNumSingleRooms())
                        .adultPrice(tour.getAdultPrice())
                        .childPrice(tour.getChildPrice())
                        .infantPrice(tour.getInfantPrice())
                        .singleRoomSurcharge(tour.getSingleRoomSurcharge())
                        .totalPrice(totalPrice)
                        .finalPrice(totalPrice)
                        .status(Booking.BookingStatus.PENDING)
                        .paymentStatus(Booking.PaymentStatus.PENDING)
                        .customerNotes(request.getCustomerNotes())
                        .contactName(request.getContactName())
                        .contactEmail(request.getContactEmail())
                        .contactPhone(request.getContactPhone())
                        .contactAddress(request.getContactAddress())
                        .build();

                if(request.getParticipants() != null && !request.getParticipants().isEmpty()) {
                    List<BookingParticipant> participants = request.getParticipants().stream()
                            .map(p -> BookingParticipant.builder()
                                    .booking(booking)
                                    .fullName(p.getFullName())
                                    .dateOfBirth(LocalDate.parse(p.getDateOfBirth()))
                                    .gender(BookingParticipant.Gender.valueOf(p.getGender().toUpperCase()))
                                    .participantType(BookingParticipant.ParticipantType.valueOf(p.getParticipantType().toUpperCase()))
                                    .roomType(BookingParticipant.RoomType.valueOf(p.getRoomType().toUpperCase()))
                                    .build())
                            .collect(Collectors.toList());
                    participants.forEach(booking::addParticipant);
                }

                Booking savedBooking = bookingRepository.save(booking);
                log.info("Đã tạo booking: {}", savedBooking.getBookingCode());

                Transaction transaction = Transaction.builder()
                        .transactionCode(savedBooking.getBookingCode())
                        .booking(savedBooking)
                        .type(Transaction.TransactionType.PAYMENT)
                        .amount(totalPrice)
                        .status(Transaction.TransactionStatus.PENDING)
                        .transactionDate(LocalDateTime.now())
                        .description("Thanh toán cho booking: " + savedBooking.getBookingCode())
                        .build();
                transactionRepository.save(transaction);

                String emailMessage = "CONFIRM|" + savedBooking.getBookingCode();
                rabbitTemplate.convertAndSend("email_sending_queue", emailMessage);

                String ipAddress = getClientIpAddress(httpRequest);
                String paymentUrl = vnPayService.createPaymentUrl(
                        savedBooking.getBookingCode(),
                        totalPrice.longValue(),
                        "Thanh toan tour " + tour.getName(),
                        ipAddress
                );
                log.info("Generated VNPay URL: {}", paymentUrl);
                return mapToResponse(savedBooking, paymentUrl);
            }else {
                throw new RuntimeException("Hệ thống đang bận, vui lòng thử lại!");
            }
        }catch (InterruptedException e){
            Thread.currentThread().interrupt();
            throw new RuntimeException("Lỗi hệ thống khi xử lý đặt vé (Interrupted)");
        }finally {
            if (lock.isHeldByCurrentThread()){
                lock.unlock();
            }
        }
    }

    @Caching(evict = {
            @CacheEvict(value = "tour_detail", key = "#result.tourId"),
            @CacheEvict(value = "tour_list", allEntries = true)
    })
    public BookingResponse handleVNPayReturn(Map<String, String> params) {
        if(!vnPayService.verifyPayment(params)) {
            throw new RuntimeException("Chữ ký không hợp lệ");
        }

        String bookingCode = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");

        Booking booking = bookingRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy booking"));

        Transaction transaction = transactionRepository.findByBookingId(booking.getId()).stream()
                .filter(t -> t.getType() == Transaction.TransactionType.PAYMENT && t.getStatus() == Transaction.TransactionStatus.PENDING)
                .findFirst().orElse(null);

        if("00".equals(responseCode)) {
            booking.setPaymentStatus(Booking.PaymentStatus.SUCCESS);
            booking.setStatus(Booking.BookingStatus.CONFIRMED);

            TourSchedule schedule = booking.getTourSchedule();
            int totalParticipants = booking.getNumAdults() + booking.getNumChildren() + booking.getNumInfants();
            schedule.setAvailableSeats(schedule.getAvailableSeats() - totalParticipants);

            if(schedule.getAvailableSeats() <= 0) {
                schedule.setStatus(TourSchedule.ScheduleStatus.FULL);
            }

            bookingRepository.save(booking);

            if (transaction != null) {
                transaction.setStatus(Transaction.TransactionStatus.SUCCESS);
                transaction.setExternalTransactionId(params.get("vnp_TransactionNo"));
                transactionRepository.save(transaction);
            }

            log.info("Thanh toán thành công cho booking: {}", bookingCode);

            String emailMessage = "SUCCESS|" + bookingCode;
            rabbitTemplate.convertAndSend("email_sending_queue", emailMessage);
        } else {
            booking.setPaymentStatus(Booking.PaymentStatus.FAILED);
            booking.setStatus(Booking.BookingStatus.CANCELLED);
            bookingRepository.save(booking);
            if (transaction != null) {
                transaction.setStatus(Transaction.TransactionStatus.FAILED);
                transactionRepository.save(transaction);
            }
            log.warn("Thanh toán thất bại cho booking: {}, Response code: {}", bookingCode, responseCode);
            String emailMessage = "FAILED|" + bookingCode;
            rabbitTemplate.convertAndSend("email_sending_queue", emailMessage);
        }
        return mapToResponse(booking, null);
    }

    private BigDecimal calculateTotalPrice(Tour tour, int numAdults, int numChildren, int numInfants, int numSingleRooms) {
        BigDecimal total = BigDecimal.ZERO;

        if (numAdults > 0) {
            total = total.add(tour.getAdultPrice().multiply(BigDecimal.valueOf(numAdults)));
        }

        if (numChildren > 0 && tour.getChildPrice() != null) {
            total = total.add(tour.getChildPrice().multiply(BigDecimal.valueOf(numChildren)));
        }

        if (numInfants > 0 && tour.getInfantPrice() != null) {
            total = total.add(tour.getInfantPrice().multiply(BigDecimal.valueOf(numInfants)));
        }

        if (numSingleRooms > 0 && tour.getSingleRoomSurcharge() != null) {
            total = total.add(tour.getSingleRoomSurcharge().multiply(BigDecimal.valueOf(numSingleRooms)));
        }

        return total;
    }

    private String generateBookingCode() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        return "TRV" + timestamp;
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }

    private BookingResponse mapToResponse(Booking booking, String paymentUrl) {
        List<BookingResponse.ParticipantResponse> participants = booking.getParticipants().stream()
                .map(p -> BookingResponse.ParticipantResponse.builder()
                        .id(p.getId())
                        .fullName(p.getFullName())
                        .dateOfBirth(p.getDateOfBirth())
                        .gender(p.getGender().name())
                        .participantType(p.getParticipantType().name())
                        .roomType(p.getRoomType().name())
                        .build())
                .collect(Collectors.toList());

        return BookingResponse.builder()
                .id(booking.getId())
                .bookingCode(booking.getBookingCode())
                .userId(booking.getUser().getId())
                .userName(booking.getUser().getFullName())
                .tourId(booking.getTour().getId())
                .tourName(booking.getTour().getName())
                .tourScheduleId(booking.getTourSchedule().getId())
                .departureDate(booking.getTourSchedule().getDepartureDate())
                .returnDate(booking.getTourSchedule().getReturnDate())
                .bookingDate(booking.getBookingDate())
                .numAdults(booking.getNumAdults())
                .numChildren(booking.getNumChildren())
                .numInfants(booking.getNumInfants())
                .numSingleRooms(booking.getNumSingleRooms())
                .adultPrice(booking.getAdultPrice() != null ? booking.getAdultPrice() : BigDecimal.ZERO)
                .childPrice(booking.getChildPrice() != null ? booking.getChildPrice() : BigDecimal.ZERO)
                .infantPrice(booking.getInfantPrice() != null ? booking.getInfantPrice() : BigDecimal.ZERO)
                .singleRoomSurcharge(booking.getSingleRoomSurcharge() != null ? booking.getSingleRoomSurcharge() : BigDecimal.ZERO)
                .totalPrice(booking.getTotalPrice())
                .finalPrice(booking.getFinalPrice())
                .status(booking.getStatus().name())
                .paymentStatus(booking.getPaymentStatus().name())
                .paymentUrl(paymentUrl)
                .customerNotes(booking.getCustomerNotes())
                .adminNotes(booking.getAdminNotes())
                .contactName(booking.getContactName())
                .contactEmail(booking.getContactEmail())
                .contactPhone(booking.getContactPhone())
                .participants(participants)
                .build();
    }

    public List<BookingResponse> getUserBookings() {
        User user = getCurrentUser();
        List<Booking> bookings = bookingRepository.findByUserId(user.getId());
        return bookings.stream()
                .map(b -> mapToResponse(b, null))
                .collect(Collectors.toList());
    }

    public BookingResponse getBookingByCode(String bookingCode) {
        Booking booking = bookingRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy booking"));
        return mapToResponse(booking, null);
    }

    @Cacheable(value = "revenue_stats", key = "'monthly'")
    public List<MonthlyRevenueDTO> getMonthlyRevenueStats(){
        List<Object[]> results = bookingRepository.getMonthlyRevenueStats();
        List<MonthlyRevenueDTO> monthlyRevenueDTOS = new ArrayList<>();
        for(Object[] row : results){
            MonthlyRevenueDTO dto = new MonthlyRevenueDTO();
            dto.setYear((Integer) row[0]);
            dto.setMonth((Integer) row[1]);
            dto.setRevenue((BigDecimal) row[2]);
            monthlyRevenueDTOS.add(dto);
        }
        return monthlyRevenueDTOS;
    }

    @Cacheable(value = "revenue_stats", key = "'yearly'")
    public List<YearlyRevenueDTO> getYearlyRevenueStats() {
        List<Object[]> results = bookingRepository.getYearlyRevenueStats();
        List<YearlyRevenueDTO> yearlyRevenueDTOS = new ArrayList<>();
        for (Object[] row : results) {
            YearlyRevenueDTO dto = new YearlyRevenueDTO();
            dto.setYear((Integer) row[0]);
            dto.setRevenue((BigDecimal) row[1]);
            yearlyRevenueDTOS.add(dto);
        }
        return yearlyRevenueDTOS;
    }

    public List<BookingResponse> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAll();
        return bookings.stream()
                .map(b -> mapToResponse(b, null))
                .collect(Collectors.toList());
    }

    public void updateBookingStatus(String bookingCode, String status) {
        Booking booking = bookingRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy booking"));
        booking.setStatus(Booking.BookingStatus.valueOf(status));
        bookingRepository.save(booking);
    }

    public void updateAdminNotes(String bookingCode, String adminNotes) {
        Booking booking = bookingRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy booking"));
        booking.setAdminNotes(adminNotes);
        bookingRepository.save(booking);
    }

    public void deleteBooking(String bookingCode) {
        Booking booking = bookingRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy booking"));
        bookingRepository.delete(booking);
    }
}
