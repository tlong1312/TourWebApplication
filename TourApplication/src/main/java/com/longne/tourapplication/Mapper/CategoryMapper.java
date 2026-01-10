package com.longne.tourapplication.Mapper;

import com.longne.tourapplication.dto.CategoryRequest;
import com.longne.tourapplication.dto.CategoryResponse;
import com.longne.tourapplication.entity.Category;
import org.springframework.stereotype.Component;

import java.sql.Timestamp;

@Component
public class CategoryMapper {
    public Category toEntity(CategoryRequest request) {
        Category category = new Category();
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        category.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        return category;
    }

    public void updateEntity(Category category, CategoryRequest request) {
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        if (request.getIsActive() != null) {
            category.setIsActive(request.getIsActive());
        }
    }

    public CategoryResponse toResponse(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.getIconUrl(),
                category.getIsActive(),
                category.getCreatedAt()
        );
    }
}
