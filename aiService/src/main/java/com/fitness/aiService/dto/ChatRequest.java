package com.fitness.aiService.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequest {
    private String message;
    private Double userWeight;
    private Double userHeight;
    private String fitnessGoal;
    private Integer age;
    private String gender;
}