package com.rent_vehicle.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateBookingRequest {
    Long vehicleModelId;
    Long vehicleId;
    String paymentMethod;
    LocalDate startDate;
    LocalDate endDate;
}
