package com.fitness.activityService.controller;

import com.fitness.activityService.dto.ActivityRequest;
import com.fitness.activityService.dto.ActivityResponse;
import com.fitness.activityService.service.ActivityService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
@AllArgsConstructor
public class ActivityController {

    private ActivityService activityService;

    @PostMapping
    public ResponseEntity<ActivityResponse> trackActivity(
            @RequestBody ActivityRequest activityRequest,
            @RequestHeader(value = "X-User-ID", required = false) String userId) {
        if (userId != null && !userId.isBlank()) {
            activityRequest.setUserId(userId);
        }
        return ResponseEntity.ok(activityService.trackActivity(activityRequest));
    }

    @GetMapping
    public ResponseEntity<List<ActivityResponse>> getUserActivities(
            @RequestHeader(value = "X-User-ID", required = false) String userId) {
        return ResponseEntity.ok(activityService.getUserActivities(userId));
    }

    @GetMapping("/stats")
    public ResponseEntity<com.fitness.activityService.dto.ActivityStatsResponse> getActivityStats(
            @RequestHeader(value = "X-User-ID", required = false) String userId) {
        return ResponseEntity.ok(activityService.getActivityStats(userId));
    }

    @GetMapping("/{activityId}")
    public ResponseEntity<ActivityResponse> getActivity(@PathVariable String activityId) {
        return ResponseEntity.ok(activityService.getActivityById(activityId));
    }

    @GetMapping("/admin/platform-stats")
    public ResponseEntity<com.fitness.activityService.dto.PlatformActivityStatsResponse> getPlatformStats() {
        return ResponseEntity.ok(activityService.getPlatformActivityStats());
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<com.fitness.activityService.dto.LeaderboardEntryResponse>> getLeaderboard(
            @RequestParam(value = "period", defaultValue = "all") String period) {
        return ResponseEntity.ok(activityService.getLeaderboard(period));
    }

    @DeleteMapping("/{activityId}")
    public ResponseEntity<Void> deleteActivity(@PathVariable String activityId) {
        activityService.deleteActivity(activityId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/user/{userId}")
    public ResponseEntity<Void> deleteUserActivities(@PathVariable String userId) {
        activityService.deleteActivitiesByUserId(userId);
        return ResponseEntity.noContent().build();
    }
}

