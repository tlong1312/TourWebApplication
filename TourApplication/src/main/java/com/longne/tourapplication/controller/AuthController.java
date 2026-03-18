package com.longne.tourapplication.controller;

import com.longne.tourapplication.dto.LoginRequest;
import com.longne.tourapplication.dto.RegisterRequest;
import com.longne.tourapplication.entity.RefreshToken;
import com.longne.tourapplication.entity.User;
import com.longne.tourapplication.repository.RefreshTokenRepository;
import com.longne.tourapplication.repository.UserRepository;
import com.longne.tourapplication.service.TokenService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;
    private final RefreshTokenRepository refreshTokenRepository;

    @GetMapping("/login")
    public String loginPage(@RequestParam(value = "error", required = false) String error) {
        return "login"; 
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request, BindingResult bindingResult) {

        if(bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error ->
                    errors.put(error.getField(), error.getDefaultMessage())
            );
            return ResponseEntity.badRequest().body(errors);
        }

        if(userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("email", "Email đã được sử dụng"));
        }

        if(!request.getPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("confirmPassword", "Mật khẩu nhập lại không khớp"));
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setProvince(request.getProvince());
        user.setDistrict(request.getDistrict());
        user.setRole("ROLE_USER");
        userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Đăng ký thành công"));
    }

    @PostMapping("/login")
    @Transactional
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest loginRequest, HttpServletResponse response) {
        try{
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String accessToken = tokenService.generateToken(authentication);
            String refreshToken = tokenService.generateRefreshToken(authentication);

            refreshTokenRepository.deleteByEmail(authentication.getName());
            RefreshToken tokenEntity = new RefreshToken();
            tokenEntity.setToken(refreshToken);
            tokenEntity.setEmail(authentication.getName());
            tokenEntity.setExpiryDate(LocalDateTime.now().plusDays(7));
            tokenEntity.setRevoked(false);
            refreshTokenRepository.save(tokenEntity);

            Cookie refreshCookie = new Cookie("refresh_token", refreshToken);
            refreshCookie.setHttpOnly(true);
            refreshCookie.setSecure(false);
            refreshCookie.setPath("/");
            refreshCookie.setMaxAge(7 * 24 * 60 * 60);
            response.addCookie(refreshCookie);

            Map<String, String> responseBody = new HashMap<>();
            responseBody.put("access_token", accessToken);
            responseBody.put("message", "Login successful");

            return ResponseEntity.ok(responseBody);
        }catch(Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Email hoặc mật khẩu không đúng"));
        }
    }

    @PostMapping("/refresh")
    @Transactional
    public ResponseEntity<Map<String, String>> refresh(HttpServletRequest request) {

        String refreshToken = null;
        if(request.getCookies() != null) {
            for(Cookie cookie : request.getCookies()) {
                if("refresh_token".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                    break;
                }
            }
        }

        if(refreshToken == null) {
            throw new RuntimeException("Refresh token not found");
        }

        RefreshToken tokenEntity = refreshTokenRepository.findByTokenAndRevokedFalse(refreshToken)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        if(tokenEntity.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Refresh token expired");
        }

        User user = userRepository.findByEmail(tokenEntity.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                user, null, user.getAuthorities()
        );

        String newAccessToken = tokenService.generateToken(authentication);

        Map<String, String> response = new HashMap<>();
        response.put("access_token", newAccessToken);
        response.put("message", "Refresh successful");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    @Transactional
    public ResponseEntity<String> logout(HttpServletRequest request ,HttpServletResponse response) {
        String refreshToken = null;
        if(request.getCookies() != null) {
            for(Cookie cookie : request.getCookies()) {
                if("refresh_token".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                    break;
                }
            }
        }
        if(refreshToken != null) {
            refreshTokenRepository.findByTokenAndRevokedFalse(refreshToken)
                    .ifPresent(token -> {
                        token.setRevoked(true);
                        refreshTokenRepository.save(token);
                    });
        }

        SecurityContextHolder.clearContext();

        Cookie refreshCookie = new Cookie("refresh_token", "");
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(false);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(0);
        response.addCookie(refreshCookie);

        return ResponseEntity.ok("Logged out successfully");
    }
}
