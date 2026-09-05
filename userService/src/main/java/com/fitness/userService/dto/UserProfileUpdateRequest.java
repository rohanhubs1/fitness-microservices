package com.fitness.userService.dto;

import lombok.Data;

@Data
public class UserProfileUpdateRequest {
    private String firstName;
    private String lastName;
    private Double weight;
    private Double height;
    private Integer age;
    private String gender;
    private String fitnessGoal;
    private Integer targetDailyCalories;
    private String profilePictureUrl;
}