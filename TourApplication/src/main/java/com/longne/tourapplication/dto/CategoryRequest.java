package com.longne.tourapplication.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class CategoryRequest {

    @NotBlank(message = "Tên category không được để trống")
    @Size(min =2, max = 100, message = "Tên category phải từ 2 - 200 ký tự")
    private String name;

    @Size(max = 500, message = "Mô tả không được quá 500 ký tự")
    private String description;

    private MultipartFile icon;

    private Boolean isActive;
}
