package com.fitness.userService.controller;

import com.fitness.userService.dto.RegisterRequest;
import com.fitness.userService.dto.UserResponse;
import com.fitness.userService.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getProfile(@RequestHeader(value = "X-User-ID", required = false) String userId) {
        return ResponseEntity.ok(userService.getUserProfile(userId));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(
            @RequestHeader(value = "X-User-ID", required = false) String userId,
            @RequestBody com.fitness.userService.dto.UserProfileUpdateRequest request) {
        return ResponseEntity.ok(userService.updateProfile(userId, request));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUserProfile(@PathVariable String userId){
        return ResponseEntity.ok(userService.getUserProfile(userId));
    }

    @GetMapping("/admin/all")
    public ResponseEntity<java.util.List<UserResponse>> getAllUsersAdmin() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/admin/stats")
    public ResponseEntity<com.fitness.userService.dto.UserAdminStatsResponse> getAdminStats() {
        return ResponseEntity.ok(userService.getAdminStats());
    }

    @PutMapping("/admin/{userId}/deactivate")
    public ResponseEntity<UserResponse> deactivateUser(@PathVariable String userId) {
        return ResponseEntity.ok(userService.softDeleteUser(userId));
    }

    @PutMapping("/admin/{userId}/restore")
    public ResponseEntity<UserResponse> restoreUser(@PathVariable String userId) {
        return ResponseEntity.ok(userService.restoreUser(userId));
    }

    @DeleteMapping("/admin/{userId}/purge")
    public ResponseEntity<Void> purgeUser(@PathVariable String userId) {
        userService.hardDeleteUser(userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request){
        return ResponseEntity.ok(userService.register(request));
    }

    @GetMapping("/{userId}/validate")
    public ResponseEntity<Boolean> validateUser(@PathVariable String userId){
        return ResponseEntity.ok(userService.existBykeycloakId(userId));
    }
}

