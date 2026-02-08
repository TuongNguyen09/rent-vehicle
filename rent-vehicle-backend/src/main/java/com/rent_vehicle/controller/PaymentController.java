package com.rent_vehicle.controller;

import com.rent_vehicle.dto.response.ApiResponse;
import com.rent_vehicle.dto.request.CreatePaymentRequest;
import com.rent_vehicle.dto.response.PaymentResponse;
import com.rent_vehicle.dto.response.PageResponse;
import com.rent_vehicle.service.PaymentService;
import com.rent_vehicle.dto.response.VnPayPaymentUrlResponse;
import com.rent_vehicle.service.VnPayService;
import com.rent_vehicle.util.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentController {

    PaymentService paymentService;
    VnPayService vnPayService;

    @PostMapping
    public ApiResponse<PaymentResponse> createPayment(@RequestBody CreatePaymentRequest request) {
        return ApiResponse.<PaymentResponse>builder()
                .message("Payment created successfully!")
                .result(paymentService.createPayment(request))
                .build();
    }

    @PutMapping("/{id}/status")
    public ApiResponse<PaymentResponse> updatePaymentStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        return ApiResponse.<PaymentResponse>builder()
                .message("Payment status updated successfully!")
                .result(paymentService.updatePaymentStatus(id, status))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<PaymentResponse> getPayment(@PathVariable Long id) {
        return ApiResponse.<PaymentResponse>builder()
                .message("Payment retrieved successfully!")
                .result(paymentService.getPaymentById(id))
                .build();
    }

    @GetMapping("/booking/{bookingId}")
    public ApiResponse<List<PaymentResponse>> getPaymentsByBooking(@PathVariable Long bookingId) {
        return ApiResponse.<List<PaymentResponse>>builder()
                .message("Payments retrieved successfully!")
                .result(paymentService.getPaymentsByBooking(bookingId))
                .build();
    }

    @GetMapping("/status/{status}")
    public ApiResponse<List<PaymentResponse>> getPaymentsByStatus(@PathVariable String status) {
        return ApiResponse.<List<PaymentResponse>>builder()
                .message("Payments retrieved successfully!")
                .result(paymentService.getPaymentsByStatus(status))
                .build();
    }

    @GetMapping
    public ApiResponse<List<PaymentResponse>> getAllPayments() {
        return ApiResponse.<List<PaymentResponse>>builder()
                .message("Payments retrieved successfully!")
                .result(paymentService.getAll())
                .build();
    }

    @GetMapping("/paginated")
    public ApiResponse<PageResponse<PaymentResponse>> getAllPaymentsPaginated(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.<PageResponse<PaymentResponse>>builder()
                .message("Payments retrieved successfully!")
                .result(paymentService.getAllPaginated(page, size))
                .build();
    }

    @PostMapping("/vnpay/create")
    public ApiResponse<VnPayPaymentUrlResponse> createVnPayPaymentUrl(
            @RequestParam Long bookingId,
            HttpServletRequest request
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        String clientIp = extractClientIp(request);

        return ApiResponse.<VnPayPaymentUrlResponse>builder()
                .message("VNPay url created successfully!")
                .result(vnPayService.createPaymentUrl(userId, bookingId, clientIp))
                .build();
    }

    @GetMapping("/vnpay/callback")
    public ResponseEntity<Void> handleVnPayCallback(@RequestParam Map<String, String> params) {
        String redirectUrl = vnPayService.handleCallback(params);
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(redirectUrl))
                .build();
    }

    private String extractClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }

        return request.getRemoteAddr();
    }
}
