package com.longne.tourapplication.service;

import com.longne.tourapplication.entity.Tour;
import com.longne.tourapplication.repository.TourRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.text.NumberFormat;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TourToolService {
    private final TourRepository tourRepository;
    @Value("${app.frontend.url}")
    private String frontendBaseUrl;

    private String removeAccent(String s) {
        if (s == null) return "";
        String temp = Normalizer.normalize(s, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(temp).replaceAll("").toLowerCase().replace("đ", "d");
    }

    @Tool(
            name = "searchTours",
            description = """
    Search for tours. Parameters:
    - location: Destination (e.g., "Da Nang"). Use empty string "" if not filtering by location.
    - minPrice: Minimum price. Use 0 if not filtering.
    - maxPrice: Maximum price. Use 999999999 if not filtering.
    - duration: Number of days. Use 0 if not filtering.
    - categoryName: "Nội địa" or "Quốc tế". Use empty string "" if not filtering.

    ⚠️ NEVER send null values. Use default values above instead.
    """
    )
    @Transactional(readOnly = true)
    public String searchTour(
            String location,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Integer duration,
            String categoryName
    ) {
        final String finalLocation = (location != null && location.isEmpty()) ? null : location;
        final String finalCategoryName = (categoryName != null && categoryName.isEmpty()) ? null : categoryName;
        final BigDecimal finalMinPrice = (minPrice != null && minPrice.compareTo(BigDecimal.ZERO) == 0) ? null : minPrice;
        final BigDecimal finalMaxPrice = (maxPrice != null && maxPrice.compareTo(new BigDecimal("999999999")) >= 0) ? null : maxPrice;
        final Integer finalDuration = (duration != null && duration == 0) ? null : duration;

        log.info("🔧 [TOOL] searchTours called");
        log.info("   📍 Location: {}", finalLocation);
        log.info("   💰 Price: {} - {}", finalMinPrice, finalMaxPrice);
        log.info("   ⏰ Duration: {} days", finalDuration);
        log.info("   📂 Category: {}", finalCategoryName);

        try {
            List<Tour> filtered = tourRepository.findAll().stream()
                    .filter(tour -> {
                        if (finalLocation != null && !finalLocation.isEmpty()) {
                            String dbLocation = removeAccent(tour.getLocation());
                            String searchLocation = removeAccent(finalLocation);
                            if (!dbLocation.contains(searchLocation)) {
                                return false;
                            }
                        }

                        if (finalMinPrice != null && tour.getAdultPrice().compareTo(finalMinPrice) < 0) {
                            return false;
                        }
                        if (finalMaxPrice != null && tour.getAdultPrice().compareTo(finalMaxPrice) > 0) {
                            return false;
                        }

                        if (finalDuration != null && !tour.getDuration().equals(finalDuration)) {
                            return false;
                        }

                        if (finalCategoryName != null && !finalCategoryName.isEmpty()) {
                            if (!tour.getCategory().getName().toLowerCase()
                                    .contains(finalCategoryName.toLowerCase())) {
                                return false;
                            }
                        }

                        return true;
                    })
                    .limit(5)
                    .collect(Collectors.toList());

            if (filtered.isEmpty()) {
                return "❌ Không tìm thấy tour phù hợp với tiêu chí.";
            }

            StringBuilder result = new StringBuilder();
            result.append("Tìm thấy ").append(filtered.size()).append(" tour:\n\n");

            int index = 1;
            for (Tour tour : filtered) {
                String imgUrl = (tour.getImages() != null && !tour.getImages().isEmpty())
                        ? tour.getImages().getFirst().getImageUrl() : "";

                result.append(index++).append(". **").append(tour.getName()).append("**\n");
                result.append("   📍 Địa điểm: ").append(tour.getLocation()).append("\n");
                result.append("   ⏰ Thời gian: ").append(tour.getDuration()).append(" ngày\n");
                result.append("   💰 Giá: ").append(formatPrice(tour.getAdultPrice())).append(" VND\n");

                if (!imgUrl.isEmpty()) {
                    result.append("   🖼️ Ảnh minh họa:\n   ![").append(tour.getName()).append("](")
                            .append(imgUrl).append(")\n");
                }

                result.append("   👉 [BẤM ĐỂ XEM CHI TIẾT](")
                        .append(frontendBaseUrl)
                        .append("/tours/")
                        .append(tour.getId())
                        .append(")\n\n");
            }

            log.info("✅ [TOOL] Found {} tours", filtered.size());
            return result.toString();
        } catch (Exception e) {
            log.error("❌ [TOOL] Error: {}", e.getMessage(), e);
            return "❌ Lỗi khi tìm kiếm tour: " + e.getMessage();
        }
    }

    @Tool(
            name = "getTourDetails",
            description = """
        Retrieve comprehensive details of a specific tour by its ID.
        Returns: Itinerary, full description, departure/return points, and detailed pricing.

        WHEN TO USE:
        - Use ONLY when the user asks for deep details like "What is the itinerary?", "Where do we meet?", "Does it include breakfast?".
        - Do NOT use this just to show a list of tours (use searchTours for that).
        """
    )
    public String getTourDetails(Long tourId) {
        log.info("🔧 [TOOL] getTourDetails({})", tourId);

        try {
            Optional<Tour> tourOpt = tourRepository.findById(tourId);

            if (tourOpt.isEmpty()) {
                return "❌ Không tìm thấy tour với ID " + tourId;
            }

            Tour tour = tourOpt.get();
            StringBuilder result = new StringBuilder();

            result.append("📋 **CHI TIẾT TOUR**\n\n");
            result.append("🏷️ Tên: ").append(tour.getName()).append("\n");
            result.append("📍 Địa điểm: ").append(tour.getLocation()).append("\n");
            result.append("⏰ Thời gian: ").append(tour.getDuration()).append(" ngày ")
                    .append(tour.getDuration() - 1).append(" đêm\n");
            result.append("💰 Giá người lớn: ").append(formatPrice(tour.getAdultPrice())).append(" VND\n");

            if (tour.getChildPrice() != null && tour.getChildPrice().compareTo(BigDecimal.ZERO) > 0) {
                result.append("💰 Giá trẻ em: ").append(formatPrice(tour.getChildPrice())).append(" VND\n");
            }

            if (tour.getInfantPrice() != null && tour.getInfantPrice().compareTo(BigDecimal.ZERO) > 0) {
                result.append("💰 Giá em bé: ").append(formatPrice(tour.getInfantPrice())).append(" VND\n");
            }

            result.append("📝 Mô tả: ").append(tour.getDescription()).append("\n\n");
            if (tour.getDeparturePoint() != null) {
                result.append("🚩 Điểm khởi hành: ").append(tour.getDeparturePoint()).append("\n");
            }
            if (tour.getReturnPoint() != null) {
                result.append("🏁 Điểm trở về: ").append(tour.getReturnPoint()).append("\n");
            }

            if (tour.getItineraries() != null && !tour.getItineraries().isEmpty()) {
                result.append("\n📅 **LỊCH TRÌNH:**\n\n");
                tour.getItineraries().forEach(it -> {
                    result.append("▪️ **Ngày ").append(it.getDayNumber()).append(":** ");
                    result.append(it.getTitle()).append("\n");
                    if (it.getDescription() != null && !it.getDescription().isEmpty()) {
                        result.append("   ").append(it.getDescription()).append("\n");
                    }
                    result.append("\n");
                });
            }

            log.info("✅ [TOOL] Retrieved details for: {}", tour.getName());
            return result.toString();
        } catch (Exception e) {
            log.error("❌ [TOOL] Error: {}", e.getMessage(), e);
            return "❌ Lỗi khi lấy chi tiết tour: " + e.getMessage();
        }
    }

    @Tool(
            name = "calculatePrice",
            description = """
    CALCULATE the official final price.

    ⚠️ CRITICAL RULES FOR AI:
    - NEVER calculate the price yourself.
    - NEVER guess child/infant policies (e.g., do not assume 50% or 75%).
    - The pricing logic includes hidden taxes and surcharges that ONLY this tool knows.
    - ALWAYS call this tool to get the correct number.
    """
    )
    public String calculatePrice(
            Long tourId,
            Integer numAdults,
            Integer numChildren,
            Integer numInfants
    ) {
        log.info("🔧 [TOOL] calculatePrice({}, {} adults, {} children, {} infants)",
                tourId, numAdults, numChildren, numInfants);

        try {
            Optional<Tour> tourOpt = tourRepository.findById(tourId);

            if (tourOpt.isEmpty()) {
                return "❌ Không tìm thấy tour với ID " + tourId;
            }

            Tour tour = tourOpt.get();
            BigDecimal adultPrice = tour.getAdultPrice();

            BigDecimal childPrice = (tour.getChildPrice() != null && tour.getChildPrice().compareTo(BigDecimal.ZERO) > 0)
                    ? tour.getChildPrice()
                    : adultPrice.multiply(new BigDecimal("0.7"));

            BigDecimal infantPrice = (tour.getInfantPrice() != null && tour.getInfantPrice().compareTo(BigDecimal.ZERO) >= 0)
                    ? tour.getInfantPrice()
                    : BigDecimal.ZERO;

            int adults = numAdults != null ? numAdults : 0;
            int children = numChildren != null ? numChildren : 0;
            int infants = numInfants != null ? numInfants : 0;

            BigDecimal totalAdult = adultPrice.multiply(BigDecimal.valueOf(adults));
            BigDecimal totalChild = childPrice.multiply(BigDecimal.valueOf(children));
            BigDecimal totalInfant = infantPrice.multiply(BigDecimal.valueOf(infants));
            BigDecimal totalPrice = totalAdult.add(totalChild).add(totalInfant);

            StringBuilder result = new StringBuilder();
            result.append("💰 **BẢNG GIÁ CHI TIẾT**\n\n");
            result.append("🏷️ Tour: ").append(tour.getName()).append("\n\n");

            if (adults > 0) {
                result.append("👤 Người lớn: ").append(adults).append(" x ")
                        .append(formatPrice(adultPrice)).append(" = ")
                        .append(formatPrice(totalAdult)).append(" VND\n");
            }

            if (children > 0) {
                result.append("👶 Trẻ em (2-12 tuổi): ").append(children).append(" x ")
                        .append(formatPrice(childPrice)).append(" = ")
                        .append(formatPrice(totalChild)).append(" VND\n");
            }

            if (infants > 0) {
                result.append("🍼 Em bé (<2 tuổi): ").append(infants).append(" x ")
                        .append(formatPrice(infantPrice)).append(" = ")
                        .append(formatPrice(totalInfant)).append(" VND");

                if (infantPrice.compareTo(BigDecimal.ZERO) == 0) {
                    result.append(" **(MIỄN PHÍ)**");
                }
                result.append("\n");
            }

            result.append("\n━━━━━━━━━━━━━━━━━━━━━━\n");
            result.append("💵 **TỔNG CỘNG: ").append(formatPrice(totalPrice)).append(" VND**\n");

            log.info("✅ [TOOL] Total: {} VND ({}A + {}C + {}I)",
                    formatPrice(totalPrice), adults, children, infants);
            return result.toString();

        } catch (Exception e) {
            log.error("❌ [TOOL] Error: {}", e.getMessage(), e);
            return "❌ Lỗi khi tính giá: " + e.getMessage();
        }
    }

    @Tool(
            name = "getPopularTours",
            description = """
        Retrieve a list of the most popular/trending tours based on actual booking data.
        Use this when the user asks for "best sellers", "hot tours", "recommendations", or "what do others buy?".
        """
    )
    public String getPopularTours(Integer limit) {
        log.info("🔧 [TOOL] getPopularTours(limit: {})", limit);

        int actualLimit = limit != null ? limit : 5;

        try {
            List<Tour> tours = tourRepository.findTopPopularTours(actualLimit);

            if (tours == null || tours.isEmpty()) {
                log.warn("⚠️  No popular tours found, showing all active tours instead");
                tours = tourRepository.findAll().stream()
                        .filter(t -> "ACTIVE".equals(t.getStatus()))
                        .sorted((t1, t2) -> Long.compare(t2.getId(), t1.getId()))
                        .limit(actualLimit)
                        .collect(Collectors.toList());
            }

            if (tours.isEmpty()) {
                return "❌ Không có tour nào trong hệ thống.";
            }

            StringBuilder result = new StringBuilder();
            result.append("🔥 **TOP ").append(actualLimit).append(" TOUR PHỔ BIẾN NHẤT**\n\n");
            result.append("_(Dựa trên số lượng đặt tour thực tế)_\n\n");

            int index = 1;
            for (Tour tour : tours) {
                result.append(index++).append(". **").append(tour.getName()).append("**\n");
                result.append("   📍 ").append(tour.getLocation()).append("\n");
                result.append("   💰 ").append(formatPrice(tour.getAdultPrice())).append(" VND\n");
                result.append("   ⏰ ").append(tour.getDuration()).append(" ngày\n");
                result.append("   🆔 ID: ").append(tour.getId()).append("\n\n");
            }

            log.info("✅ [TOOL] Retrieved {} popular tours", tours.size());
            return result.toString();

        } catch (Exception e) {
            log.error("❌ [TOOL] Error calling findTopPopularTours: {}", e.getMessage(), e);

            try {
                log.info("⚠️  Falling back to basic query...");
                List<Tour> fallbackTours = tourRepository.findAll().stream()
                        .filter(t -> "ACTIVE".equals(t.getStatus()))
                        .limit(actualLimit)
                        .collect(Collectors.toList());

                if (fallbackTours.isEmpty()) {
                    return "❌ Không có tour nào trong hệ thống.";
                }

                StringBuilder result = new StringBuilder();
                result.append("🔥 **TOP ").append(actualLimit).append(" TOUR**\n\n");

                int index = 1;
                for (Tour tour : fallbackTours) {
                    result.append(index++).append(". **").append(tour.getName()).append("**\n");
                    result.append("   📍 ").append(tour.getLocation()).append("\n");
                    result.append("   💰 ").append(formatPrice(tour.getAdultPrice())).append(" VND\n");
                    result.append("   🆔 ID: ").append(tour.getId()).append("\n\n");
                }

                return result.toString();

            } catch (Exception fallbackError) {
                log.error("❌ Fallback also failed: {}", fallbackError.getMessage());
                return "❌ Lỗi khi lấy danh sách tour: " + e.getMessage();
            }
        }
    }

    private String formatPrice(BigDecimal price) {
        if (price == null) {
            return "0";
        }

        NumberFormat formatter = NumberFormat.getInstance(new Locale("vi", "VN"));
        formatter.setGroupingUsed(true);
        formatter.setMaximumFractionDigits(0);

        return formatter.format(price);
    }
}
