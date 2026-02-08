package com.rent_vehicle.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @Column(name = "title", nullable = false)
    String title;

    @Column(name = "message", nullable = false, length = 2000)
    String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    NotificationType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    NotificationStatus status;

    @Column(name = "link_url")
    String linkUrl;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    public enum NotificationType {
        booking, payment, system
    }

    public enum NotificationStatus {
        unread, read
    }
}
