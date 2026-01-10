package com.longne.tourapplication.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private String bookingCode;

    private Long userId;
    private String userName;

    private Long tourId;
    private String tourName;

    private Long tourScheduleId;
    private LocalDate departureDate;
    private LocalDate returnDate;

    private LocalDateTime bookingDate;

    private Integer numAdults;
    private Integer numChildren;
    private Integer numInfants;
    private Integer numSingleRooms;

    private BigDecimal adultPrice;
    private BigDecimal childPrice;
    private BigDecimal infantPrice;
    private BigDecimal singleRoomSurcharge;

    private BigDecimal totalPrice;
    private BigDecimal finalPrice;

    private String status;
    private String paymentStatus;

    private String paymentUrl;

    private String customerNotes;
    private String adminNotes;
    private String contactName;
    private String contactEmail;
    private String contactPhone;

    private List<ParticipantResponse> participants;

    @Data
    @Builder
    public static class ParticipantResponse {
        private Long id;
        private String fullName;
        private LocalDate dateOfBirth;
        private String gender;
        private String participantType;
        private String roomType;
    }
}
