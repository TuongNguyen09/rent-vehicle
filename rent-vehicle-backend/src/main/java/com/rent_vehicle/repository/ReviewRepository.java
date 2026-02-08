package com.rent_vehicle.repository;

import com.rent_vehicle.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByUserId(Long userId);
    
    List<Review> findByBookingId(Long bookingId);
    
    Optional<Review> findByBookingIdAndUserId(Long bookingId, Long userId);
    
    @Query("SELECT r FROM Review r WHERE r.booking.vehicleModel.id = ?1 ORDER BY r.createdAt DESC")
    List<Review> findByVehicleModelId(Long vehicleModelId);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.booking.vehicleModel.id = ?1")
    Double getAverageRatingByVehicleModelId(Long vehicleModelId);
    
    @Query("SELECT r FROM Review r WHERE r.rating >= ?1 ORDER BY r.createdAt DESC")
    List<Review> findReviewsByMinRating(Integer minRating);
    
    long countByBookingVehicleModelId(Long vehicleModelId);
}
