package com.fitness.userService.service;

import com.fitness.userService.dto.RegisterRequest;
import com.fitness.userService.dto.UserResponse;
import com.fitness.userService.model.User;
import com.fitness.userService.repository.UserRepository;
import org.jspecify.annotations.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public UserResponse register(RegisterRequest request) {

        if(userRepository.existsByEmail(request.getEmail())){
            User existingUser = userRepository.findByEmail(request.getEmail());
            if (request.getKeycloakId() != null && !request.getKeycloakId().isBlank()) {
                existingUser.setKeycloakId(request.getKeycloakId());
                if (request.getUsername() != null) existingUser.setUsername(request.getUsername());
                if (request.getFirstName() != null) existingUser.setFirstName(request.getFirstName());
                if (request.getLastName() != null) existingUser.setLastName(request.getLastName());
                existingUser = userRepository.save(existingUser);
            }

            UserResponse userResponse = new UserResponse();
            userResponse.setId(existingUser.getId());
            userResponse.setUsername(existingUser.getUsername());
            userResponse.setKeycloakId(existingUser.getKeycloakId());
            userResponse.setEmail(existingUser.getEmail());
            userResponse.setFirstName(existingUser.getFirstName());
            userResponse.setLastName(existingUser.getLastName());
            userResponse.setCreatedAt(existingUser.getCreatedAt());
            userResponse.setUpdatedAt(existingUser.getUpdatedAt());
            return userResponse;
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());
        user.setKeycloakId(request.getKeycloakId());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        User savedUser = userRepository.save(user);

        UserResponse userResponse = new UserResponse();
        userResponse.setId(savedUser.getId());
        userResponse.setUsername(savedUser.getUsername());
        userResponse.setKeycloakId(savedUser.getKeycloakId());
        userResponse.setEmail(savedUser.getEmail());
        userResponse.setFirstName(savedUser.getFirstName());
        userResponse.setLastName(savedUser.getLastName());
        userResponse.setCreatedAt(savedUser.getCreatedAt());
        userResponse.setUpdatedAt(savedUser.getUpdatedAt());
        return userResponse;

    }

    public UserResponse getUserProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseGet(() -> userRepository.findAll().stream()
                        .filter(u -> userId.equals(u.getKeycloakId()))
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("User Not Found with ID:" + userId)));
        UserResponse userResponse = new UserResponse();
        userResponse.setId(user.getId());
        userResponse.setUsername(user.getUsername());
        userResponse.setKeycloakId(user.getKeycloakId());
        userResponse.setEmail(user.getEmail());
        userResponse.setFirstName(user.getFirstName());
        userResponse.setLastName(user.getLastName());
        userResponse.setCreatedAt(user.getCreatedAt());
        userResponse.setUpdatedAt(user.getUpdatedAt());
        return userResponse;
    }

    public Boolean existByUserId(String userId) {
        if (userId == null || userId.isBlank()) return false;
        return userRepository.existsById(userId);
    }

    public Boolean existBykeycloakId(String userId) {
        if (userId == null || userId.isBlank()) return false;
        return Boolean.TRUE.equals(userRepository.existsByKeycloakId(userId)) || userRepository.existsById(userId);
    }
}
