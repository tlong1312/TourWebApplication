package com.longne.tourapplication.service;

import com.longne.tourapplication.constants.SecurityConstants;
import com.longne.tourapplication.entity.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.stream.Collectors;

@Service
public class TokenService {

    public String generateToken(Authentication authentication) {
        SecretKey key = Keys.hmacShaKeyFor(SecurityConstants.JWT_KEY.getBytes(StandardCharsets.UTF_8));
        User user = (User) authentication.getPrincipal();

        return Jwts.builder()
                .setIssuer("Tour App")
                .setSubject("JWT Token")
                .claim("username", authentication.getName())
                .claim("userId", user.getId())
                .claim("authorities", authentication.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .collect(Collectors.joining(",")))
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 900000))
                .signWith(key).compact();
    }

    public String generateRefreshToken(Authentication authentication) {
        SecretKey key = Keys.hmacShaKeyFor(SecurityConstants.JWT_KEY.getBytes(StandardCharsets.UTF_8));
        User user = (User) authentication.getPrincipal();

        return Jwts.builder()
                .setIssuer("Tour App")
                .setSubject("Refresh Token")
                .claim("username", authentication.getName())
                .claim("userId", user.getId())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 604800000)) // 7 ngày
                .signWith(key).compact();
    }
}
