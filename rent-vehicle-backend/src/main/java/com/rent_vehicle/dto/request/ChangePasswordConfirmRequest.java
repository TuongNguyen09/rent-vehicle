package com.rent_vehicle.dto.request;

import lombok.Data;

@Data
public class ChangePasswordConfirmRequest {
    private String code;
    private String oldPassword;
    private String newPassword;
    private String confirmPassword;
}
