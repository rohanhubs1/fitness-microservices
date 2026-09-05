package com.fitness.activityService.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlatformActivityStatsResponse {
    private long totalWorkouts;
    private long totalCaloriesBurned;
    private long totalMinutesLogged;
    private double averageCaloriesPerWorkout;
    private Map<String, Long> sportDistribution;
}
