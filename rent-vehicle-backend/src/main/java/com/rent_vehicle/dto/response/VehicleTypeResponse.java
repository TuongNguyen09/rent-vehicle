package com.rent_vehicle.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VehicleTypeResponse {
    Long id;
    String name;
    String description;
    LocalDateTime createdAt;
}
