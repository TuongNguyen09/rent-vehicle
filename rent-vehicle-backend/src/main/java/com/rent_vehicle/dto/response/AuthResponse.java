package com.rent_vehicle.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {
    private String accessToken;
    private String sessionId;  // Session ID để lưu trong cookie (thay vì refreshToken)
    private Long userId;
    private String email;
    private String fullName;
    private String role;
    private Long accessTokenExpiry;  // in seconds
}
