package com.rent_vehicle.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VehicleImageResponse {
    Long id;
    Long vehicleModelId;
    String imageUrl;
}
