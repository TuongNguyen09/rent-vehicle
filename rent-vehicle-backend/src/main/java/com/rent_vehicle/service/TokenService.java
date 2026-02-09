package com.rent_vehicle.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class TokenService {

    private final RedisTemplate<String, String> redisTemplate;

    @Value("${jwt.access-token-duration:900}")
    private long accessTokenDuration; // 15 minutes

    @Value("${jwt.refresh-token-duration:604800}")
    private long refreshTokenDuration; // 7 days

    @Value("${auth.admin-otp-duration:300}")
    private long adminOtpDuration; // 5 minutes

    @Value("${auth.password-otp-duration:300}")
    private long passwordOtpDuration; // 5 minutes

    // Redis key prefixes
    private static final String REFRESH_TOKEN_PREFIX = "refresh_token:";
    private static final String SESSION_PREFIX = "session:";
    private static final String BLACKLIST_PREFIX = "blacklist:";
    private static final String USER_SESSIONS_PREFIX = "user_sessions:";
    private static final String ADMIN_OTP_PREFIX = "admin_otp:";
    private static final String PASSWORD_CHANGE_OTP_PREFIX = "password_change_otp:";
    private static final String PASSWORD_RESET_OTP_PREFIX = "password_reset_otp:";

    /**
     * Lưu refresh token vào Redis với session ID
     * @param userId ID của user
     * @param refreshToken Refresh token (chỉ lưu trong Redis, không gửi về client)
     * @param sessionId Session ID (gửi về client qua cookie)
     */
    public void saveRefreshToken(Long userId, String refreshToken, String sessionId) {
        // Lưu refresh token
        String tokenKey = REFRESH_TOKEN_PREFIX + userId + ":" + sessionId;
        redisTemplate.opsForValue().set(tokenKey, refreshToken, refreshTokenDuration, TimeUnit.SECONDS);
        
        // Lưu mapping session -> userId để có thể tìm refresh token chỉ từ sessionId
        String sessionKey = SESSION_PREFIX + sessionId;
        redisTemplate.opsForValue().set(sessionKey, String.valueOf(userId), refreshTokenDuration, TimeUnit.SECONDS);
        
        // Thêm sessionId vào set sessions của user
        String sessionsKey = USER_SESSIONS_PREFIX + userId;
        redisTemplate.opsForSet().add(sessionsKey, sessionId);
        redisTemplate.expire(sessionsKey, refreshTokenDuration, TimeUnit.SECONDS);
        
        log.info("Saved refresh token for user {} with sessionId {}", userId, sessionId);
    }

    /**
     * Lấy userId từ sessionId
     */
    public Long getUserIdFromSession(String sessionId) {
        String sessionKey = SESSION_PREFIX + sessionId;
        String userIdStr = redisTemplate.opsForValue().get(sessionKey);
        return userIdStr != null ? Long.parseLong(userIdStr) : null;
    }

    /**
     * Lấy refresh token từ Redis bằng sessionId
     */
    public String getRefreshTokenBySessionId(String sessionId) {
        Long userId = getUserIdFromSession(sessionId);
        if (userId == null) {
            return null;
        }
        String tokenKey = REFRESH_TOKEN_PREFIX + userId + ":" + sessionId;
        return redisTemplate.opsForValue().get(tokenKey);
    }

    /**
     * Lấy refresh token từ Redis
     */
    public String getRefreshToken(Long userId, String sessionId) {
        String key = REFRESH_TOKEN_PREFIX + userId + ":" + sessionId;
        return redisTemplate.opsForValue().get(key);
    }

    /**
     * Xóa refresh token và session (khi logout)
     */
    public void deleteRefreshToken(Long userId, String sessionId) {
        String tokenKey = REFRESH_TOKEN_PREFIX + userId + ":" + sessionId;
        String sessionKey = SESSION_PREFIX + sessionId;
        
        redisTemplate.delete(tokenKey);
        redisTemplate.delete(sessionKey);
        
        // Xóa khỏi set sessions
        String sessionsKey = USER_SESSIONS_PREFIX + userId;
        redisTemplate.opsForSet().remove(sessionsKey, sessionId);
        
        log.info("Deleted refresh token for user {} with sessionId {}", userId, sessionId);
    }

    /**
     * Xóa session bằng sessionId only (khi không biết userId)
     */
    public void deleteSession(String sessionId) {
        Long userId = getUserIdFromSession(sessionId);
        if (userId != null) {
            deleteRefreshToken(userId, sessionId);
        }
    }

    /**
     * Xóa tất cả refresh tokens của user (logout all devices)
     */
    public void deleteAllRefreshTokens(Long userId) {
        String sessionsKey = USER_SESSIONS_PREFIX + userId;
        Set<String> sessionIds = redisTemplate.opsForSet().members(sessionsKey);
        
        if (sessionIds != null) {
            for (String sessionId : sessionIds) {
                String tokenKey = REFRESH_TOKEN_PREFIX + userId + ":" + sessionId;
                String sessionKey = SESSION_PREFIX + sessionId;
                redisTemplate.delete(tokenKey);
                redisTemplate.delete(sessionKey);
            }
        }
        redisTemplate.delete(sessionsKey);
        
        log.info("Deleted all refresh tokens for user {}", userId);
    }

    /**
     * Thêm access token vào blacklist (khi logout)
     * @param jti JWT ID của access token
     * @param remainingTTL Thời gian còn lại của token (giây)
     */
    public void blacklistAccessToken(String jti, long remainingTTL) {
        if (remainingTTL > 0) {
            String key = BLACKLIST_PREFIX + jti;
            redisTemplate.opsForValue().set(key, "revoked", remainingTTL, TimeUnit.SECONDS);
            log.info("Blacklisted access token with jti {}", jti);
        }
    }

    /**
     * Kiểm tra access token có bị blacklist không
     */
    public boolean isAccessTokenBlacklisted(String jti) {
        String key = BLACKLIST_PREFIX + jti;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    /**
     * Validate refresh token bằng sessionId
     */
    public boolean validateSession(String sessionId) {
        return getRefreshTokenBySessionId(sessionId) != null;
    }

    /**
     * Generate unique session ID
     */
    public String generateSessionId() {
        return UUID.randomUUID().toString();
    }

    /**
     * Generate unique token ID
     */
    public String generateTokenId() {
        return UUID.randomUUID().toString();
    }

    public void saveAdminOtp(String username, String otpCode) {
        String key = ADMIN_OTP_PREFIX + normalizeUsername(username);
        redisTemplate.opsForValue().set(key, otpCode, adminOtpDuration, TimeUnit.SECONDS);
    }

    public String getAdminOtp(String username) {
        String key = ADMIN_OTP_PREFIX + normalizeUsername(username);
        return redisTemplate.opsForValue().get(key);
    }

    public void deleteAdminOtp(String username) {
        String key = ADMIN_OTP_PREFIX + normalizeUsername(username);
        redisTemplate.delete(key);
    }

    public long getAdminOtpDuration() {
        return adminOtpDuration;
    }

    public void savePasswordChangeOtp(String email, String otpCode) {
        String key = PASSWORD_CHANGE_OTP_PREFIX + normalizeEmail(email);
        redisTemplate.opsForValue().set(key, otpCode, passwordOtpDuration, TimeUnit.SECONDS);
    }

    public String getPasswordChangeOtp(String email) {
        String key = PASSWORD_CHANGE_OTP_PREFIX + normalizeEmail(email);
        return redisTemplate.opsForValue().get(key);
    }

    public void deletePasswordChangeOtp(String email) {
        String key = PASSWORD_CHANGE_OTP_PREFIX + normalizeEmail(email);
        redisTemplate.delete(key);
    }

    public void savePasswordResetOtp(String email, String otpCode) {
        String key = PASSWORD_RESET_OTP_PREFIX + normalizeEmail(email);
        redisTemplate.opsForValue().set(key, otpCode, passwordOtpDuration, TimeUnit.SECONDS);
    }

    public String getPasswordResetOtp(String email) {
        String key = PASSWORD_RESET_OTP_PREFIX + normalizeEmail(email);
        return redisTemplate.opsForValue().get(key);
    }

    public void deletePasswordResetOtp(String email) {
        String key = PASSWORD_RESET_OTP_PREFIX + normalizeEmail(email);
        redisTemplate.delete(key);
    }

    public long getPasswordOtpDuration() {
        return passwordOtpDuration;
    }

    private String normalizeUsername(String username) {
        return username == null ? "" : username.trim().toLowerCase();
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }
}
