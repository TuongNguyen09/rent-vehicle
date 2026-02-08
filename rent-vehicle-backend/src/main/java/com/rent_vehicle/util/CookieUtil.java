package com.rent_vehicle.util;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class CookieUtil {

    @Value("${cookie.secure:false}")
    private boolean secure;

    @Value("${cookie.same-site:Lax}")
    private String sameSite;

    @Value("${cookie.domain:localhost}")
    private String domain;

    @Value("${jwt.access-token-duration:900}")
    private long accessTokenDuration;

    @Value("${jwt.refresh-token-duration:604800}")
    private long refreshTokenDuration;

    public static final String ACCESS_TOKEN_COOKIE = "accessToken";
    public static final String SESSION_ID_COOKIE = "sessionId";

    /**
     * Tạo cookie chứa access token
     */
    public void addAccessTokenCookie(HttpServletResponse response, String token) {
        addCookie(response, ACCESS_TOKEN_COOKIE, token, (int) accessTokenDuration, "/");
    }

    /**
     * Tạo cookie chứa session ID (thay vì refresh token)
     * Session ID dùng để tìm refresh token trong Redis
     */
    public void addSessionIdCookie(HttpServletResponse response, String sessionId) {
        addCookie(response, SESSION_ID_COOKIE, sessionId, (int) refreshTokenDuration, "/rent-vehicle/auth");
    }

    /**
     * Xóa cả 2 cookies (khi logout)
     */
    public void clearAuthCookies(HttpServletResponse response) {
        clearCookie(response, ACCESS_TOKEN_COOKIE, "/");
        clearCookie(response, SESSION_ID_COOKIE, "/rent-vehicle/auth");
    }

    /**
     * Lấy access token từ cookie
     */
    public String getAccessTokenFromCookie(HttpServletRequest request) {
        return getCookieValue(request, ACCESS_TOKEN_COOKIE);
    }

    /**
     * Lấy session ID từ cookie
     */
    public String getSessionIdFromCookie(HttpServletRequest request) {
        return getCookieValue(request, SESSION_ID_COOKIE);
    }

    private void addCookie(HttpServletResponse response, String name, String value, int maxAge, String path) {
        StringBuilder cookieBuilder = new StringBuilder();
        cookieBuilder.append(name).append("=").append(value);
        cookieBuilder.append("; Max-Age=").append(maxAge);
        cookieBuilder.append("; Path=").append(path);
        cookieBuilder.append("; HttpOnly");
        
        if (secure) {
            cookieBuilder.append("; Secure");
        }
        
        cookieBuilder.append("; SameSite=").append(sameSite);
        
        response.addHeader("Set-Cookie", cookieBuilder.toString());
    }

    private void clearCookie(HttpServletResponse response, String name, String path) {
        StringBuilder cookieBuilder = new StringBuilder();
        cookieBuilder.append(name).append("=");
        cookieBuilder.append("; Max-Age=0");
        cookieBuilder.append("; Path=").append(path);
        cookieBuilder.append("; HttpOnly");
        
        if (secure) {
            cookieBuilder.append("; Secure");
        }
        
        cookieBuilder.append("; SameSite=").append(sameSite);
        
        response.addHeader("Set-Cookie", cookieBuilder.toString());
    }

    private String getCookieValue(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (name.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}
