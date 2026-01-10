package com.longne.tourapplication.service;

import com.longne.tourapplication.Mapper.UserMapper;
import com.longne.tourapplication.dto.PasswordChangeRequest;
import com.longne.tourapplication.dto.UserRequest;
import com.longne.tourapplication.dto.UserResponse;
import com.longne.tourapplication.entity.User;
import com.longne.tourapplication.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final CloudinaryService cloudinaryService;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(userMapper::toResponse)
                .toList();
    }

    public Optional<UserResponse> getUserById(Long id) {
        return userRepository.findById(id)
                .map(userMapper::toResponse);
    }

    public UserResponse createAdmin(UserRequest req) {
        User user = userMapper.toEntity(req);
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setRole("ROLE_ADMIN");
        User savedUser = userRepository.save(user);
        return userMapper.toResponse(savedUser);
    }

    public Optional<UserResponse> updateUserInfo(Long id, UserRequest req) {
        return userRepository.findById(id).map(user -> {
            user.setFullName(req.getFullName());
            user.setPhoneNumber(req.getPhoneNumber());
            user.setProvince(req.getProvince());
            user.setDistrict(req.getDistrict());
            User savedUser = userRepository.save(user);
            return userMapper.toResponse(savedUser);
        });
    }

    public boolean changePassword(Long id, PasswordChangeRequest req) {
        return userRepository.findById(id).map(user -> {
            if (passwordEncoder.matches(req.getOldPassword(), user.getPassword())) {
                user.setPassword(passwordEncoder.encode(req.getNewPassword()));
                userRepository.save(user);
                return true;
            }
            return false;
        }).orElse(false);
    }

    public Optional<UserResponse> uploadAvatar(Long id, MultipartFile file) throws IOException {
        String contentType = file.getContentType();
        if (!("image/jpeg".equals(contentType) || "image/png".equals(contentType))) {
            throw new IllegalArgumentException("Chỉ up được file ảnh có đuôi JPEG và PNG");
        }

        return userRepository.findById(id).map(user -> {
            try {
                String url = cloudinaryService.uploadImage(file);
                user.setAvatar(url);
                User savedUser = userRepository.save(user);
                return userMapper.toResponse(savedUser);
            } catch (IOException e) {
                throw new RuntimeException("Upload failed");
            }
        });
    }

    public boolean deleteUser(Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }

}
