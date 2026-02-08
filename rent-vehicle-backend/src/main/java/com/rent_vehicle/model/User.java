package com.rent_vehicle.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "full_name", nullable = false)
    String fullName;

    @Column(name = "email", unique = true, nullable = false)
    String email;

    @Column(name = "password")
    String password;

    @Column(name = "auth_provider")
    String authProvider; // LOCAL, GOOGLE, FACEBOOK

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    Role role;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    Status status;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    List<Booking> bookings;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    List<Review> reviews;

    public enum Role {
        ADMIN, USER
    }

    public enum Status {
        active, banned
    }
}
