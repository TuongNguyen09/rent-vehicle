package com.rent_vehicle.repository;

import com.rent_vehicle.model.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    long countByVehicleModelIdAndStatus(Long vehicleModelId, Booking.BookingStatus status);

    @Query("""
    SELECT b FROM Booking b
    WHERE b.vehicleModel.id = :vehicleModelId
      AND b.status = com.rent_vehicle.model.Booking.BookingStatus.approved
      AND b.startDate <= :endDate
      AND b.endDate >= :startDate
    """)
    List<Booking> findConflictingBookings(
            @org.springframework.data.repository.query.Param("vehicleModelId") Long vehicleModelId,
            @org.springframework.data.repository.query.Param("startDate") LocalDate startDate,
            @org.springframework.data.repository.query.Param("endDate") LocalDate endDate
    );

    @Query("""
    SELECT b FROM Booking b
    WHERE b.vehicle.id = :vehicleId
      AND b.status = com.rent_vehicle.model.Booking.BookingStatus.approved
      AND b.startDate <= :endDate
      AND b.endDate >= :startDate
    """)
    List<Booking> findConflictingBookingsByVehicleId(
            @org.springframework.data.repository.query.Param("vehicleId") Long vehicleId,
            @org.springframework.data.repository.query.Param("startDate") LocalDate startDate,
            @org.springframework.data.repository.query.Param("endDate") LocalDate endDate
    );

    long countByUserIdAndVehicleIdAndStartDateAndEndDateAndStatusIn(
            Long userId,
            Long vehicleId,
            LocalDate startDate,
            LocalDate endDate,
            List<Booking.BookingStatus> statuses
    );

    @Query("""
    SELECT b FROM Booking b
    WHERE (:status IS NULL OR b.status = :status)
      AND (:fromDate IS NULL OR b.startDate >= :fromDate)
      AND (:toDate IS NULL OR b.endDate <= :toDate)
      AND (:userId IS NULL OR b.user.id = :userId)
    """)
    Page<Booking> filterBookings(
            @org.springframework.data.repository.query.Param("status") Booking.BookingStatus status,
            @org.springframework.data.repository.query.Param("fromDate") LocalDate fromDate,
            @org.springframework.data.repository.query.Param("toDate") LocalDate toDate,
            @org.springframework.data.repository.query.Param("userId") Long userId,
            org.springframework.data.domain.Pageable pageable
    );

    @Query("""
    SELECT b FROM Booking b
    WHERE b.user.id = :userId
      AND (:status IS NULL OR b.status = :status)
      AND (:fromDate IS NULL OR b.startDate >= :fromDate)
      AND (:toDate IS NULL OR b.endDate <= :toDate)
    ORDER BY b.createdAt DESC
    """)
    Page<Booking> filterUserBookings(
            @org.springframework.data.repository.query.Param("userId") Long userId,
            @org.springframework.data.repository.query.Param("status") Booking.BookingStatus status,
            @org.springframework.data.repository.query.Param("fromDate") LocalDate fromDate,
            @org.springframework.data.repository.query.Param("toDate") LocalDate toDate,
            org.springframework.data.domain.Pageable pageable
    );
}
