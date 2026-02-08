package com.rent_vehicle.util;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.text.ParseException;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtUtil {

    @Value("${jwt.signerKey:MySecretKeyForJwtTokenGenerationAndValidation1234567890}")
    private String signerKey;

    @Value("${jwt.access-token-duration:900}")
    private long accessTokenDuration; // 15 minutes

    @Value("${jwt.refresh-token-duration:604800}")
    private long refreshTokenDuration; // 7 days

    /**
     * Generate Access Token với JTI để có thể blacklist
     */
    public String generateAccessToken(String email, Long userId, String fullName, String role, String jti) throws JOSEException {
        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .subject(email)
                .claim("userId", userId)
                .claim("fullName", fullName)
                .claim("role", role)
                .claim("type", "access")
                .jwtID(jti)
                .issueTime(new Date())
                .expirationTime(new Date(System.currentTimeMillis() + accessTokenDuration * 1000))
                .build();

        SignedJWT signedJWT = new SignedJWT(
                new JWSHeader(JWSAlgorithm.HS256),
                claims
        );

        signedJWT.sign(new MACSigner(signerKey.getBytes()));
        return signedJWT.serialize();
    }

    /**
     * Generate Refresh Token
     */
    public String generateRefreshToken(String email, Long userId, String tokenId) throws JOSEException {
        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .subject(email)
                .claim("userId", userId)
                .claim("tokenId", tokenId)
                .claim("type", "refresh")
                .jwtID(tokenId)
                .issueTime(new Date())
                .expirationTime(new Date(System.currentTimeMillis() + refreshTokenDuration * 1000))
                .build();

        SignedJWT signedJWT = new SignedJWT(
                new JWSHeader(JWSAlgorithm.HS256),
                claims
        );

        signedJWT.sign(new MACSigner(signerKey.getBytes()));
        return signedJWT.serialize();
    }

    /**
     * Generate token cũ (để tương thích với code hiện tại)
     * @deprecated Sử dụng generateAccessToken thay thế
     */
    @Deprecated
    public String generateToken(String email, Long userId, String fullName, String role) throws JOSEException {
        return generateAccessToken(email, userId, fullName, role, UUID.randomUUID().toString());
    }

    public boolean validateToken(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            signedJWT.verify(new MACVerifier(signerKey.getBytes()));
            
            Date expirationTime = signedJWT.getJWTClaimsSet().getExpirationTime();
            return expirationTime.after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    public String getEmailFromToken(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            return signedJWT.getJWTClaimsSet().getSubject();
        } catch (Exception e) {
            return null;
        }
    }

    public Long getUserIdFromToken(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            return ((Number) signedJWT.getJWTClaimsSet().getClaim("userId")).longValue();
        } catch (Exception e) {
            return null;
        }
    }

    public String getFullNameFromToken(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            return (String) signedJWT.getJWTClaimsSet().getClaim("fullName");
        } catch (Exception e) {
            return null;
        }
    }

    public String getRoleFromToken(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            return (String) signedJWT.getJWTClaimsSet().getClaim("role");
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Lấy JTI (JWT ID) từ token để blacklist
     */
    public String getJtiFromToken(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            return signedJWT.getJWTClaimsSet().getJWTID();
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Lấy tokenId từ refresh token
     */
    public String getTokenIdFromRefreshToken(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            return (String) signedJWT.getJWTClaimsSet().getClaim("tokenId");
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Lấy thời gian còn lại của token (giây)
     */
    public long getRemainingTTL(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            Date expirationTime = signedJWT.getJWTClaimsSet().getExpirationTime();
            long remaining = (expirationTime.getTime() - System.currentTimeMillis()) / 1000;
            return Math.max(0, remaining);
        } catch (Exception e) {
            return 0;
        }
    }

    /**
     * Lấy loại token (access hoặc refresh)
     */
    public String getTokenType(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            return (String) signedJWT.getJWTClaimsSet().getClaim("type");
        } catch (Exception e) {
            return null;
        }
    }

    public long getAccessTokenDuration() {
        return accessTokenDuration;
    }

    public long getRefreshTokenDuration() {
        return refreshTokenDuration;
    }
}
