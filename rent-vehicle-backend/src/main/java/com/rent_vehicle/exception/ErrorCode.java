package com.rent_vehicle.exception;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE)
public enum ErrorCode {
    // --- GENERAL ---
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_REQUEST(1000, "Invalid request", HttpStatus.BAD_REQUEST),
    ACCESS_DENIED(1001, "Access denied", HttpStatus.FORBIDDEN),

    // --- USER / AUTH ---
    USER_NOT_FOUND(2001, "User not found", HttpStatus.NOT_FOUND),
    USER_ALREADY_EXISTS(2002, "User already exists", HttpStatus.BAD_REQUEST),
    EMAIL_ALREADY_EXISTS(2003, "Email already exists", HttpStatus.BAD_REQUEST),
    INVALID_CREDENTIALS(2004, "Invalid email or password", HttpStatus.UNAUTHORIZED),
    UNAUTHENTICATED(2005, "User not authenticated", HttpStatus.UNAUTHORIZED),
    PASSWORD_NOT_MATCH(2006, "Password and confirm password do not match", HttpStatus.BAD_REQUEST),
    USER_BANNED(2007, "User has been banned", HttpStatus.FORBIDDEN),
    SESSION_EXPIRED(2008, "Session expired or invalid", HttpStatus.UNAUTHORIZED),
    TOKEN_GENERATION_ERROR(2009, "Error generating token", HttpStatus.INTERNAL_SERVER_ERROR),
    OAUTH_TOKEN_INVALID(2010, "Invalid OAuth token", HttpStatus.BAD_REQUEST),
    OAUTH_EMAIL_NOT_VERIFIED(2011, "Email not verified by OAuth provider", HttpStatus.BAD_REQUEST),
    INVALID_OTP(2012, "Invalid verification code", HttpStatus.BAD_REQUEST),
    OTP_EXPIRED(2013, "Verification code expired", HttpStatus.BAD_REQUEST),

    // --- VEHICLE MANAGEMENT ---
    VEHICLE_TYPE_NOT_FOUND(3001, "Vehicle type not found", HttpStatus.NOT_FOUND),
    VEHICLE_TYPE_ALREADY_EXISTS(3002, "Vehicle type already exists", HttpStatus.BAD_REQUEST),
    VEHICLE_MODEL_NOT_FOUND(3003, "Vehicle model not found", HttpStatus.NOT_FOUND),
    VEHICLE_NOT_FOUND(3004, "Vehicle not found", HttpStatus.NOT_FOUND),
    VEHICLE_NOT_AVAILABLE(3005, "Vehicle is not available for rent", HttpStatus.BAD_REQUEST),
    INVALID_VEHICLE_LICENSE(3006, "License plate already exists", HttpStatus.BAD_REQUEST),
    INVALID_VEHICLE_STATUS(3007, "Invalid vehicle status", HttpStatus.BAD_REQUEST),
    VEHICLE_IMAGE_NOT_FOUND(3008, "Vehicle image not found", HttpStatus.NOT_FOUND),

    // --- BOOKING ---
    BOOKING_NOT_FOUND(4001, "Booking not found", HttpStatus.NOT_FOUND),
    BOOKING_CONFLICT(4002, "Booking dates conflict with existing bookings", HttpStatus.BAD_REQUEST),
    INVALID_BOOKING_DATE(4003, "Invalid booking dates", HttpStatus.BAD_REQUEST),
    BOOKING_ALREADY_APPROVED(4004, "Booking already approved", HttpStatus.BAD_REQUEST),
    BOOKING_CANNOT_CANCEL(4005, "Booking cannot be cancelled in current status", HttpStatus.BAD_REQUEST),
    BOOKING_NOT_AUTHORIZED(4006, "Not authorized to modify this booking", HttpStatus.FORBIDDEN),
    INVALID_BOOKING_STATUS(4007, "Invalid booking status", HttpStatus.BAD_REQUEST),

    // --- PAYMENT ---
    PAYMENT_NOT_FOUND(5001, "Payment not found", HttpStatus.NOT_FOUND),
    PAYMENT_FAILED(5002, "Payment failed", HttpStatus.BAD_REQUEST),
    PAYMENT_ALREADY_PROCESSED(5003, "Payment already processed", HttpStatus.BAD_REQUEST),
    INVALID_PAYMENT_METHOD(5004, "Invalid payment method", HttpStatus.BAD_REQUEST),
    INVALID_PAYMENT_STATUS(5005, "Invalid payment status", HttpStatus.BAD_REQUEST),
    INSUFFICIENT_AMOUNT(5006, "Payment amount is insufficient", HttpStatus.BAD_REQUEST),

    // --- REVIEW ---
    REVIEW_NOT_FOUND(6001, "Review not found", HttpStatus.NOT_FOUND),
    REVIEW_ALREADY_EXISTS(6002, "Review already exists for this booking", HttpStatus.BAD_REQUEST),
    INVALID_RATING(6003, "Rating must be between 1 and 5", HttpStatus.BAD_REQUEST),
    REVIEW_NOT_AUTHORIZED(6004, "Not authorized to delete this review", HttpStatus.FORBIDDEN),

    // --- FILE UPLOAD ---
    INVALID_IMAGE_URL(7001, "Invalid image URL", HttpStatus.BAD_REQUEST),
    FILE_UPLOAD_FAILED(7002, "Failed to upload file", HttpStatus.INTERNAL_SERVER_ERROR),
    FILE_TOO_LARGE(7003, "File size exceeds maximum limit", HttpStatus.BAD_REQUEST),
    INVALID_FILE_TYPE(7004, "Invalid file type", HttpStatus.BAD_REQUEST),

    // --- NOTIFICATION ---
    NOTIFICATION_NOT_FOUND(8001, "Notification not found", HttpStatus.NOT_FOUND);

    int code;
    String message;
    HttpStatusCode statusCode;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }
}
