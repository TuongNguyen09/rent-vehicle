package com.rent_vehicle.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VehicleModelResponse {
    Long id;
    String name;
    Long vehicleTypeId;
    String vehicleTypeName;
    String brand;
    BigDecimal pricePerDay;
    String description;
    Integer seats;
    String transmission;
    String fuel;
    String location;
    List<String> features;
    List<String> images;
    LocalDateTime createdAt;
    Double averageRating;
    Long totalTrips;
    Long reviewCount;
}
