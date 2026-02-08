package com.rent_vehicle.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VehicleResponse {
    Long id;
    Long vehicleModelId;
    String vehicleModelName;
    String licensePlate;
    String location;
    String status;
    LocalDateTime createdAt;
}
