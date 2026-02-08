package com.rent_vehicle.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "vehicles")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne
    @JoinColumn(name = "vehicle_model_id", nullable = false)
    VehicleModel vehicleModel;

    @Column(name = "license_plate", unique = true, nullable = false)
    String licensePlate;

    @Column(name = "location")
    String location;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    VehicleStatus status;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL)
    List<Booking> bookings;

    public enum VehicleStatus {
        available, rented, maintenance, deleted
    }
}
