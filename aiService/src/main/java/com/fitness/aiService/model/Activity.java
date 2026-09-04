package com.fitness.aiService.model;


import lombok.Data;
import java.time.LocalDateTime;
import java.util.Map;

@Data
public class Activity {
    private String id;
    private String userid;
    private String type;
    private Integer duration;
    private Integer caloriesBurned;
    private LocalDateTime startTime;
    private Map<String,Object> additonalMetrics;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
