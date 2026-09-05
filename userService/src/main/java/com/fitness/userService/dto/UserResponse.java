package com.fitness.userService.dto;

import com.fitness.userService.model.UserRole;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserResponse {
    private String id;
    private String username;
    private String keycloakId;
    private String email;
    private String firstName;
    private String lastName;
    private Double weight;
    private Double height;
    private Integer age;
    private String gender;
    private String fitnessGoal;
    private Integer targetDailyCalories;
    private String profilePictureUrl;
    private UserRole role;
    private Boolean deleted;
    private LocalDateTime deletedAt;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
