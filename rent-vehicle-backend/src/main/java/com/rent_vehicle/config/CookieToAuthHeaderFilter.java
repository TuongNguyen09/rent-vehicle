package com.rent_vehicle.config;

import com.rent_vehicle.util.CookieUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.*;

/**
 * Filter để đọc JWT từ Cookie và thêm vào Authorization header
 * Điều này giúp Spring Security OAuth2 Resource Server có thể đọc được token
 */
@Component
@RequiredArgsConstructor
public class CookieToAuthHeaderFilter extends OncePerRequestFilter {

    private final CookieUtil cookieUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        
        // Check if Authorization header already exists
        String existingAuth = request.getHeader("Authorization");
        
        if (existingAuth == null || existingAuth.isBlank()) {
            // Try to get token from cookie
            String accessToken = cookieUtil.getAccessTokenFromCookie(request);
            
            if (accessToken != null && !accessToken.isBlank()) {
                // Wrap request to add Authorization header
                HttpServletRequest wrappedRequest = new HttpServletRequestWrapper(request) {
                    @Override
                    public String getHeader(String name) {
                        if ("Authorization".equalsIgnoreCase(name)) {
                            return "Bearer " + accessToken;
                        }
                        return super.getHeader(name);
                    }

                    @Override
                    public Enumeration<String> getHeaders(String name) {
                        if ("Authorization".equalsIgnoreCase(name)) {
                            return Collections.enumeration(List.of("Bearer " + accessToken));
                        }
                        return super.getHeaders(name);
                    }

                    @Override
                    public Enumeration<String> getHeaderNames() {
                        List<String> names = new ArrayList<>();
                        Enumeration<String> originalNames = super.getHeaderNames();
                        while (originalNames.hasMoreElements()) {
                            names.add(originalNames.nextElement());
                        }
                        if (!names.contains("Authorization")) {
                            names.add("Authorization");
                        }
                        return Collections.enumeration(names);
                    }
                };
                
                filterChain.doFilter(wrappedRequest, response);
                return;
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
