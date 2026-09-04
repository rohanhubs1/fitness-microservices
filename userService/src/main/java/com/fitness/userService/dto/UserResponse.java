package com.fitness.userService.dto;

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
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
