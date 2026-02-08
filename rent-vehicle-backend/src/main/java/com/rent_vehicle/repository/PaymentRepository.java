package com.rent_vehicle.repository;

import com.rent_vehicle.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByBookingId(Long bookingId);
    
    List<Payment> findByStatus(Payment.PaymentStatus status);
    
    Optional<Payment> findByBookingIdAndStatus(Long bookingId, Payment.PaymentStatus status);

    Optional<Payment> findTopByBookingIdAndMethodAndStatusOrderByCreatedAtDesc(
            Long bookingId,
            Payment.PaymentMethod method,
            Payment.PaymentStatus status
    );
    
    @Query("SELECT p FROM Payment p WHERE p.status = 'success' ORDER BY p.createdAt DESC")
    List<Payment> findSuccessfulPayments();
    
    @Query("SELECT p FROM Payment p WHERE p.status = 'pending' ORDER BY p.createdAt ASC")
    List<Payment> findPendingPayments();
    
    @Query("SELECT COUNT(p) FROM Payment p WHERE p.status = 'success'")
    long countSuccessfulPayments();
}
