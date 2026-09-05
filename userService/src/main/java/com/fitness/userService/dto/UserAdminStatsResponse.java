package com.fitness.userService.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAdminStatsResponse {
    private long totalUsers;
    private long activeUsers;
    private long deactivatedUsers;
    private Map<String, Long> goalBreakdown;
    private Map<String, Long> genderBreakdown;
}
