package com.longne.tourapplication.controller;

import com.longne.tourapplication.dto.CategoryRequest;
import com.longne.tourapplication.dto.CategoryResponse;
import com.longne.tourapplication.dto.TourResponse;
import com.longne.tourapplication.service.CategoryService;
import com.longne.tourapplication.service.TourService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;
    private final TourService tourService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryResponse> createCategory(
            @Valid @ModelAttribute CategoryRequest request) throws IOException {
        return ResponseEntity.ok(categoryService.createCategory(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @Valid @ModelAttribute CategoryRequest request) throws IOException {
        return ResponseEntity.ok(categoryService.updateCategory(id, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @GetMapping("/active")
    public ResponseEntity<List<CategoryResponse>> getActiveCategories() {
        return ResponseEntity.ok(categoryService.getActiveCategories());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteCategory(@PathVariable Long id) {
        Map<String, String> response = new HashMap<>();
        categoryService.deleteCategory(id);
        response.put("message", "Category deleted successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{categoryId}/tours")
    public ResponseEntity<Page<TourResponse>> getToursByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        Page<TourResponse> tours = tourService.findByCategoryId(
                categoryId,
                PageRequest.of(page, size)
        );
        return ResponseEntity.ok(tours);
    }
}
