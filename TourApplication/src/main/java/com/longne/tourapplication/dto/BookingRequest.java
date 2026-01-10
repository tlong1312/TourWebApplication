package com.longne.tourapplication.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequest {
    private Long tourId;
    private Long tourScheduleId;

    private Integer numAdults;
    private Integer numChildren;
    private Integer numInfants;
    private Integer numSingleRooms;

    private String customerNotes;

    private String contactName;
    private String contactEmail;
    private String contactPhone;
    private String contactAddress;

    private List<ParticipantInfo> participants;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParticipantInfo {
        private String fullName;
        private String dateOfBirth; // yyyy-MM-dd
        private String gender; // MALE, FEMALE, OTHER
        private String participantType; // ADULT, CHILD, INFANT
        private String roomType; // SINGLE, DOUBLE
    }
}
