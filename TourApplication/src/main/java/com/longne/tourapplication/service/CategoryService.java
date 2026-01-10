package com.longne.tourapplication.service;

import com.longne.tourapplication.Mapper.CategoryMapper;
import com.longne.tourapplication.dto.CategoryRequest;
import com.longne.tourapplication.dto.CategoryResponse;
import com.longne.tourapplication.entity.Category;
import com.longne.tourapplication.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CloudinaryService cloudinaryService;
    private final CategoryMapper categoryMapper;

    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public CategoryResponse createCategory(CategoryRequest request) throws IOException {

        if (categoryRepository.existsByName(request.getName())) {
            throw new RuntimeException("Tên category đã tồn tại");
        }

        Category category = categoryMapper.toEntity(request);

        if (request.getIcon() != null && !request.getIcon().isEmpty()) {
            String iconUrl = cloudinaryService.uploadImage(request.getIcon());
            category.setIconUrl(iconUrl);
        }

        Category saved = categoryRepository.save(category);
        return categoryMapper.toResponse(saved);
    }

    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public CategoryResponse updateCategory(Long id, CategoryRequest request) throws IOException{
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy category"));

        // THÊM: Kiểm tra tên mới có trùng với category khác không
        if (!category.getName().equals(request.getName()) &&
                categoryRepository.existsByName(request.getName())) {
            throw new RuntimeException("Tên category đã tồn tại");
        }

        if (request.getIcon() != null && !request.getIcon().isEmpty()) {
            String newIconUrl = cloudinaryService.uploadImage(request.getIcon());
            category.setIconUrl(newIconUrl);
        }

        categoryMapper.updateEntity(category, request);
        Category updated = categoryRepository.save(category);
        return categoryMapper.toResponse(updated);
    }

    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        return categoryMapper.toResponse(category);
    }

    @Cacheable(value = "categories", key = "'all'")
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(categoryMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<CategoryResponse> getActiveCategories() {
        return categoryRepository.findByIsActive(true).stream()
                .map(categoryMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }
}
