package com.rent_vehicle.service;

import com.rent_vehicle.dto.response.VnPayPaymentUrlResponse;
import com.rent_vehicle.exception.AppException;
import com.rent_vehicle.exception.ErrorCode;
import com.rent_vehicle.model.Booking;
import com.rent_vehicle.model.Payment;
import com.rent_vehicle.repository.BookingRepository;
import com.rent_vehicle.repository.PaymentRepository;
import com.rent_vehicle.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.StringJoiner;
import java.util.TreeMap;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class VnPayService {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    @Value("${app.vnpay.tmn-code:}")
    private String tmnCode;

    @Value("${app.vnpay.hash-secret:}")
    private String hashSecret;

    @Value("${app.vnpay.pay-url:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
    private String payUrl;

    @Value("${app.vnpay.return-url:http://localhost:8080/rent-vehicle/payments/vnpay/callback}")
    private String returnUrl;

    @Value("${app.vnpay.txn-timeout-minutes:15}")
    private int txnTimeoutMinutes;

    @Value("${app.frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    @PreAuthorize("hasAnyAuthority('USER','ADMIN')")
    public VnPayPaymentUrlResponse createPaymentUrl(Long bookingId, String clientIp) {
        validateConfig();
        Long userId = SecurityUtils.getCurrentUserId();

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        if (!Objects.equals(booking.getUser().getId(), userId)) {
            throw new AppException(ErrorCode.BOOKING_NOT_AUTHORIZED);
        }

        if (!booking.getStatus().equals(Booking.BookingStatus.approved)) {
            throw new AppException(ErrorCode.INVALID_BOOKING_STATUS);
        }

        if (!resolveBookingPaymentMethod(booking).equals(Booking.PaymentMethod.bank)) {
            throw new AppException(ErrorCode.INVALID_PAYMENT_METHOD, "Booking does not use bank transfer method");
        }

        if (paymentRepository.findByBookingIdAndStatus(bookingId, Payment.PaymentStatus.success).isPresent()) {
            throw new AppException(ErrorCode.PAYMENT_ALREADY_PROCESSED);
        }

        Payment pendingPayment = paymentRepository
                .findTopByBookingIdAndMethodAndStatusOrderByCreatedAtDesc(
                        bookingId,
                        Payment.PaymentMethod.vnpay,
                        Payment.PaymentStatus.pending
                )
                .orElseGet(() -> paymentRepository.save(
                        Payment.builder()
                                .booking(booking)
                                .amount(booking.getTotalPrice())
                                .method(Payment.PaymentMethod.vnpay)
                                .status(Payment.PaymentStatus.pending)
                                .build()
                ));

        String paymentUrl = buildPaymentUrl(booking, pendingPayment, resolveClientIp(clientIp));

        return VnPayPaymentUrlResponse.builder()
                .bookingId(booking.getId())
                .paymentId(pendingPayment.getId())
                .paymentUrl(paymentUrl)
                .build();
    }

    public String handleCallback(Map<String, String> params) {
        validateConfig();

        if (params == null || params.isEmpty()) {
            return buildFrontendCallbackUrl("failed", null, null, "invalid_request");
        }

        String secureHash = params.get("vnp_SecureHash");
        String txnRef = params.get("vnp_TxnRef");
        String responseCode = params.getOrDefault("vnp_ResponseCode", "");
        String transactionStatus = params.getOrDefault("vnp_TransactionStatus", "");

        boolean validHash = verifySecureHash(params, secureHash);
        Long paymentId = parseLong(txnRef);
        Long bookingId = null;
        String status = "failed";
        String reason = validHash ? (responseCode.isBlank() ? "unknown" : responseCode) : "invalid_hash";

        if (paymentId == null) {
            return buildFrontendCallbackUrl("failed", null, null, "invalid_txn_ref");
        }

        Optional<Payment> paymentOptional = paymentRepository.findById(paymentId);
        if (paymentOptional.isEmpty()) {
            return buildFrontendCallbackUrl("failed", null, paymentId, "payment_not_found");
        }

        Payment payment = paymentOptional.get();
        bookingId = payment.getBooking().getId();

        boolean isSuccess = validHash
                && "00".equals(responseCode)
                && "00".equals(transactionStatus);

        if (isSuccess) {
            markPaymentSuccess(payment);
            status = "success";
        } else {
            markPaymentFailed(payment);
        }

        return buildFrontendCallbackUrl(status, bookingId, paymentId, reason);
    }

    private void markPaymentSuccess(Payment payment) {
        if (payment.getStatus() != Payment.PaymentStatus.success) {
            payment.setStatus(Payment.PaymentStatus.success);
            paymentRepository.save(payment);
        }

        Booking booking = payment.getBooking();
        if (booking.getStatus() == Booking.BookingStatus.approved) {
            booking.setStatus(Booking.BookingStatus.completed);
            bookingRepository.save(booking);
        }
    }

    private void markPaymentFailed(Payment payment) {
        if (payment.getStatus() == Payment.PaymentStatus.pending) {
            payment.setStatus(Payment.PaymentStatus.failed);
            paymentRepository.save(payment);
        }
    }

    private Booking.PaymentMethod resolveBookingPaymentMethod(Booking booking) {
        return booking.getPaymentMethod() != null ? booking.getPaymentMethod() : Booking.PaymentMethod.bank;
    }

    private String buildPaymentUrl(Booking booking, Payment payment, String clientIp) {
        LocalDateTime now = LocalDateTime.now();
        String createDate = formatVnPayDate(now);
        String expireDate = formatVnPayDate(now.plusMinutes(Math.max(txnTimeoutMinutes, 1)));

        String normalizedTmnCode = normalizeConfigValue(tmnCode);
        String normalizedReturnUrl = normalizeConfigValue(returnUrl);
        String normalizedPayUrl = normalizeConfigValue(payUrl);
        String normalizedHashSecret = normalizeConfigValue(hashSecret);

        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", normalizedTmnCode);
        params.put("vnp_Amount", toVnPayAmount(booking.getTotalPrice()));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", String.valueOf(payment.getId()));
        params.put("vnp_OrderInfo", "Thanh toan booking #" + booking.getId());
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", normalizedReturnUrl);
        params.put("vnp_IpAddr", clientIp);
        params.put("vnp_CreateDate", createDate);
        params.put("vnp_ExpireDate", expireDate);

        String hashData = buildQueryString(params);
        String secureHash = hmacSha512(normalizedHashSecret, hashData);

        return normalizedPayUrl + "?" + hashData + "&vnp_SecureHash=" + secureHash;
    }

    private boolean verifySecureHash(Map<String, String> params, String secureHash) {
        if (secureHash == null || secureHash.isBlank()) {
            return false;
        }

        Map<String, String> filtered = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);
        filtered.putAll(params);
        filtered.remove("vnp_SecureHash");
        filtered.remove("vnp_SecureHashType");

        Map<String, String> normalized = new TreeMap<>();
        filtered.forEach((key, value) -> {
            if (key != null && value != null && !value.isBlank()) {
                normalized.put(key, value);
            }
        });

        String signData = buildQueryString(normalized);
        String expectedHash = hmacSha512(hashSecret, signData);
        return expectedHash.equalsIgnoreCase(secureHash);
    }

    private String buildQueryString(Map<String, String> params) {
        StringJoiner joiner = new StringJoiner("&");
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (entry.getValue() == null || entry.getValue().isBlank()) {
                continue;
            }
            joiner.add(encode(entry.getKey()) + "=" + encode(entry.getValue()));
        }
        return joiner.toString();
    }

    private String buildFrontendCallbackUrl(String status, Long bookingId, Long paymentId, String reason) {
        UriComponentsBuilder builder = UriComponentsBuilder
                .fromUriString(frontendBaseUrl + "/payment/callback")
                .queryParam("status", status);

        if (bookingId != null) {
            builder.queryParam("bookingId", bookingId);
        }
        if (paymentId != null) {
            builder.queryParam("paymentId", paymentId);
        }
        if (reason != null && !reason.isBlank()) {
            builder.queryParam("reason", reason);
        }

        return builder.build(true).toUriString();
    }

    private String toVnPayAmount(BigDecimal amount) {
        BigDecimal normalized = amount == null ? BigDecimal.ZERO : amount;
        return normalized.multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .toPlainString();
    }

    private String formatVnPayDate(LocalDateTime value) {
        return value.format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
    }

    private String resolveClientIp(String rawIp) {
        if (rawIp == null || rawIp.isBlank() || rawIp.contains(",") || rawIp.contains(":")) {
            return "127.0.0.1";
        }
        return rawIp.trim();
    }

    private void validateConfig() {
        if (normalizeConfigValue(tmnCode).isBlank()
                || normalizeConfigValue(hashSecret).isBlank()
                || normalizeConfigValue(payUrl).isBlank()
                || normalizeConfigValue(returnUrl).isBlank()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "VNPay configuration is missing");
        }
    }

    private Long parseLong(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Long.parseLong(value.trim());
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private String hmacSha512(String key, String data) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac.init(secretKeySpec);
            byte[] hash = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                String value = Integer.toHexString(0xff & b);
                if (value.length() == 1) {
                    hex.append('0');
                }
                hex.append(value);
            }
            return hex.toString();
        } catch (Exception ex) {
            log.error("Failed to sign VNPay data", ex);
            throw new AppException(ErrorCode.PAYMENT_FAILED);
        }
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private String normalizeConfigValue(String value) {
        return value == null ? "" : value.trim();
    }
}
