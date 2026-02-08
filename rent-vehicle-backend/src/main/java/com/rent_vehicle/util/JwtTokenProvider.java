package com.rent_vehicle.util;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

import javax.crypto.spec.SecretKeySpec;
import java.time.Instant;
import java.util.Date;

@Component
public class JwtTokenProvider {

    @Value("${jwt.signerKey:MySecretKeyForJwtTokenGenerationAndValidation1234567890}")
    private String signerKey;

    @Value("${jwt.valid-duration:3600}")
    private long validDuration;

    public String generateToken(String email, Long userId, String fullName, String role) throws JOSEException {
        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .subject(email)
                .claim("userId", userId)
                .claim("fullName", fullName)
                .claim("role", role)
                .issueTime(new Date())
                .expirationTime(new Date(System.currentTimeMillis() + validDuration * 1000))
                .build();

        SignedJWT signedJWT = new SignedJWT(
                new JWSHeader(JWSAlgorithm.HS256),
                claims
        );

        signedJWT.sign(new MACSigner(signerKey.getBytes()));
        return signedJWT.serialize();
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
}
