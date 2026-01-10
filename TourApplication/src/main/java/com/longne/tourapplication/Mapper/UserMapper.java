package com.longne.tourapplication.Mapper;

import com.longne.tourapplication.dto.UserRequest;
import com.longne.tourapplication.dto.UserResponse;
import com.longne.tourapplication.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserMapper {
    public UserResponse toResponse(User user) {
        UserResponse res = new UserResponse();
        res.setId(user.getId());
        res.setEmail(user.getEmail());
        res.setFullName(user.getFullName());
        res.setPhoneNumber(user.getPhoneNumber());
        res.setProvince(user.getProvince());
        res.setDistrict(user.getDistrict());
        res.setRole(user.getRole());
        res.setAvatar(user.getAvatar());
        return res;
    }

    public User toEntity(UserRequest req) {
        User user = new User();
        user.setEmail(req.getEmail());
        user.setPassword(req.getPassword());
        user.setFullName(req.getFullName());
        user.setPhoneNumber(req.getPhoneNumber());
        user.setProvince(req.getProvince());
        user.setDistrict(req.getDistrict());
        user.setRole(req.getRole());
        user.setAvatar(req.getAvatar());
        return user;
    }

}
