package com.rent_vehicle.dto.request;

import lombok.Data;

@Data
public class ForgotPasswordConfirmRequest {
    private String email;
    private String code;
    private String newPassword;
    private String confirmPassword;
}
