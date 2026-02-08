package com.rent_vehicle.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingEmailEventProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;

    @Value("${app.kafka.topics.booking-approved-email:booking-approved-email}")
    private String bookingApprovedEmailTopic;

    public void publishBookingApproved(Long bookingId) {
        if (bookingId == null) {
            log.warn("Skip publishing booking-approved event because bookingId is null");
            return;
        }

        Runnable publishAction = () -> doPublishBookingApproved(bookingId);

        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    publishAction.run();
                }
            });
            return;
        }

        publishAction.run();
    }

    private void doPublishBookingApproved(Long bookingId) {
        String payload = String.valueOf(bookingId);
        kafkaTemplate.send(bookingApprovedEmailTopic, payload)
                .whenComplete((result, throwable) -> {
                    if (throwable != null) {
                        log.warn(
                                "Failed to publish booking-approved event for booking {} to topic {}",
                                bookingId,
                                bookingApprovedEmailTopic,
                                throwable
                        );
                        return;
                    }

                    if (result != null) {
                        log.info(
                                "Published booking-approved event for booking {} to topic {} partition {} offset {}",
                                bookingId,
                                bookingApprovedEmailTopic,
                                result.getRecordMetadata().partition(),
                                result.getRecordMetadata().offset()
                        );
                    }
                });
    }
}
