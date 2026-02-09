package com.rent_vehicle.service;

import com.rent_vehicle.exception.AppException;
import com.rent_vehicle.exception.ErrorCode;
import com.rent_vehicle.model.Booking;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.MailException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:}")
    private String fromEmail;

    @Value("${app.frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    public void sendBookingApprovedEmail(Booking booking) {
        String to = booking.getUser().getEmail();
        String subject = "Booking #" + booking.getId() + " approved";
        String bookingUrl = frontendBaseUrl + "/my-bookings";
        String paymentUrl = frontendBaseUrl + "/payment/" + booking.getId();

        Booking.PaymentMethod method = booking.getPaymentMethod() != null
                ? booking.getPaymentMethod()
                : Booking.PaymentMethod.bank;

        String paymentInstruction = method == Booking.PaymentMethod.bank
                ? "Please complete online payment at: " + paymentUrl
                : "Payment method: cash at pickup.";

        String body = """
                Hello %s,

                Your booking #%d has been approved.
                Vehicle model: %s
                Pickup date: %s
                Return date: %s
                Total amount: %s

                %s

                You can also view booking details at: %s

                Thank you for using our service.
                """.formatted(
                booking.getUser().getFullName(),
                booking.getId(),
                booking.getVehicleModel().getName(),
                booking.getStartDate(),
                booking.getEndDate(),
                booking.getTotalPrice(),
                paymentInstruction,
                bookingUrl
        );

        sendSimpleMessage(to, subject, body);
    }

    public void sendAdminLoginOtpEmail(String to, String fullName, String otpCode, long expiresInSeconds) {
        String subject = "Admin login verification code";
        long minutes = Math.max(1, expiresInSeconds / 60);

        String body = """
                Hello %s,

                Your admin login verification code is: %s
                This code will expire in %d minute(s).

                If you did not request this login, please ignore this email.
                """.formatted(fullName == null ? "Admin" : fullName, otpCode, minutes);

        sendSimpleMessage(to, subject, body);
    }

    public void sendPasswordChangeOtpEmail(String to, String fullName, String otpCode, long expiresInSeconds) {
        String subject = "Password change verification code";
        long minutes = Math.max(1, expiresInSeconds / 60);

        String body = """
                Hello %s,

                Your password change verification code is: %s
                This code will expire in %d minute(s).

                If you did not request this action, please secure your account immediately.
                """.formatted(fullName == null ? "User" : fullName, otpCode, minutes);

        sendSimpleMessage(to, subject, body);
    }

    public void sendPasswordResetOtpEmail(String to, String fullName, String otpCode, long expiresInSeconds) {
        String subject = "Password reset verification code";
        long minutes = Math.max(1, expiresInSeconds / 60);

        String body = """
                Hello %s,

                Your password reset verification code is: %s
                This code will expire in %d minute(s).

                If you did not request a password reset, please ignore this email.
                """.formatted(fullName == null ? "User" : fullName, otpCode, minutes);

        sendSimpleMessage(to, subject, body);
    }

    public void sendPasswordChangedSuccessEmail(String to, String fullName) {
        String subject = "Password changed successfully";

        String body = """
                Hello %s,

                Your account password has been changed successfully.

                If you did not perform this action, please contact support immediately.
                """.formatted(fullName == null ? "User" : fullName);

        sendSimpleMessage(to, subject, body);
    }

    public void sendPasswordResetSuccessEmail(String to, String fullName) {
        String subject = "Password reset successfully";

        String body = """
                Hello %s,

                Your account password has been reset successfully.

                If you did not perform this action, please contact support immediately.
                """.formatted(fullName == null ? "User" : fullName);

        sendSimpleMessage(to, subject, body);
    }

    private void sendSimpleMessage(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        if (fromEmail != null && !fromEmail.isBlank()) {
            message.setFrom(fromEmail);
        }
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);

        try {
            mailSender.send(message);
        } catch (MailAuthenticationException exception) {
            log.error("Mail authentication failed for recipient {}", to);
            throw new AppException(ErrorCode.EMAIL_SEND_FAILED);
        } catch (MailException exception) {
            log.error("Failed to send email to {}: {}", to, exception.getMessage());
            throw new AppException(ErrorCode.EMAIL_SEND_FAILED);
        }
    }
}
