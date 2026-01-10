package com.longne.tourapplication.controller;

import com.longne.tourapplication.dto.TourImageRequest;
import com.longne.tourapplication.dto.TourImageResponse;
import com.longne.tourapplication.service.TourImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tour-images")
@RequiredArgsConstructor
public class TourImageController {

    private final TourImageService tourImageService;

    @PostMapping("/upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TourImageResponse> uploadTourImage(@ModelAttribute TourImageRequest request) throws Exception {
        TourImageResponse response = tourImageService.uploadAndSaveImage(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<TourImageResponse>> getAllTourImages() {
        return ResponseEntity.ok(tourImageService.getAllTourImages());
    }

    @GetMapping("/of_tour/{tourId}")
    public ResponseEntity<List<TourImageResponse>> getTourImagesByTourId(@PathVariable Long tourId) {
        List<TourImageResponse> tourImages = tourImageService.getTourImagesByTourId(tourId);
        return ResponseEntity.ok(tourImages);
    }

    @GetMapping("/{tourImageId}")
    public ResponseEntity<TourImageResponse> getTourImageById(@PathVariable Long tourImageId) throws Exception {
        TourImageResponse tourImageResponse = tourImageService.getTourImage(tourImageId);
        return ResponseEntity.ok(tourImageResponse);
    }

    @DeleteMapping("/{tourImageId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteTourImage(@PathVariable Long tourImageId) throws Exception {
        Map<String, String> response = new HashMap<>();
        tourImageService.deleteTourImage(tourImageId);
        response.put("status", "Xóa hình ảnh thành công");
        return ResponseEntity.ok(response);
    }
}
