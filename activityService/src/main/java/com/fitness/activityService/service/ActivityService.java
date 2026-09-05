package com.fitness.activityService.service;

import com.fitness.activityService.dto.ActivityRequest;
import com.fitness.activityService.dto.ActivityResponse;
import com.fitness.activityService.dto.ActivityStatsResponse;
import com.fitness.activityService.dto.PlatformActivityStatsResponse;
import com.fitness.activityService.model.Activity;
import com.fitness.activityService.model.Announcement;
import com.fitness.activityService.repository.ActivityRepository;
import com.fitness.activityService.repository.AnnouncementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final com.fitness.activityService.repository.AnnouncementRepository announcementRepository;
    private final UserValidationService userValidationService;
    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange.name}")
    private String exchange;

    @Value("${rabbitmq.routing.key}")
    private String routingKey;

    public ActivityResponse trackActivity(ActivityRequest activityRequest) {

        boolean isValidUser = userValidationService.validateUser(activityRequest.getUserId());
        if (!isValidUser) {
            throw new RuntimeException("Invalid User: " + activityRequest.getUserId());
        }

        java.time.LocalDateTime activityStartTime = activityRequest.getStartTime() != null 
                ? activityRequest.getStartTime() 
                : java.time.LocalDateTime.now();

        Activity activity = Activity.builder()
                .userid(activityRequest.getUserId())
                .type(activityRequest.getType())
                .duration(activityRequest.getDuration())
                .caloriesBurned(activityRequest.getCaloriesBurned())
                .startTime(activityStartTime)
                .additonalMetrics(activityRequest.getAdditionalMetrics())
                .build();

        Activity savedActivity = activityRepository.save(activity);

        // Publish to RabbitMQ for AI Processing
        try {
            rabbitTemplate.convertAndSend(exchange, routingKey, savedActivity);
        } catch (Exception e) {
            log.error("Failed to publish activity to RabbitMQ : ", e);
        }
        return mapToResponse(savedActivity);
    }

    private ActivityResponse mapToResponse(Activity activity) {
        ActivityResponse response = new ActivityResponse();
        response.setId(activity.getId());
        response.setUserid(activity.getUserid());
        response.setType(activity.getType());
        response.setDuration(activity.getDuration());
        response.setCaloriesBurned(activity.getCaloriesBurned());
        response.setStartTime(activity.getStartTime());
        response.setAdditonalMetrics(activity.getAdditonalMetrics());
        response.setCreatedAt(activity.getCreatedAt());
        response.setUpdatedAt(activity.getUpdatedAt());
        return response;
    }

    public List<ActivityResponse> getUserActivities(String userId) {
        List<Activity> activities = activityRepository.findByUserid(userId);
        return activities.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ActivityResponse getActivityById(String activityId) {
        return activityRepository.findById(activityId)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Activity not found with id: " + activityId));
    }

    public void deleteActivity(String activityId) {
        activityRepository.deleteById(activityId);
    }

    public void deleteActivitiesByUserId(String userId) {
        if (userId != null && !userId.isBlank()) {
            activityRepository.deleteByUserid(userId);
        }
    }

    public ActivityStatsResponse getActivityStats(String userId) {
        List<Activity> activities = activityRepository.findByUserid(userId);

        int totalWorkouts = activities.size();
        int totalCalories = activities.stream()
                .mapToInt(a -> a.getCaloriesBurned() != null ? a.getCaloriesBurned() : 0)
                .sum();
        int totalMinutes = activities.stream()
                .mapToInt(a -> a.getDuration() != null ? a.getDuration() : 0)
                .sum();
        double avgCalories = totalWorkouts > 0 ? (double) totalCalories / totalWorkouts : 0.0;

        // Extract distinct workout calendar dates
        java.util.Set<java.time.LocalDate> workoutDates = activities.stream()
                .map(a -> a.getStartTime() != null ? a.getStartTime().toLocalDate() : (a.getCreatedAt() != null ? a.getCreatedAt().toLocalDate() : null))
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toSet());

        int activeDays = workoutDates.size();

        // Calculate current consecutive active day streak
        int currentStreak = 0;
        java.time.LocalDate today = java.time.LocalDate.now();
        if (workoutDates.contains(today)) {
            currentStreak = 1;
            java.time.LocalDate check = today.minusDays(1);
            while (workoutDates.contains(check)) {
                currentStreak++;
                check = check.minusDays(1);
            }
        } else if (workoutDates.contains(today.minusDays(1))) {
            currentStreak = 1;
            java.time.LocalDate check = today.minusDays(2);
            while (workoutDates.contains(check)) {
                currentStreak++;
                check = check.minusDays(1);
            }
        }

        // Calculate all-time longest streak
        int longestStreak = 0;
        List<java.time.LocalDate> sortedDates = workoutDates.stream().sorted().toList();
        int tempStreak = 0;
        java.time.LocalDate prevDate = null;
        for (java.time.LocalDate d : sortedDates) {
            if (prevDate == null || d.minusDays(1).isEqual(prevDate)) {
                tempStreak++;
            } else {
                tempStreak = 1;
            }
            if (tempStreak > longestStreak) {
                longestStreak = tempStreak;
            }
            prevDate = d;
        }

        // 7-day trend
        java.time.format.DateTimeFormatter dayFmt = java.time.format.DateTimeFormatter.ofPattern("EEE");
        java.time.format.DateTimeFormatter dateFmt = java.time.format.DateTimeFormatter.ofPattern("MMM dd");

        List<ActivityStatsResponse.DailyCalorieStat> weeklyTrend = new java.util.ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            java.time.LocalDate targetDate = today.minusDays(i);
            List<Activity> dayActs = activities.stream()
                    .filter(a -> {
                        if (a.getStartTime() != null) {
                            return a.getStartTime().toLocalDate().isEqual(targetDate);
                        } else if (a.getCreatedAt() != null) {
                            return a.getCreatedAt().toLocalDate().isEqual(targetDate);
                        }
                        return false;
                    })
                    .toList();

            int dayCals = dayActs.stream().mapToInt(a -> a.getCaloriesBurned() != null ? a.getCaloriesBurned() : 0).sum();
            int dayMins = dayActs.stream().mapToInt(a -> a.getDuration() != null ? a.getDuration() : 0).sum();

            weeklyTrend.add(ActivityStatsResponse.DailyCalorieStat.builder()
                    .date(targetDate.format(dateFmt))
                    .day(targetDate.format(dayFmt))
                    .calories(dayCals)
                    .minutes(dayMins)
                    .count(dayActs.size())
                    .build());
        }

        // Breakdown by activity type
        java.util.Map<String, List<Activity>> grouped = activities.stream()
                .collect(Collectors.groupingBy(a -> a.getType() != null ? a.getType().name() : "OTHER"));

        List<ActivityStatsResponse.ActivityTypeStat> breakdown = new java.util.ArrayList<>();
        grouped.forEach((type, list) -> {
            int cals = list.stream().mapToInt(a -> a.getCaloriesBurned() != null ? a.getCaloriesBurned() : 0).sum();
            int mins = list.stream().mapToInt(a -> a.getDuration() != null ? a.getDuration() : 0).sum();
            breakdown.add(ActivityStatsResponse.ActivityTypeStat.builder()
                    .type(type)
                    .count(list.size())
                    .calories(cals)
                    .minutes(mins)
                    .build());
        });

        // Calculate completed contest bonus points
        List<Announcement> contests = announcementRepository.findAll();
        int bonusPoints = 0;
        if (contests != null) {
            for (Announcement c : contests) {
                if (c.getTargetGoal() == null || c.getTargetGoal() <= 0) continue;
                String targetSport = c.getTargetActivityType();
                String metric = c.getTargetMetric();
                double goal = c.getTargetGoal();
                int pts = c.getPointsAwarded() != null ? c.getPointsAwarded() : 500;

                List<Activity> matchingActs = activities.stream()
                        .filter(a -> {
                            if (targetSport != null && !targetSport.equalsIgnoreCase("ALL") && a.getType() != null) {
                                if (!a.getType().name().equalsIgnoreCase(targetSport)) return false;
                            }
                            if (c.getStartDate() != null && a.getCreatedAt() != null && a.getCreatedAt().isBefore(c.getStartDate())) {
                                return false;
                            }
                            return true;
                        })
                        .toList();

                double achieved = 0;
                if ("DURATION_MINUTES".equalsIgnoreCase(metric)) {
                    achieved = matchingActs.stream().mapToInt(a -> a.getDuration() != null ? a.getDuration() : 0).sum();
                } else if ("WORKOUT_COUNT".equalsIgnoreCase(metric)) {
                    achieved = matchingActs.size();
                } else { // CALORIES default
                    achieved = matchingActs.stream().mapToInt(a -> a.getCaloriesBurned() != null ? a.getCaloriesBurned() : 0).sum();
                }

                if (achieved >= goal) {
                    bonusPoints += pts;
                }
            }
        }

        int pulseScore = (totalCalories / 10) + (totalMinutes * 2) + (totalWorkouts * 50) + bonusPoints;

        return ActivityStatsResponse.builder()
                .totalWorkouts(totalWorkouts)
                .totalCaloriesBurned(totalCalories)
                .totalActiveMinutes(totalMinutes)
                .averageCaloriesPerWorkout((int) Math.round(avgCalories))
                .currentStreak(currentStreak)
                .longestStreak(longestStreak)
                .activeDays(activeDays)
                .pulseScore(pulseScore)
                .bonusPoints(bonusPoints)
                .weeklyCalorieTrend(weeklyTrend)
                .activityTypeBreakdown(breakdown)
                .build();
    }

    public PlatformActivityStatsResponse getPlatformActivityStats() {
        List<Activity> all = activityRepository.findAll();
        long totalWorkouts = all.size();
        long totalCalories = all.stream()
                .mapToLong(a -> a.getCaloriesBurned() != null ? a.getCaloriesBurned() : 0)
                .sum();
        long totalMinutes = all.stream()
                .mapToLong(a -> a.getDuration() != null ? a.getDuration() : 0)
                .sum();
        double avgCalories = totalWorkouts > 0 ? (double) totalCalories / totalWorkouts : 0.0;

        java.util.Map<String, Long> distribution = all.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getType() != null ? a.getType().name() : "OTHER",
                        Collectors.counting()
                ));

        return PlatformActivityStatsResponse.builder()
                .totalWorkouts(totalWorkouts)
                .totalCaloriesBurned(totalCalories)
                .totalMinutesLogged(totalMinutes)
                .averageCaloriesPerWorkout(Math.round(avgCalories * 10.0) / 10.0)
                .sportDistribution(distribution)
                .build();
    }

    public List<com.fitness.activityService.dto.LeaderboardEntryResponse> getLeaderboard(String period) {
        java.time.LocalDateTime cutoffDate = null;
        if ("weekly".equalsIgnoreCase(period)) {
            cutoffDate = java.time.LocalDateTime.now().minusDays(7);
        } else if ("monthly".equalsIgnoreCase(period)) {
            cutoffDate = java.time.LocalDateTime.now().minusDays(30);
        }

        List<Activity> activities;
        if (cutoffDate != null) {
            activities = activityRepository.findByCreatedAtAfter(cutoffDate);
        } else {
            activities = activityRepository.findAll();
        }

        // Group activities by user ID
        java.util.Map<String, List<Activity>> userActivities = activities.stream()
                .filter(a -> a.getUserid() != null && !a.getUserid().isBlank())
                .collect(Collectors.groupingBy(Activity::getUserid));

        // Fetch user profiles from userService
        List<java.util.Map<String, Object>> allUsers = userValidationService.getAllUsers();
        java.util.Map<String, java.util.Map<String, Object>> userMapByKeycloak = new java.util.HashMap<>();
        java.util.Map<String, java.util.Map<String, Object>> userMapById = new java.util.HashMap<>();

        for (java.util.Map<String, Object> u : allUsers) {
            String keycloakId = (String) u.get("keycloakId");
            String id = (String) u.get("id");
            if (keycloakId != null) userMapByKeycloak.put(keycloakId, u);
            if (id != null) userMapById.put(id, u);
        }

        List<com.fitness.activityService.dto.LeaderboardEntryResponse> entries = new java.util.ArrayList<>();
        List<Announcement> contests = announcementRepository.findAll();

        // Process all users who have activities
        userActivities.forEach((userId, list) -> {
            int totalCals = list.stream().mapToInt(a -> a.getCaloriesBurned() != null ? a.getCaloriesBurned() : 0).sum();
            int totalMins = list.stream().mapToInt(a -> a.getDuration() != null ? a.getDuration() : 0).sum();
            int count = list.size();

            // Calculate bonus PulsePoints awarded from completed contests
            int bonusPoints = 0;
            if (contests != null) {
                for (Announcement c : contests) {
                    if (c.getTargetGoal() == null || c.getTargetGoal() <= 0) continue;
                    String targetSport = c.getTargetActivityType();
                    String metric = c.getTargetMetric();
                    double goal = c.getTargetGoal();
                    int pts = c.getPointsAwarded() != null ? c.getPointsAwarded() : 500;

                    List<Activity> matchingActs = list.stream()
                            .filter(a -> {
                                if (targetSport != null && !targetSport.equalsIgnoreCase("ALL") && a.getType() != null) {
                                    if (!a.getType().name().equalsIgnoreCase(targetSport)) return false;
                                }
                                if (c.getStartDate() != null && a.getCreatedAt() != null && a.getCreatedAt().isBefore(c.getStartDate())) {
                                    return false;
                                }
                                return true;
                            })
                            .toList();

                    double achieved = 0;
                    if ("DURATION_MINUTES".equalsIgnoreCase(metric)) {
                        achieved = matchingActs.stream().mapToInt(a -> a.getDuration() != null ? a.getDuration() : 0).sum();
                    } else if ("WORKOUT_COUNT".equalsIgnoreCase(metric)) {
                        achieved = matchingActs.size();
                    } else { // CALORIES default
                        achieved = matchingActs.stream().mapToInt(a -> a.getCaloriesBurned() != null ? a.getCaloriesBurned() : 0).sum();
                    }

                    if (achieved >= goal) {
                        bonusPoints += pts;
                    }
                }
            }

            // Total PulseScore: (Calories / 10) + (Minutes * 2) + (Workouts * 50) + Bonus Contest Points
            int score = (totalCals / 10) + (totalMins * 2) + (count * 50) + bonusPoints;

            java.util.Map<String, Object> userProfile = userMapByKeycloak.getOrDefault(userId, userMapById.get(userId));
            String name = "Athlete";
            String username = "athlete";

            if (userProfile != null) {
                String role = String.valueOf(userProfile.get("role"));
                String email = (String) userProfile.get("email");
                String uname = (String) userProfile.get("username");
                Boolean deleted = (Boolean) userProfile.get("deleted");
                String status = (String) userProfile.get("status");

                // Strictly exclude Admin and deactivated users from the Leaderboard
                if ("ADMIN".equalsIgnoreCase(role) ||
                    "admin".equalsIgnoreCase(uname) ||
                    (email != null && email.toLowerCase().startsWith("admin@")) ||
                    Boolean.TRUE.equals(deleted) ||
                    "DEACTIVATED".equalsIgnoreCase(status)) {
                    return;
                }

                String firstName = (String) userProfile.get("firstName");
                String lastName = (String) userProfile.get("lastName");

                if (firstName != null && !firstName.isBlank()) {
                    name = firstName + (lastName != null ? " " + lastName : "");
                } else if (uname != null && !uname.isBlank()) {
                    name = uname;
                } else if (email != null && !email.isBlank()) {
                    name = email.split("@")[0];
                }

                String profilePictureUrl = (String) userProfile.get("profilePictureUrl");

                if (uname != null && !uname.isBlank()) {
                    username = uname;
                } else if (email != null && !email.isBlank()) {
                    username = email.split("@")[0];
                }

                entries.add(com.fitness.activityService.dto.LeaderboardEntryResponse.builder()
                        .userId(userId)
                        .name(name)
                        .username(username)
                        .profilePictureUrl(profilePictureUrl)
                        .totalCalories(totalCals)
                        .totalMinutes(totalMins)
                        .totalWorkouts(count)
                        .pulseScore(score)
                        .build());
            }
        });

        // Sort descending by PulseScore
        entries.sort((a, b) -> Integer.compare(b.getPulseScore(), a.getPulseScore()));

        // Assign ranks and badges
        for (int i = 0; i < entries.size(); i++) {
            com.fitness.activityService.dto.LeaderboardEntryResponse entry = entries.get(i);
            int rank = i + 1;
            entry.setRank(rank);

            if (rank == 1) {
                entry.setTier("GOLD");
            } else if (rank == 2) {
                entry.setTier("SILVER");
            } else if (rank == 3) {
                entry.setTier("BRONZE");
            } else if (rank <= 10) {
                entry.setTier("ELITE");
            } else {
                entry.setTier("CHALLENGER");
            }
        }

        return entries;
    }
}
