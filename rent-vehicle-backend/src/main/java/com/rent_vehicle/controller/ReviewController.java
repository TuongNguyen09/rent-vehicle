package com.rent_vehicle.controller;

import com.rent_vehicle.dto.response.ApiResponse;
import com.rent_vehicle.dto.request.CreateReviewRequest;
import com.rent_vehicle.dto.response.ReviewResponse;
import com.rent_vehicle.dto.response.PageResponse;
import com.rent_vehicle.service.ReviewService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ReviewController {

    ReviewService reviewService;

    @PostMapping
    public ApiResponse<ReviewResponse> createReview(@RequestBody CreateReviewRequest request) {
        return ApiResponse.<ReviewResponse>builder()
                .message("Review created successfully!")
                .result(reviewService.createReview(request))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<ReviewResponse> updateReview(
            @PathVariable Long id,
            @RequestBody CreateReviewRequest request
    ) {
        return ApiResponse.<ReviewResponse>builder()
                .message("Review updated successfully!")
                .result(reviewService.updateReview(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ApiResponse.<String>builder()
                .message("Review deleted successfully!")
                .result("Review has been deleted.")
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<ReviewResponse> getReview(@PathVariable Long id) {
        return ApiResponse.<ReviewResponse>builder()
                .message("Review retrieved successfully!")
                .result(reviewService.getReviewById(id))
                .build();
    }

    @GetMapping("/booking/{bookingId}")
    public ApiResponse<List<ReviewResponse>> getReviewsByBooking(@PathVariable Long bookingId) {
        return ApiResponse.<List<ReviewResponse>>builder()
                .message("Reviews retrieved successfully!")
                .result(reviewService.getReviewsByBooking(bookingId))
                .build();
    }

    @GetMapping("/user/my-reviews")
    public ApiResponse<List<ReviewResponse>> getMyReviews() {
        return ApiResponse.<List<ReviewResponse>>builder()
                .message("Your reviews retrieved successfully!")
                .result(reviewService.getReviewsByUser())
                .build();
    }

    @GetMapping("/vehicle-model/{vehicleModelId}")
    public ApiResponse<List<ReviewResponse>> getReviewsByVehicleModel(@PathVariable Long vehicleModelId) {
        return ApiResponse.<List<ReviewResponse>>builder()
                .message("Reviews retrieved successfully!")
                .result(reviewService.getReviewsByVehicleModel(vehicleModelId))
                .build();
    }

    @GetMapping("/vehicle-model/{vehicleModelId}/rating")
    public ApiResponse<Double> getAverageRating(@PathVariable Long vehicleModelId) {
        return ApiResponse.<Double>builder()
                .message("Average rating retrieved successfully!")
                .result(reviewService.getAverageRating(vehicleModelId))
                .build();
    }

    @GetMapping
    public ApiResponse<List<ReviewResponse>> getAllReviews() {
        return ApiResponse.<List<ReviewResponse>>builder()
                .message("Reviews retrieved successfully!")
                .result(reviewService.getAll())
                .build();
    }

    @GetMapping("/paginated")
    public ApiResponse<PageResponse<ReviewResponse>> getAllReviewsPaginated(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.<PageResponse<ReviewResponse>>builder()
                .message("Reviews retrieved successfully!")
                .result(reviewService.getAllPaginated(page, size))
                .build();
    }
}
