package com.rent_vehicle.util;

import com.rent_vehicle.exception.AppException;
import com.rent_vehicle.exception.ErrorCode;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

public class SecurityUtils {

    public static Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        if (authentication.getPrincipal() instanceof Jwt) {
            Jwt jwt = (Jwt) authentication.getPrincipal();
            Object userId = jwt.getClaim("userId");
            
            if (userId == null) {
                throw new AppException(ErrorCode.UNAUTHENTICATED);
            }

            if (userId instanceof Number) {
                return ((Number) userId).longValue();
            }

            try {
                return Long.parseLong(userId.toString());
            } catch (NumberFormatException e) {
                throw new AppException(ErrorCode.UNAUTHENTICATED);
            }
        }

        throw new AppException(ErrorCode.UNAUTHENTICATED);
    }

    public static String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        if (authentication.getPrincipal() instanceof Jwt) {
            Jwt jwt = (Jwt) authentication.getPrincipal();
            String email = jwt.getClaimAsString("email");
            
            if (email == null) {
                throw new AppException(ErrorCode.UNAUTHENTICATED);
            }

            return email;
        }

        throw new AppException(ErrorCode.UNAUTHENTICATED);
    }
}
