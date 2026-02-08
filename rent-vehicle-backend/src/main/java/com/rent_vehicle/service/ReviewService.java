package com.rent_vehicle.service;

import com.rent_vehicle.dto.request.CreateReviewRequest;
import com.rent_vehicle.dto.response.ReviewResponse;
import com.rent_vehicle.dto.response.PageResponse;
import com.rent_vehicle.model.Booking;
import com.rent_vehicle.model.Review;
import com.rent_vehicle.model.User;
import com.rent_vehicle.exception.AppException;
import com.rent_vehicle.exception.ErrorCode;
import com.rent_vehicle.repository.BookingRepository;
import com.rent_vehicle.repository.ReviewRepository;
import com.rent_vehicle.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public ReviewResponse createReview(Long userId, CreateReviewRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        // Check if user already reviewed this booking
        if (reviewRepository.findByBookingIdAndUserId(request.getBookingId(), userId).isPresent()) {
            throw new AppException(ErrorCode.REVIEW_ALREADY_EXISTS);
        }

        // Validate rating
        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new AppException(ErrorCode.INVALID_RATING);
        }

        Review review = Review.builder()
                .booking(booking)
                .user(user)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        Review saved = reviewRepository.save(review);
        return toResponse(saved);
    }

    public ReviewResponse updateReview(Long reviewId, CreateReviewRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));

        // Validate rating
        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new AppException(ErrorCode.INVALID_RATING);
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment());

        return toResponse(reviewRepository.save(review));
    }

    public void deleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));
        reviewRepository.delete(review);
    }

    @Transactional(readOnly = true)
    public ReviewResponse getReviewById(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));
        return toResponse(review);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByBooking(Long bookingId) {
        bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        return reviewRepository.findByBookingId(bookingId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByUser(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return reviewRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByVehicleModel(Long vehicleModelId) {
        return reviewRepository.findByVehicleModelId(vehicleModelId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Double getAverageRating(Long vehicleModelId) {
        return reviewRepository.getAverageRatingByVehicleModelId(vehicleModelId);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getAll() {
        return reviewRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getAllPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Review> pageData = reviewRepository.findAll(pageable);
        
        List<ReviewResponse> content = pageData.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        
        return PageResponse.<ReviewResponse>builder()
                .currentPage(page)
                .pageSize(pageData.getSize())
                .totalPages(pageData.getTotalPages())
                .totalElements(pageData.getTotalElements())
                .data(content)
                .build();
    }

    private ReviewResponse toResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .bookingId(review.getBooking().getId())
                .userId(review.getUser().getId())
                .userName(review.getUser().getFullName())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
