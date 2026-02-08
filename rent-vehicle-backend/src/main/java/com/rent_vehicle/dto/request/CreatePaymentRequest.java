package com.rent_vehicle.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreatePaymentRequest {
    Long bookingId;
    BigDecimal amount;
    String method; // vnpay, momo, cash
}
