package com.fitness.userService.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(unique = true, nullable = false)
    private String email;

    private String username;

    private String keycloakId;

    private String password;
    private String firstName;
    private String lastName;

    private Double weight; // in kg (default: 70.0)
    private Double height; // in cm (default: 175.0)
    private Integer age;   // default: 25
    private String gender; // Male / Female / Other
    private String fitnessGoal; // WEIGHT_LOSS / MUSCLE_BUILDING / ENDURANCE / MAINTENANCE
    private Integer targetDailyCalories; // default: 500

    @Column(columnDefinition = "TEXT")
    private String profilePictureUrl;

    @Enumerated(EnumType.STRING)
    private UserRole role = UserRole.USER;

    private Boolean deleted = false;

    private LocalDateTime deletedAt;

    private String status = "ACTIVE"; // ACTIVE, DEACTIVATED

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
