package com.rent_vehicle.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "vehicle_models")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VehicleModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "name", nullable = false)
    String name;

    @ManyToOne
    @JoinColumn(name = "vehicle_type_id", nullable = false)
    VehicleType vehicleType;

    @Column(name = "brand", nullable = false)
    String brand;

    @Column(name = "price_per_day", nullable = false, precision = 10, scale = 2)
    BigDecimal pricePerDay;

    @Column(name = "description", columnDefinition = "TEXT")
    String description;

    @Column(name = "seats", nullable = false)
    Integer seats;

    @Column(name = "transmission", nullable = false)
    String transmission; // "Tự động" or "Số sàn"

    @Column(name = "fuel", nullable = false)
    String fuel; // "Xăng", "Điện", "Diesel", "Hybrid"

    @Column(name = "features", columnDefinition = "TEXT")
    String features; // JSON array or comma-separated

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @OneToMany(mappedBy = "vehicleModel", cascade = CascadeType.ALL)
    List<Vehicle> vehicles;

    @OneToMany(mappedBy = "vehicleModel", cascade = CascadeType.ALL)
    List<VehicleImage> vehicleImages;

    @OneToMany(mappedBy = "vehicleModel", cascade = CascadeType.ALL)
    List<Booking> bookings;
}
