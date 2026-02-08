package com.rent_vehicle.service;

import com.nimbusds.jose.JOSEException;
import com.rent_vehicle.dto.response.ApiResponse;
import com.rent_vehicle.dto.response.AuthResponse;
import com.rent_vehicle.exception.AppException;
import com.rent_vehicle.exception.ErrorCode;
import com.rent_vehicle.model.User;
import com.rent_vehicle.repository.UserRepository;
import com.rent_vehicle.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class OAuth2Service {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final TokenService tokenService;
    private final AuthService authService;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${spring.security.oauth2.client.registration.google.client-id:}")
    private String googleClientId;

    public ApiResponse<AuthResponse> handleGoogleLogin(String googleToken) throws JOSEException {
        // Verify token với Google TokenInfo API
        String tokenInfoUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + googleToken;
        Map<?, ?> tokenInfo = restTemplate.getForObject(tokenInfoUrl, Map.class);

        if (tokenInfo == null || tokenInfo.get("email") == null) {
            throw new AppException(ErrorCode.OAUTH_TOKEN_INVALID);
        }

        // Verify audience (client ID) để đảm bảo token được cấp cho app của mình
        String audience = (String) tokenInfo.get("aud");
        if (googleClientId != null && !googleClientId.isEmpty() 
                && !googleClientId.equals("YOUR_GOOGLE_CLIENT_ID")
                && !googleClientId.equals(audience)) {
            log.warn("Google token audience mismatch. Expected: {}, Got: {}", googleClientId, audience);
            throw new AppException(ErrorCode.OAUTH_TOKEN_INVALID);
        }

        // Verify email đã được xác thực bởi Google
        Boolean emailVerified = Boolean.parseBoolean(String.valueOf(tokenInfo.get("email_verified")));
        if (!emailVerified) {
            throw new AppException(ErrorCode.OAUTH_EMAIL_NOT_VERIFIED);
        }

        String email = (String) tokenInfo.get("email");
        String name = (String) tokenInfo.get("name");
        if (name == null || name.isEmpty()) {
            name = email.split("@")[0]; // Fallback to email prefix
        }

        return createOrUpdateUserAndGenerateToken(email, name, "GOOGLE");
    }

    public ApiResponse<AuthResponse> handleFacebookLogin(String facebookToken) throws JOSEException {
        // Verify token với Facebook
        String userInfoUrl = "https://graph.facebook.com/me?access_token=" + facebookToken + "&fields=id,name,email";
        Map<?, ?> userInfo = restTemplate.getForObject(userInfoUrl, Map.class);

        if (userInfo == null || userInfo.get("email") == null) {
            throw new AppException(ErrorCode.OAUTH_TOKEN_INVALID);
        }

        String email = (String) userInfo.get("email");
        String name = (String) userInfo.get("name");
        if (name == null || name.isEmpty()) {
            name = email.split("@")[0];
        }

        return createOrUpdateUserAndGenerateToken(email, name, "FACEBOOK");
    }

    private ApiResponse<AuthResponse> createOrUpdateUserAndGenerateToken(String email, String name, String authProvider) throws JOSEException {
        Optional<User> userOpt = userRepository.findByEmail(email);
        User user;

        if (userOpt.isPresent()) {
            user = userOpt.get();
            // Cập nhật auth provider nếu user đã tồn tại nhưng chưa có provider
            if (user.getAuthProvider() == null || user.getAuthProvider().isEmpty()) {
                user.setAuthProvider(authProvider);
                userRepository.save(user);
            }
        } else {
            user = User.builder()
                    .fullName(name)
                    .email(email)
                    .password(null)
                    .authProvider(authProvider)
                    .role(User.Role.USER)
                    .status(User.Status.active)
                    .build();
            userRepository.save(user);
        }

        // Sử dụng AuthService để generate tokens (giống như login thường)
        return authService.generateTokens(user);
    }
}
