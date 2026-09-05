package com.fitness.activityService.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LeaderboardEntryResponse {
    private int rank;
    private String userId;
    private String name;
    private String username;
    private Integer totalCalories;
    private Integer totalMinutes;
    private Integer totalWorkouts;
    private Integer pulseScore;
    private String tier; // GOLD, SILVER, BRONZE, ELITE, CHALLENGER
    private String profilePictureUrl;
}
