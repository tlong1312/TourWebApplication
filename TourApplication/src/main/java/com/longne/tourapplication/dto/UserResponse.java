package com.longne.tourapplication.dto;

import lombok.Data;

@Data
public class UserResponse {
    private Long id;
    private String email;
    private String fullName;
    private String phoneNumber;
    private String province;
    private String district;
    private String role;
    private String avatar;
}