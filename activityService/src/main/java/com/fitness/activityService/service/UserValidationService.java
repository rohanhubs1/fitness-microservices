package com.fitness.activityService.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserValidationService {
    private final WebClient userServiceWebClient;

    public boolean validateUser(String userId) {
        if (userId == null || userId.isBlank()) {
            return false;
        }
        try {
            Boolean isValid = userServiceWebClient.get()
                    .uri("/api/users/{userId}/validate", userId)
                    .retrieve()
                    .bodyToMono(Boolean.class)
                    .block();
            return Boolean.TRUE.equals(isValid);
        } catch (Exception e) {
            log.warn("User validation check against userService returned error: {}. Assuming user valid to allow activity logging.", e.getMessage());
            return true;
        }
    }

    public List<Map<String, Object>> getAllUsers() {
        try {
            return userServiceWebClient.get()
                    .uri("/api/users/admin/all")
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {})
                    .block();
        } catch (Exception e) {
            log.warn("Failed to fetch users from userService: {}", e.getMessage());
            return Collections.emptyList();
        }
    }
}
