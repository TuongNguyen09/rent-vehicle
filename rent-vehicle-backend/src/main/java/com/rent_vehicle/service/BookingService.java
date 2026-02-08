package com.rent_vehicle.service;

import com.rent_vehicle.dto.request.CreateBookingRequest;
import com.rent_vehicle.dto.response.BookingResponse;
import com.rent_vehicle.dto.response.PageResponse;
import com.rent_vehicle.exception.AppException;
import com.rent_vehicle.exception.ErrorCode;
import com.rent_vehicle.model.Booking;
import com.rent_vehicle.model.User;
import com.rent_vehicle.model.Vehicle;
import com.rent_vehicle.model.VehicleModel;
import com.rent_vehicle.repository.BookingRepository;
import com.rent_vehicle.repository.UserRepository;
import com.rent_vehicle.repository.VehicleModelRepository;
import com.rent_vehicle.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class BookingService {
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final VehicleModelRepository vehicleModelRepository;
    private final VehicleRepository vehicleRepository;
    private final BookingEmailEventProducer bookingEmailEventProducer;

    public BookingResponse createBooking(Long userId, CreateBookingRequest request) {
        if (request.getVehicleModelId() == null || request.getVehicleId() == null
                || request.getStartDate() == null || request.getEndDate() == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        VehicleModel vehicleModel = vehicleModelRepository.findById(request.getVehicleModelId())
                .orElseThrow(() -> new AppException(ErrorCode.VEHICLE_MODEL_NOT_FOUND));

        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new AppException(ErrorCode.VEHICLE_NOT_FOUND));

        if (!vehicle.getVehicleModel().getId().equals(vehicleModel.getId())) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        if (!vehicle.getStatus().equals(Vehicle.VehicleStatus.available)) {
            throw new AppException(ErrorCode.VEHICLE_NOT_AVAILABLE);
        }

        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new AppException(ErrorCode.INVALID_BOOKING_DATE);
        }

        if (request.getStartDate().isBefore(LocalDate.now())) {
            throw new AppException(ErrorCode.INVALID_BOOKING_DATE);
        }

        Booking.PaymentMethod paymentMethod = parsePaymentMethod(request.getPaymentMethod());

        long duplicateCount = bookingRepository.countByUserIdAndVehicleIdAndStartDateAndEndDateAndStatusIn(
                user.getId(),
                vehicle.getId(),
                request.getStartDate(),
                request.getEndDate(),
                List.of(Booking.BookingStatus.pending, Booking.BookingStatus.approved)
        );
        if (duplicateCount > 0) {
            throw new AppException(ErrorCode.BOOKING_CONFLICT);
        }

        String bookingLocation = normalizeLocation(vehicle.getLocation());
        if (bookingLocation == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        List<Vehicle> availableVehiclesAtLocation = vehicleRepository.findAvailableByModelIdAndLocation(
                request.getVehicleModelId(),
                Vehicle.VehicleStatus.available,
                bookingLocation
        );
        if (availableVehiclesAtLocation.isEmpty()) {
            throw new AppException(ErrorCode.VEHICLE_NOT_AVAILABLE);
        }

        List<Booking> conflicts = bookingRepository.findConflictingBookingsByVehicleId(
                request.getVehicleId(),
                request.getStartDate(),
                request.getEndDate()
        );

        if (!conflicts.isEmpty()) {
            throw new AppException(ErrorCode.BOOKING_CONFLICT);
        }

        long days = java.time.temporal.ChronoUnit.DAYS.between(
                request.getStartDate(),
                request.getEndDate()
        );

        BigDecimal totalPrice = vehicleModel.getPricePerDay().multiply(BigDecimal.valueOf(days));

        Booking booking = Booking.builder()
                .user(user)
                .vehicleModel(vehicleModel)
                .vehicle(vehicle)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .totalPrice(totalPrice)
                .status(Booking.BookingStatus.pending)
                .paymentMethod(paymentMethod)
                .build();

        Booking saved = bookingRepository.save(booking);
        return toResponse(saved);
    }

    public BookingResponse approveBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        if (!booking.getStatus().equals(Booking.BookingStatus.pending)) {
            throw new AppException(ErrorCode.INVALID_BOOKING_STATUS);
        }

        if (booking.getVehicle() == null) {
            Vehicle assignedVehicle = findAvailableVehicleForBooking(booking);
            booking.setVehicle(assignedVehicle);
        }

        List<Booking> conflicts = bookingRepository.findConflictingBookingsByVehicleId(
                booking.getVehicle().getId(),
                booking.getStartDate(),
                booking.getEndDate()
        );

        if (!conflicts.isEmpty()) {
            throw new AppException(ErrorCode.BOOKING_CONFLICT);
        }

        booking.setStatus(Booking.BookingStatus.approved);
        Booking saved = bookingRepository.save(booking);

        try {
            bookingEmailEventProducer.publishBookingApproved(saved.getId());
        } catch (Exception ex) {
            log.warn("Failed to publish booking-approved event for booking {}", saved.getId(), ex);
        }

        return toResponse(saved);
    }

    public BookingResponse cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        if (booking.getStatus().equals(Booking.BookingStatus.completed) ||
                booking.getStatus().equals(Booking.BookingStatus.canceled)) {
            throw new AppException(ErrorCode.INVALID_BOOKING_STATUS);
        }

        booking.setStatus(Booking.BookingStatus.canceled);
        return toResponse(bookingRepository.save(booking));
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
        return toResponse(booking);
    }

    @Transactional(readOnly = true)
    public PageResponse<BookingResponse> getMyBookings(
            Long userId,
            String status,
            LocalDate fromDate,
            LocalDate toDate,
            int page,
            int size
    ) {
        userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Booking.BookingStatus bookingStatus = parseBookingStatus(status);

        if (fromDate != null && toDate != null && fromDate.isAfter(toDate)) {
            throw new AppException(ErrorCode.INVALID_BOOKING_DATE);
        }

        Pageable pageable = PageRequest.of(page - 1, size);

        Page<Booking> pageData = bookingRepository.filterUserBookings(
                userId,
                bookingStatus,
                fromDate,
                toDate,
                pageable
        );

        List<BookingResponse> content = pageData.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return PageResponse.<BookingResponse>builder()
                .currentPage(page)
                .pageSize(pageData.getSize())
                .totalPages(pageData.getTotalPages())
                .totalElements(pageData.getTotalElements())
                .data(content)
                .build();
    }

    @Transactional(readOnly = true)
    public PageResponse<BookingResponse> getAllBookings(
            String status,
            LocalDate fromDate,
            LocalDate toDate,
            Long userId,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(page - 1, size);

        Booking.BookingStatus bookingStatus = parseBookingStatus(status);

        if (fromDate != null && toDate != null && fromDate.isAfter(toDate)) {
            throw new AppException(ErrorCode.INVALID_BOOKING_DATE);
        }

        if (userId != null) {
            userRepository.findById(userId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        }

        Page<Booking> pageData = bookingRepository.filterBookings(
                bookingStatus,
                fromDate,
                toDate,
                userId,
                pageable
        );

        List<BookingResponse> content = pageData.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return PageResponse.<BookingResponse>builder()
                .currentPage(page)
                .pageSize(pageData.getSize())
                .totalPages(pageData.getTotalPages())
                .totalElements(pageData.getTotalElements())
                .data(content)
                .build();
    }

    private Booking.BookingStatus parseBookingStatus(String status) {
        if (status == null || status.isBlank() || status.equalsIgnoreCase("all")) {
            return null;
        }

        return Arrays.stream(Booking.BookingStatus.values())
                .filter(value -> value.name().equalsIgnoreCase(status.trim()))
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_BOOKING_STATUS));
    }

    private Booking.PaymentMethod parsePaymentMethod(String paymentMethod) {
        if (paymentMethod == null || paymentMethod.isBlank()) {
            return Booking.PaymentMethod.bank;
        }

        Booking.PaymentMethod parsedMethod = Arrays.stream(Booking.PaymentMethod.values())
                .filter(value -> value.name().equalsIgnoreCase(paymentMethod.trim()))
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_PAYMENT_METHOD));

        if (parsedMethod == Booking.PaymentMethod.card) {
            throw new AppException(ErrorCode.INVALID_PAYMENT_METHOD, "Card payment is temporarily disabled");
        }

        return parsedMethod;
    }

    private BookingResponse toResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .userId(booking.getUser().getId())
                .userEmail(booking.getUser().getEmail())
                .vehicleModelId(booking.getVehicleModel().getId())
                .vehicleModelName(booking.getVehicleModel().getName())
                .vehicleId(booking.getVehicle() != null ? booking.getVehicle().getId() : null)
                .vehicleLicensePlate(booking.getVehicle() != null ? booking.getVehicle().getLicensePlate() : null)
                .vehicleLocation(booking.getVehicle() != null ? booking.getVehicle().getLocation() : null)
                .paymentMethod((booking.getPaymentMethod() != null
                        ? booking.getPaymentMethod()
                        : Booking.PaymentMethod.bank).name())
                .startDate(booking.getStartDate())
                .endDate(booking.getEndDate())
                .totalPrice(booking.getTotalPrice())
                .status(booking.getStatus().name())
                .createdAt(booking.getCreatedAt())
                .build();
    }

    private Vehicle findAvailableVehicleForBooking(Booking booking) {
        List<Vehicle> candidates = vehicleRepository.findAvailableByModelId(
                booking.getVehicleModel().getId(),
                Vehicle.VehicleStatus.available
        );

        return candidates.stream()
                .filter(vehicle -> bookingRepository.findConflictingBookingsByVehicleId(
                        vehicle.getId(),
                        booking.getStartDate(),
                        booking.getEndDate()
                ).isEmpty())
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.VEHICLE_NOT_AVAILABLE));
    }

    private String normalizeLocation(String location) {
        if (location == null) {
            return null;
        }

        String trimmed = location.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
