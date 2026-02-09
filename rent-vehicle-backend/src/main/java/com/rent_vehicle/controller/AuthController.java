package com.rent_vehicle.controller;

import com.nimbusds.jose.JOSEException;
import com.rent_vehicle.dto.request.AdminLoginRequest;
import com.rent_vehicle.dto.request.AdminVerifyOtpRequest;
import com.rent_vehicle.dto.request.ChangePasswordConfirmRequest;
import com.rent_vehicle.dto.request.ForgotPasswordConfirmRequest;
import com.rent_vehicle.dto.request.ForgotPasswordRequest;
import com.rent_vehicle.dto.response.ApiResponse;
import com.rent_vehicle.dto.response.AuthResponse;
import com.rent_vehicle.exception.AppException;
import com.rent_vehicle.exception.ErrorCode;
import com.rent_vehicle.model.User;
import com.rent_vehicle.service.AuthService;
import com.rent_vehicle.service.OAuth2Service;
import com.rent_vehicle.util.CookieUtil;
import com.rent_vehicle.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final OAuth2Service oauth2Service;
    private final JwtUtil jwtUtil;
    private final CookieUtil cookieUtil;

    @PostMapping("/register")
    public ApiResponse<?> register(
            @RequestBody Map<String, String> request,
            HttpServletResponse response) throws JOSEException {
        String fullName = request.get("fullName");
        String email = request.get("email");
        String password = request.get("password");

        ApiResponse<AuthResponse> authResponse = authService.registerUser(fullName, email, password);
        AuthResponse result = authResponse.getResult();
        
        // Set cookies (accessToken + sessionId, NOT refreshToken)
        cookieUtil.addAccessTokenCookie(response, result.getAccessToken());
        cookieUtil.addSessionIdCookie(response, result.getSessionId());
        
        // Return response without tokens in body (tokens are in cookies)
        return ApiResponse.builder()
                .message("Register successful")
                .result(Map.of(
                        "userId", result.getUserId(),
                        "email", result.getEmail(),
                        "fullName", result.getFullName(),
                        "role", result.getRole()
                ))
                .build();
    }

    @PostMapping("/login")
    public ApiResponse<?> login(
            @RequestBody Map<String, String> request,
            HttpServletResponse response) throws JOSEException {
        String email = request.get("email");
        String password = request.get("password");

        ApiResponse<AuthResponse> authResponse = authService.loginUser(email, password);
        AuthResponse result = authResponse.getResult();
        
        // Set cookies (accessToken + sessionId, NOT refreshToken)
        cookieUtil.addAccessTokenCookie(response, result.getAccessToken());
        cookieUtil.addSessionIdCookie(response, result.getSessionId());
        
        // Return response without tokens in body (tokens are in cookies)
        return ApiResponse.builder()
                .message("Login successful")
                .result(Map.of(
                        "userId", result.getUserId(),
                        "email", result.getEmail(),
                        "fullName", result.getFullName(),
                        "role", result.getRole()
                ))
                .build();
    }

    @PostMapping("/admin/login")
    public ApiResponse<?> adminLogin(@RequestBody AdminLoginRequest request) {
        return authService.initiateAdminLogin(request.getUsername(), request.getPassword());
    }

    @PostMapping("/admin/verify")
    public ApiResponse<?> verifyAdminLogin(
            @RequestBody AdminVerifyOtpRequest request,
            HttpServletResponse response) throws JOSEException {
        ApiResponse<AuthResponse> authResponse = authService.verifyAdminLoginOtp(
                request.getUsername(),
                request.getCode()
        );
        AuthResponse result = authResponse.getResult();

        cookieUtil.addAccessTokenCookie(response, result.getAccessToken());
        cookieUtil.addSessionIdCookie(response, result.getSessionId());

        return ApiResponse.builder()
                .message("Admin login successful")
                .result(Map.of(
                        "userId", result.getUserId(),
                        "email", result.getEmail(),
                        "fullName", result.getFullName(),
                        "role", result.getRole()
                ))
                .build();
    }

    @PostMapping("/password/change/request-code")
    public ApiResponse<?> requestChangePasswordOtp() {
        return authService.requestChangePasswordOtp();
    }

    @PostMapping("/password/change/confirm")
    public ApiResponse<?> confirmChangePassword(@RequestBody ChangePasswordConfirmRequest request) {
        return authService.confirmChangePassword(
                request.getCode(),
                request.getOldPassword(),
                request.getNewPassword(),
                request.getConfirmPassword()
        );
    }

    @PostMapping("/password/forgot/request-code")
    public ApiResponse<?> requestForgotPasswordOtp(@RequestBody ForgotPasswordRequest request) {
        return authService.requestForgotPasswordOtp(request.getEmail());
    }

    @PostMapping("/password/forgot/confirm")
    public ApiResponse<?> confirmForgotPassword(@RequestBody ForgotPasswordConfirmRequest request) {
        return authService.confirmForgotPassword(
                request.getEmail(),
                request.getCode(),
                request.getNewPassword(),
                request.getConfirmPassword()
        );
    }

    @PostMapping("/oauth2/google")
    public ApiResponse<?> googleLogin(
            @RequestBody Map<String, String> request,
            HttpServletResponse response) throws JOSEException {
        String token = request.get("token");
        ApiResponse<AuthResponse> authResponse = oauth2Service.handleGoogleLogin(token);
        AuthResponse result = authResponse.getResult();
        
        cookieUtil.addAccessTokenCookie(response, result.getAccessToken());
        cookieUtil.addSessionIdCookie(response, result.getSessionId());
        
        return ApiResponse.builder()
                .message("Google login successful")
                .result(Map.of(
                        "userId", result.getUserId(),
                        "email", result.getEmail(),
                        "fullName", result.getFullName(),
                        "role", result.getRole()
                ))
                .build();
    }

    @PostMapping("/oauth2/facebook")
    public ApiResponse<?> facebookLogin(
            @RequestBody Map<String, String> request,
            HttpServletResponse response) throws JOSEException {
        String token = request.get("token");
        ApiResponse<AuthResponse> authResponse = oauth2Service.handleFacebookLogin(token);
        AuthResponse result = authResponse.getResult();
        
        cookieUtil.addAccessTokenCookie(response, result.getAccessToken());
        cookieUtil.addSessionIdCookie(response, result.getSessionId());
        
        return ApiResponse.builder()
                .message("Facebook login successful")
                .result(Map.of(
                        "userId", result.getUserId(),
                        "email", result.getEmail(),
                        "fullName", result.getFullName(),
                        "role", result.getRole()
                ))
                .build();
    }

    @PostMapping("/verify-token")
    public ApiResponse<?> verifyToken(HttpServletRequest request) {
        String token = cookieUtil.getAccessTokenFromCookie(request);
        
        if (token == null || !jwtUtil.validateToken(token)) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        
        String email = jwtUtil.getEmailFromToken(token);
        Long userId = jwtUtil.getUserIdFromToken(token);
        String fullName = jwtUtil.getFullNameFromToken(token);
        String role = jwtUtil.getRoleFromToken(token);

        return ApiResponse.builder()
                .message("Token valid")
                .result(Map.of(
                        "email", email,
                        "userId", userId,
                        "fullName", fullName,
                        "role", role
                ))
                .build();
    }

    @GetMapping("/me")
    public ApiResponse<?> getCurrentUser(HttpServletRequest request) {
        String token = cookieUtil.getAccessTokenFromCookie(request);

        if (token == null || !jwtUtil.validateToken(token)) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        String email = jwtUtil.getEmailFromToken(token);
        User user = authService.getUserByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        return ApiResponse.builder()
                .message("User info retrieved")
                .result(Map.of(
                        "userId", user.getId(),
                        "email", user.getEmail(),
                        "fullName", user.getFullName(),
                        "role", user.getRole().name(),
                        "authProvider", user.getAuthProvider()
                ))
                .build();
    }

    @GetMapping("/user-info")
    public ApiResponse<?> getUserInfo(HttpServletRequest request) {
        String token = cookieUtil.getAccessTokenFromCookie(request);

        if (token == null || !jwtUtil.validateToken(token)) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        
        String email = jwtUtil.getEmailFromToken(token);
        return ApiResponse.builder()
                .message("User info retrieved")
                .result(authService.getUserByEmail(email))
                .build();
    }

    @PostMapping("/refresh")
    public ApiResponse<?> refreshToken(
            HttpServletRequest request,
            HttpServletResponse response) throws JOSEException {
        String sessionId = cookieUtil.getSessionIdFromCookie(request);
        
        if (sessionId == null) {
            throw new AppException(ErrorCode.SESSION_EXPIRED);
        }
        
        ApiResponse<AuthResponse> authResponse = authService.refreshAccessToken(sessionId);
        AuthResponse result = authResponse.getResult();
        
        // Set new access token cookie
        cookieUtil.addAccessTokenCookie(response, result.getAccessToken());
        
        return ApiResponse.builder()
                .message("Token refreshed successfully")
                .result(Map.of(
                        "userId", result.getUserId(),
                        "email", result.getEmail(),
                        "fullName", result.getFullName(),
                        "role", result.getRole()
                ))
                .build();
    }

    @PostMapping("/logout")
    public ApiResponse<?> logout(
            HttpServletRequest request,
            HttpServletResponse response) {
        String accessToken = cookieUtil.getAccessTokenFromCookie(request);
        String sessionId = cookieUtil.getSessionIdFromCookie(request);
        
        // Invalidate tokens in Redis
        authService.logout(accessToken, sessionId);
        
        // Clear cookies
        cookieUtil.clearAuthCookies(response);
        
        return ApiResponse.builder()
                .message("Logout successful")
                .build();
    }

    @PostMapping("/logout-all")
    public ApiResponse<?> logoutAllDevices(
            HttpServletRequest request,
            HttpServletResponse response) {
        String accessToken = cookieUtil.getAccessTokenFromCookie(request);
        
        if (accessToken != null && jwtUtil.validateToken(accessToken)) {
            Long userId = jwtUtil.getUserIdFromToken(accessToken);
            authService.logoutAllDevices(userId, accessToken);
        }
        
        // Clear cookies
        cookieUtil.clearAuthCookies(response);
        
        return ApiResponse.builder()
                .message("Logged out from all devices")
                .build();
    }
}
