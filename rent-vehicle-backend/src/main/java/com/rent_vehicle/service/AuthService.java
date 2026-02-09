package com.rent_vehicle.service;

import com.nimbusds.jose.JOSEException;
import com.rent_vehicle.dto.response.ApiResponse;
import com.rent_vehicle.dto.response.AuthResponse;
import com.rent_vehicle.exception.AppException;
import com.rent_vehicle.exception.ErrorCode;
import com.rent_vehicle.model.User;
import com.rent_vehicle.repository.UserRepository;
import com.rent_vehicle.util.JwtUtil;
import com.rent_vehicle.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Map;
import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final TokenService tokenService;
    private final EmailService emailService;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    public ApiResponse<AuthResponse> registerUser(String fullName, String email, String password) throws JOSEException {
        if (userRepository.existsByEmail(email)) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        User user = User.builder()
                .fullName(fullName)
                .email(email)
                .password(passwordEncoder.encode(password))
                .authProvider("LOCAL")
                .role(User.Role.USER)
                .status(User.Status.active)
                .build();

        userRepository.save(user);

        return generateTokens(user);
    }

    public ApiResponse<AuthResponse> loginUser(String email, String password) throws JOSEException {
        log.info("Login attempt for email: {}", email);
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("User not found: {}", email);
                    return new AppException(ErrorCode.INVALID_CREDENTIALS);
                });

        log.info("User found: {}, authProvider: {}, hasPassword: {}", 
                user.getEmail(), user.getAuthProvider(), user.getPassword() != null);

        if (user.getPassword() == null || !passwordEncoder.matches(password, user.getPassword())) {
            log.warn("Password mismatch for user: {}", email);
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        log.info("Login successful for: {}", email);
        return generateTokens(user);
    }

    public ApiResponse<?> initiateAdminLogin(String username, String password) {
        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        String normalizedUsername = normalizeUsername(username);
        User user = userRepository.findByEmail(normalizedUsername)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_CREDENTIALS));

        if (!user.getRole().equals(User.Role.ADMIN)) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        if (!user.getStatus().equals(User.Status.active)) {
            throw new AppException(ErrorCode.USER_BANNED);
        }

        if (user.getPassword() == null || !passwordEncoder.matches(password, user.getPassword())) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        String otpCode = generateOtpCode();
        tokenService.saveAdminOtp(normalizedUsername, otpCode);
        try {
            emailService.sendAdminLoginOtpEmail(
                    user.getEmail(),
                    user.getFullName(),
                    otpCode,
                    tokenService.getAdminOtpDuration()
            );
        } catch (RuntimeException exception) {
            tokenService.deleteAdminOtp(normalizedUsername);
            throw exception;
        }

        return ApiResponse.builder()
                .message("Verification code sent to email")
                .result(Map.of(
                        "username", normalizedUsername,
                        "expiresIn", tokenService.getAdminOtpDuration()
                ))
                .build();
    }

    public ApiResponse<AuthResponse> verifyAdminLoginOtp(String username, String code) throws JOSEException {
        if (username == null || username.isBlank() || code == null || code.isBlank()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        String normalizedUsername = normalizeUsername(username);
        User user = userRepository.findByEmail(normalizedUsername)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_CREDENTIALS));

        if (!user.getRole().equals(User.Role.ADMIN)) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        String storedOtp = tokenService.getAdminOtp(normalizedUsername);
        if (storedOtp == null) {
            throw new AppException(ErrorCode.OTP_EXPIRED);
        }

        if (!storedOtp.equals(code.trim())) {
            throw new AppException(ErrorCode.INVALID_OTP);
        }

        tokenService.deleteAdminOtp(normalizedUsername);
        return generateTokens(user);
    }

    public ApiResponse<?> requestChangePasswordOtp() {
        String email = SecurityUtils.getCurrentUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        ensureLocalAccount(user);

        String otpCode = generateOtpCode();
        tokenService.savePasswordChangeOtp(user.getEmail(), otpCode);
        try {
            emailService.sendPasswordChangeOtpEmail(
                    user.getEmail(),
                    user.getFullName(),
                    otpCode,
                    tokenService.getPasswordOtpDuration()
            );
        } catch (RuntimeException exception) {
            tokenService.deletePasswordChangeOtp(user.getEmail());
            throw exception;
        }

        return ApiResponse.builder()
                .message("Verification code sent to email")
                .result(Map.of(
                        "email", user.getEmail(),
                        "expiresIn", tokenService.getPasswordOtpDuration()
                ))
                .build();
    }

    public ApiResponse<?> confirmChangePassword(String code, String oldPassword, String newPassword, String confirmPassword) {
        if (code == null || code.isBlank() || oldPassword == null || oldPassword.isBlank()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        String email = SecurityUtils.getCurrentUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        ensureLocalAccount(user);
        validatePassword(newPassword, confirmPassword);

        if (user.getPassword() == null || !passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new AppException(ErrorCode.INVALID_OLD_PASSWORD);
        }

        String storedOtp = tokenService.getPasswordChangeOtp(user.getEmail());
        if (storedOtp == null) {
            throw new AppException(ErrorCode.OTP_EXPIRED);
        }

        if (!storedOtp.equals(code.trim())) {
            throw new AppException(ErrorCode.INVALID_OTP);
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        tokenService.deletePasswordChangeOtp(user.getEmail());
        tokenService.deleteAllRefreshTokens(user.getId());
        try {
            emailService.sendPasswordChangedSuccessEmail(user.getEmail(), user.getFullName());
        } catch (RuntimeException exception) {
            log.warn("Password changed but failed to send confirmation email for {}", user.getEmail());
        }

        return ApiResponse.builder()
                .message("Password changed successfully")
                .build();
    }

    public ApiResponse<?> requestForgotPasswordOtp(String email) {
        if (email == null || email.isBlank()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        String normalizedEmail = normalizeEmail(email);
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        ensureLocalAccount(user);

        String otpCode = generateOtpCode();
        tokenService.savePasswordResetOtp(user.getEmail(), otpCode);
        try {
            emailService.sendPasswordResetOtpEmail(
                    user.getEmail(),
                    user.getFullName(),
                    otpCode,
                    tokenService.getPasswordOtpDuration()
            );
        } catch (RuntimeException exception) {
            tokenService.deletePasswordResetOtp(user.getEmail());
            throw exception;
        }

        return ApiResponse.builder()
                .message("Verification code sent to email")
                .result(Map.of(
                        "email", user.getEmail(),
                        "expiresIn", tokenService.getPasswordOtpDuration()
                ))
                .build();
    }

    public ApiResponse<?> confirmForgotPassword(String email, String code, String newPassword, String confirmPassword) {
        if (email == null || email.isBlank() || code == null || code.isBlank()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        String normalizedEmail = normalizeEmail(email);
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        ensureLocalAccount(user);
        validatePassword(newPassword, confirmPassword);

        String storedOtp = tokenService.getPasswordResetOtp(user.getEmail());
        if (storedOtp == null) {
            throw new AppException(ErrorCode.OTP_EXPIRED);
        }

        if (!storedOtp.equals(code.trim())) {
            throw new AppException(ErrorCode.INVALID_OTP);
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        tokenService.deletePasswordResetOtp(user.getEmail());
        tokenService.deleteAllRefreshTokens(user.getId());
        try {
            emailService.sendPasswordResetSuccessEmail(user.getEmail(), user.getFullName());
        } catch (RuntimeException exception) {
            log.warn("Password reset but failed to send confirmation email for {}", user.getEmail());
        }

        return ApiResponse.builder()
                .message("Password reset successfully")
                .build();
    }

    /**
     * Generate access token và lưu refresh token trong Redis
     * Chỉ trả về accessToken và sessionId (không trả refreshToken về client)
     */
    public ApiResponse<AuthResponse> generateTokens(User user) throws JOSEException {
        // Generate unique IDs
        String sessionId = tokenService.generateSessionId();
        String accessTokenJti = tokenService.generateTokenId();
        
        // Generate access token
        String accessToken = jwtUtil.generateAccessToken(
                user.getEmail(), 
                user.getId(), 
                user.getFullName(), 
                user.getRole().name(),
                accessTokenJti
        );
        
        // Generate refresh token (chỉ lưu trong Redis, không gửi về client)
        String refreshToken = jwtUtil.generateRefreshToken(
                user.getEmail(), 
                user.getId(), 
                sessionId
        );
        
        // Save refresh token to Redis với sessionId
        tokenService.saveRefreshToken(user.getId(), refreshToken, sessionId);
        
        // Response không chứa refreshToken, chỉ có sessionId
        AuthResponse authResponse = AuthResponse.builder()
                .accessToken(accessToken)
                .sessionId(sessionId)  // Thay refreshToken bằng sessionId
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .accessTokenExpiry(jwtUtil.getAccessTokenDuration())
                .build();
        
        return ApiResponse.<AuthResponse>builder()
                .message("Login successful")
                .result(authResponse)
                .build();
    }

    /**
     * Refresh access token using sessionId (refresh token stored in Redis only)
     */
    public ApiResponse<AuthResponse> refreshAccessToken(String sessionId) throws JOSEException {
        // Lấy refresh token từ Redis bằng sessionId
        String refreshToken = tokenService.getRefreshTokenBySessionId(sessionId);
        
        if (refreshToken == null) {
            throw new AppException(ErrorCode.SESSION_EXPIRED);
        }
        
        // Validate refresh token
        if (!jwtUtil.validateToken(refreshToken)) {
            // Token expired, xóa session
            tokenService.deleteSession(sessionId);
            throw new AppException(ErrorCode.SESSION_EXPIRED);
        }
        
        Long userId = jwtUtil.getUserIdFromToken(refreshToken);
        
        // Get user info
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        // Generate new access token only
        String newAccessTokenJti = tokenService.generateTokenId();
        String newAccessToken = jwtUtil.generateAccessToken(
                user.getEmail(),
                user.getId(),
                user.getFullName(),
                user.getRole().name(),
                newAccessTokenJti
        );
        
        AuthResponse authResponse = AuthResponse.builder()
                .accessToken(newAccessToken)
                .sessionId(sessionId)
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .accessTokenExpiry(jwtUtil.getAccessTokenDuration())
                .build();
        
        return ApiResponse.<AuthResponse>builder()
                .message("Token refreshed successfully")
                .result(authResponse)
                .build();
    }

    /**
     * Logout - invalidate tokens
     */
    public void logout(String accessToken, String sessionId) {
        // Blacklist access token
        if (accessToken != null && jwtUtil.validateToken(accessToken)) {
            String jti = jwtUtil.getJtiFromToken(accessToken);
            long remainingTTL = jwtUtil.getRemainingTTL(accessToken);
            if (jti != null) {
                tokenService.blacklistAccessToken(jti, remainingTTL);
            }
        }
        
        // Delete session and refresh token from Redis
        if (sessionId != null) {
            tokenService.deleteSession(sessionId);
        }
    }

    /**
     * Logout from all devices
     */
    public void logoutAllDevices(Long userId, String currentAccessToken) {
        // Blacklist current access token
        if (currentAccessToken != null && jwtUtil.validateToken(currentAccessToken)) {
            String jti = jwtUtil.getJtiFromToken(currentAccessToken);
            long remainingTTL = jwtUtil.getRemainingTTL(currentAccessToken);
            if (jti != null) {
                tokenService.blacklistAccessToken(jti, remainingTTL);
            }
        }
        
        // Delete all refresh tokens and sessions
        tokenService.deleteAllRefreshTokens(userId);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    private String generateOtpCode() {
        int otp = 100000 + SECURE_RANDOM.nextInt(900000);
        return String.valueOf(otp);
    }

    private void ensureLocalAccount(User user) {
        if (!"LOCAL".equalsIgnoreCase(user.getAuthProvider())) {
            throw new AppException(ErrorCode.PASSWORD_CHANGE_NOT_ALLOWED);
        }
    }

    private void validatePassword(String newPassword, String confirmPassword) {
        if (newPassword == null || confirmPassword == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        if (!newPassword.equals(confirmPassword)) {
            throw new AppException(ErrorCode.PASSWORD_NOT_MATCH);
        }

        if (newPassword.trim().length() < 6) {
            throw new AppException(ErrorCode.INVALID_PASSWORD);
        }
    }

    private String normalizeUsername(String username) {
        return username == null ? "" : username.trim().toLowerCase();
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }
}
