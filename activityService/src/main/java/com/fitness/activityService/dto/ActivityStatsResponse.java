package com.fitness.activityService.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityStatsResponse {
    private int totalWorkouts;
    private int totalCaloriesBurned;
    private int totalActiveMinutes;
    private int averageCaloriesPerWorkout;
    private int currentStreak;
    private int longestStreak;
    private int activeDays;
    private int pulseScore;
    private int bonusPoints;
    private List<DailyCalorieStat> weeklyCalorieTrend;
    private List<ActivityTypeStat> activityTypeBreakdown;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyCalorieStat {
        private String day;
        private String date;
        private int calories;
        private int minutes;
        private int count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActivityTypeStat {
        private String type;
        private int count;
        private int calories;
        private int minutes;
    }
}