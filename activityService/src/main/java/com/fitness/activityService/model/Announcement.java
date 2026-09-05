package com.fitness.activityService.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "announcements")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Announcement {
    @Id
    private String id;
    private String title;
    private String message;
    private String type; // CHALLENGE, CONTEST, ALERT, ANNOUNCEMENT
    private String prize; // e.g. "🏆 500 PulsePoints + Gold Badge"
    private boolean active;
    private String createdBy;

    // Dynamic Contest & Challenge Configuration
    private String targetActivityType; // ALL, RUNNING, WEIGHT_TRAINING, CYCLING, SWIMMING, HIIT, YOGA
    private String targetMetric;       // CALORIES, DURATION_MINUTES, WORKOUT_COUNT
    private Double targetGoal;         // e.g. 1500.0 (kcal), 120.0 (mins), 5.0 (sessions)
    private Integer pointsAwarded;     // e.g. 500 PulsePoints
    private Integer durationDays;      // e.g. 7 days
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    @CreatedDate
    private LocalDateTime createdAt;
}

