package com.rent_vehicle.service;

import com.rent_vehicle.model.Booking;
import com.rent_vehicle.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingEmailEventConsumer {

    private final BookingRepository bookingRepository;
    private final EmailService emailService;

    @KafkaListener(
            topics = "${app.kafka.topics.booking-approved-email:booking-approved-email}",
            groupId = "${spring.kafka.consumer.group-id:test-group}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void onBookingApproved(String payload) {
        Long bookingId = parseBookingId(payload);
        if (bookingId == null) {
            return;
        }

        Booking booking = bookingRepository.findById(bookingId).orElse(null);
        if (booking == null) {
            log.warn("Skip booking-approved email because booking {} was not found", bookingId);
            return;
        }

        try {
            emailService.sendBookingApprovedEmail(booking);
            log.info("Booking-approved email sent for booking {}", bookingId);
        } catch (Exception ex) {
            log.warn("Failed to send booking-approved email for booking {}", bookingId, ex);
        }
    }

    private Long parseBookingId(String payload) {
        if (payload == null || payload.isBlank()) {
            log.warn("Skip booking-approved event with empty payload");
            return null;
        }

        try {
            return Long.parseLong(payload.trim());
        } catch (NumberFormatException ex) {
            log.warn("Skip booking-approved event because payload is not a valid bookingId: {}", payload);
            return null;
        }
    }
}
