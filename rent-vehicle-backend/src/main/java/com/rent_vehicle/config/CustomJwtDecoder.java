package com.rent_vehicle.config;

import com.rent_vehicle.service.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

import javax.crypto.spec.SecretKeySpec;

@Component
public class CustomJwtDecoder implements JwtDecoder {
    
    @Value("${jwt.signerKey:MySecretKeyForJwtTokenGenerationAndValidation1234567890}")
    private String signerKey;

    private NimbusJwtDecoder nimbusJwtDecoder = null;
    
    @Autowired
    private TokenService tokenService;

    @Override
    public Jwt decode(String token) throws JwtException {
        try {
            if (nimbusJwtDecoder == null) {
                SecretKeySpec secretKey = new SecretKeySpec(signerKey.getBytes(), "HS256");
                nimbusJwtDecoder = NimbusJwtDecoder
                        .withSecretKey(secretKey)
                        .macAlgorithm(MacAlgorithm.HS256)
                        .build();
            }
            
            Jwt jwt = nimbusJwtDecoder.decode(token);
            
            // Check if token is blacklisted
            String jti = jwt.getId();
            if (jti != null && tokenService.isAccessTokenBlacklisted(jti)) {
                throw new JwtException("Token has been revoked");
            }
            
            return jwt;
        } catch (JwtException e) {
            throw e;
        } catch (Exception e) {
            throw new JwtException("Invalid token");
        }
    }
}
