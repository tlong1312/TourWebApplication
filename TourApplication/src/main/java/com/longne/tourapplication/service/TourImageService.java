package com.longne.tourapplication.service;

import com.cloudinary.Cloudinary;
import com.longne.tourapplication.Mapper.TourImageMapper;
import com.longne.tourapplication.dto.TourImageRequest;
import com.longne.tourapplication.dto.TourImageResponse;
import com.longne.tourapplication.entity.Tour;
import com.longne.tourapplication.entity.TourImage;
import com.longne.tourapplication.repository.TourImageRepository;
import com.longne.tourapplication.repository.TourRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TourImageService {

    private final CloudinaryService cloudinaryService;
    private final TourImageRepository tourImageRepository;
    private final TourImageMapper tourImageMapper;
    private final TourRepository tourRepository;

    public TourImageResponse uploadAndSaveImage(TourImageRequest request) throws IOException {

        String contentType = request.getImage().getContentType();
        if (!("image/jpeg".equals(contentType) || "image/png".equals(contentType))) {
            throw new IllegalArgumentException("Chỉ thêm được ảnh có đuôi JPEG VÀ PNG");
        }

        Tour tour = tourRepository.findById(request.getTourId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tour"));

        String imageUrl = cloudinaryService.uploadImage(request.getImage());

        TourImage tourImage = tourImageMapper.toEntity(request);
        tourImage.setTour(tour);
        tourImage.setImageUrl(imageUrl);
        tourImage.setUploadedAt(new Timestamp(System.currentTimeMillis()));

        tourImageRepository.save(tourImage);

        return tourImageMapper.toTourImageResponse(tourImage);
    }

    public TourImageResponse getTourImage(Long tourImageId) throws IOException {
        return tourImageRepository.findById(tourImageId)
                .map(tourImageMapper::toTourImageResponse)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hình ảnh theo id " + tourImageId));
    }

    public List<TourImageResponse> getAllTourImages() {
        return tourImageRepository.findAll()
                .stream()
                .map(tourImageMapper::toTourImageResponse)
                .collect(Collectors.toList());
    }

    public void deleteTourImage(Long tourImageId) throws IOException {
        TourImage tourImage = tourImageRepository.findById(tourImageId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hình ảnh theo id "+ tourImageId));

        String imageUrl = tourImage.getImageUrl();
        String publicId = extractPublicId(imageUrl);

        cloudinaryService.deleteImage(publicId);

        tourImageRepository.deleteById(tourImageId);
    }

    private String extractPublicId(String imageUrl) {
        String[] parts = imageUrl.split("/");
        String filename = parts[parts.length - 1];
        return filename.substring(0, filename.lastIndexOf('.'));
    }

    public List<TourImageResponse> getTourImagesByTourId(Long tourId) {
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tour"));

        List<TourImage> tourImages = tourImageRepository.findByTour(tour);

        return tourImages.stream()
                .map(tourImageMapper::toTourImageResponse)
                .collect(Collectors.toList());
    }
}
