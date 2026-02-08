package com.rent_vehicle.service;

import com.rent_vehicle.dto.request.CreatePaymentRequest;
import com.rent_vehicle.dto.response.PaymentResponse;
import com.rent_vehicle.dto.response.PageResponse;
import com.rent_vehicle.model.Booking;
import com.rent_vehicle.model.Payment;
import com.rent_vehicle.exception.AppException;
import com.rent_vehicle.exception.ErrorCode;
import com.rent_vehicle.repository.BookingRepository;
import com.rent_vehicle.repository.PaymentRepository;
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
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;

    public PaymentResponse createPayment(CreatePaymentRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        if (!booking.getStatus().equals(Booking.BookingStatus.approved)) {
            throw new AppException(ErrorCode.INVALID_BOOKING_STATUS);
        }

        // Validate payment method
        Payment.PaymentMethod paymentMethod = Payment.PaymentMethod.valueOf(request.getMethod());

        Payment payment = Payment.builder()
                .booking(booking)
                .amount(request.getAmount())
                .method(paymentMethod)
                .status(Payment.PaymentStatus.pending)
                .build();

        Payment saved = paymentRepository.save(payment);
        return toResponse(saved);
    }

    public PaymentResponse updatePaymentStatus(Long paymentId, String status) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

        Payment.PaymentStatus paymentStatus = Payment.PaymentStatus.valueOf(status);
        payment.setStatus(paymentStatus);

        // If payment is successful, update booking status
        if (paymentStatus.equals(Payment.PaymentStatus.success)) {
            Booking booking = payment.getBooking();
            booking.setStatus(Booking.BookingStatus.completed);
            bookingRepository.save(booking);
        }

        return toResponse(paymentRepository.save(payment));
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));
        return toResponse(payment);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByBooking(Long bookingId) {
        bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        return paymentRepository.findByBookingId(bookingId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByStatus(String status) {
        Payment.PaymentStatus paymentStatus = Payment.PaymentStatus.valueOf(status);
        return paymentRepository.findByStatus(paymentStatus).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getAll() {
        return paymentRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PageResponse<PaymentResponse> getAllPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Payment> pageData = paymentRepository.findAll(pageable);
        
        List<PaymentResponse> content = pageData.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        
        return PageResponse.<PaymentResponse>builder()
                .currentPage(page)
                .pageSize(pageData.getSize())
                .totalPages(pageData.getTotalPages())
                .totalElements(pageData.getTotalElements())
                .data(content)
                .build();
    }

    private boolean isValidPaymentMethod(String method) {
        return method.equals("vnpay") || method.equals("momo") || method.equals("cash");
    }

    private boolean isValidPaymentStatus(String status) {
        return status.equals("pending") || status.equals("success") || status.equals("failed");
    }

    private PaymentResponse toResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .bookingId(payment.getBooking().getId())
                .amount(payment.getAmount())
                .method(payment.getMethod().name())
                .status(payment.getStatus().name())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
