package com.rent_vehicle.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateVehicleModelRequest {
    String name;
    Long vehicleTypeId;
    String brand;
    BigDecimal pricePerDay;
    String description;
    Integer seats;
    String transmission;
    String fuel;
    List<String> features;
    List<String> imageUrls;
}
