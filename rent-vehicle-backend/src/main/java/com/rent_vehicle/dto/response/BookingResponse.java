package com.rent_vehicle.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingResponse {
    Long id;
    Long userId;
    String userEmail;
    Long vehicleModelId;
    String vehicleModelName;
    Long vehicleId;
    String vehicleLicensePlate;
    String vehicleLocation;
    String paymentMethod;
    LocalDate startDate;
    LocalDate endDate;
    BigDecimal totalPrice;
    String status;
    LocalDateTime createdAt;
}
