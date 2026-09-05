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
        return mapToResponse(savedUser);
    }

    public UserResponse getUserProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseGet(() -> userRepository.findAll().stream()
                        .filter(u -> userId.equals(u.getKeycloakId()))
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("User Not Found with ID:" + userId)));
        return mapToResponse(user);
    }

    public UserResponse updateProfile(String userId, com.fitness.userService.dto.UserProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseGet(() -> userRepository.findAll().stream()
                        .filter(u -> userId.equals(u.getKeycloakId()))
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("User Not Found with ID:" + userId)));

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getWeight() != null) user.setWeight(request.getWeight());
        if (request.getHeight() != null) user.setHeight(request.getHeight());
        if (request.getAge() != null) user.setAge(request.getAge());
        if (request.getGender() != null) user.setGender(request.getGender());
        if (request.getFitnessGoal() != null) user.setFitnessGoal(request.getFitnessGoal());
        if (request.getTargetDailyCalories() != null) user.setTargetDailyCalories(request.getTargetDailyCalories());
        if (request.getProfilePictureUrl() != null) user.setProfilePictureUrl(request.getProfilePictureUrl());

        User updated = userRepository.save(user);
        return mapToResponse(updated);
    }

    private UserResponse mapToResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setKeycloakId(user.getKeycloakId());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setWeight(user.getWeight());
        response.setHeight(user.getHeight());
        response.setAge(user.getAge());
        response.setGender(user.getGender());
        response.setFitnessGoal(user.getFitnessGoal());
        response.setTargetDailyCalories(user.getTargetDailyCalories());
        response.setProfilePictureUrl(user.getProfilePictureUrl());
        response.setRole(user.getRole() != null ? user.getRole() : com.fitness.userService.model.UserRole.USER);
        response.setDeleted(user.getDeleted() != null ? user.getDeleted() : false);
        response.setDeletedAt(user.getDeletedAt());
        response.setStatus(user.getStatus() != null ? user.getStatus() : "ACTIVE");
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        return response;
    }

    public java.util.List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() != com.fitness.userService.model.UserRole.ADMIN && !"admin@pulseforge.ai".equalsIgnoreCase(u.getEmail()))
                .map(this::mapToResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    public UserResponse softDeleteUser(String userId) {
        User user = findUserByIdOrKeycloakId(userId);
        user.setDeleted(true);
        user.setStatus("DEACTIVATED");
        user.setDeletedAt(java.time.LocalDateTime.now());
        User saved = userRepository.save(user);
        return mapToResponse(saved);
    }

    public UserResponse restoreUser(String userId) {
        User user = findUserByIdOrKeycloakId(userId);
        user.setDeleted(false);
        user.setStatus("ACTIVE");
        user.setDeletedAt(null);
        User saved = userRepository.save(user);
        return mapToResponse(saved);
    }

    public void hardDeleteUser(String userId) {
        User user = findUserByIdOrKeycloakId(userId);
        userRepository.delete(user);
    }

    public com.fitness.userService.dto.UserAdminStatsResponse getAdminStats() {
        java.util.List<User> all = userRepository.findAll().stream()
                .filter(u -> u.getRole() != com.fitness.userService.model.UserRole.ADMIN && !"admin@pulseforge.ai".equalsIgnoreCase(u.getEmail()))
                .collect(java.util.stream.Collectors.toList());
        long total = all.size();
        long active = all.stream().filter(u -> !Boolean.TRUE.equals(u.getDeleted())).count();
        long deactivated = total - active;

        java.util.Map<String, Long> goals = all.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        u -> u.getFitnessGoal() != null ? u.getFitnessGoal() : "MAINTENANCE",
                        java.util.stream.Collectors.counting()
                ));

        java.util.Map<String, Long> genders = all.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        u -> u.getGender() != null ? u.getGender() : "Not Specified",
                        java.util.stream.Collectors.counting()
                ));

        return com.fitness.userService.dto.UserAdminStatsResponse.builder()
                .totalUsers(total)
                .activeUsers(active)
                .deactivatedUsers(deactivated)
                .goalBreakdown(goals)
                .genderBreakdown(genders)
                .build();
    }

    private User findUserByIdOrKeycloakId(String userId) {
        return userRepository.findById(userId)
                .orElseGet(() -> userRepository.findAll().stream()
                        .filter(u -> userId.equals(u.getKeycloakId()))
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("User Not Found with ID: " + userId)));
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

