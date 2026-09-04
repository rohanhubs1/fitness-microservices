package com.fitness.aiService.service;

import com.fitness.aiService.model.Activity;
import com.fitness.aiService.model.Recommendation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class ActivityAIService {

    private final GrokService grokService;

    public Recommendation generateRecommendation(Activity activity){
        try {
            String prompt = createPromptForActivity(activity);
            String aiResponse = grokService.getAnswer(prompt);
            if (aiResponse == null || aiResponse.isBlank()) {
                return createDefaultRecommendation(activity);
            }
            log.info("RESPONSE FROM AI: {} ", aiResponse);
            return processAiResponse(activity, aiResponse);
        } catch (Exception e) {
            log.warn("Error generating recommendation from AI: {}. Using default.", e.getMessage());
            return createDefaultRecommendation(activity);
        }
    }

    private Recommendation processAiResponse(Activity activity, String aiResponse){
        try{
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(aiResponse);

            JsonNode textNode = rootNode.path("choices")
                    .get(0)
                    .path("message")
                    .path("content");
            String jsonContent = textNode.asText()
                    .replaceAll("```json\\n", "")
                    .replaceAll("\\n```", "")
                    .trim();
//            log.info("PARSED RESPONSE FROM AI: {}", jsonContent);
            JsonNode analysisJson = mapper.readTree(jsonContent);
            JsonNode analysisNode = analysisJson.path("analysis");
            StringBuilder fullAnalysis = new StringBuilder();
            addAnalysisSection(fullAnalysis, analysisNode, "overall", "Overall:");
            addAnalysisSection(fullAnalysis, analysisNode, "pace", "Pace:");
            addAnalysisSection(fullAnalysis, analysisNode, "heartRate", "Heart Rate:");
            addAnalysisSection(fullAnalysis, analysisNode, "caloriesBurned", "Calories:");

            List<String> improvements = extarctImprovements(analysisJson.path("improvements"));

            List<String> suggestions = extarctSuggestions(analysisJson.path("suggestions"));

            List<String> safety = extarctSafetyGuidelines(analysisJson.path("safety"));

            return Recommendation.builder()
                    .activityId(activity.getId())
                    .userId(activity.getUserid())
                    .activityType(activity.getType())
                    .recommendation(fullAnalysis.toString().trim())
                    .improvements(improvements)
                    .suggestions(suggestions)
                    .safety(safety)
                    .createdAt(LocalDateTime.now())
                    .build();



        }catch (Exception e){
            e.printStackTrace();
            return createDefaultRecommendation(activity);
        }
    }

    private Recommendation createDefaultRecommendation(Activity activity) {
        int duration = activity.getDuration() != null && activity.getDuration() > 0 ? activity.getDuration() : 30;
        int calories = activity.getCaloriesBurned() != null && activity.getCaloriesBurned() > 0 ? activity.getCaloriesBurned() : 200;
        double burnRate = (double) calories / duration;
        String type = activity.getType() != null ? activity.getType() : "WORKOUT";

        String intensity = burnRate > 10.0 ? "High Intensity" : (burnRate > 6.0 ? "Moderate Intensity" : "Low Intensity / Endurance");

        String overallAnalysis = String.format(
                "Overall Performance: Excellent %s session! Completed %d minutes of %s burning approximately %d calories at an average rate of %.1f kcal/min (%s).",
                type.toLowerCase(), duration, type.toLowerCase(), calories, burnRate, intensity
        );

        String paceAnalysis = String.format(
                "Pace & Output: Consistent aerobic output maintained throughout the %d-minute duration with steady metabolic demand.",
                duration
        );

        String hrAnalysis = String.format(
                "Heart Rate Zone: Estimated in Zone %s (%s) based on your %.1f kcal/min burn profile.",
                burnRate > 9.0 ? "4 (Threshold)" : (burnRate > 6.0 ? "3 (Aerobic)" : "2 (Fat Burning)"),
                burnRate > 9.0 ? "80-90% Max HR" : (burnRate > 6.0 ? "70-80% Max HR" : "60-70% Max HR"),
                burnRate
        );

        String caloriesAnalysis = String.format(
                "Energy Expenditure: %d kcal burned. Recommended post-workout hydration: ~%d ml of electrolyte-rich fluid.",
                calories, Math.max(300, duration * 15)
        );

        String fullAnalysis = overallAnalysis + "\n\n" + paceAnalysis + "\n\n" + hrAnalysis + "\n\n" + caloriesAnalysis;

        List<String> improvements = new ArrayList<>();
        List<String> suggestions = new ArrayList<>();
        List<String> safety = new ArrayList<>();

        if ("RUNNING".equalsIgnoreCase(type)) {
            improvements.add("Cadence: Aim for a target stride frequency of 165-175 steps per minute for optimal joint efficiency.");
            improvements.add("Intervals: Incorporate 30-second speed surges every 5 minutes to boost VO2 max.");
            suggestions.add("Next Workout: 25-minute recovery jog or 40-minute zone 2 base endurance run tomorrow.");
            suggestions.add("Cross-Training: 15 minutes of core stability and hip flexor mobility work.");
            safety.add("Perform dynamic hamstring and calf stretches prior to starting.");
            safety.add("Ensure proper running shoe cushioning and stay hydrated with electrolytes.");
        } else if ("CYCLING".equalsIgnoreCase(type)) {
            improvements.add("Cadence: Maintain a smooth pedaling cadence of 80-90 RPM to reduce knee strain.");
            improvements.add("Posture: Keep relaxed shoulders and slightly bent elbows to absorb road vibrations.");
            suggestions.add("Next Workout: High-cadence spin session with 3x3 min hill climb intervals.");
            suggestions.add("Strength: Add lower body quad and glute resistance exercises.");
            safety.add("Ensure correct saddle height to protect your knees and lower back.");
            safety.add("Drink water consistently every 15-20 minutes during prolonged rides.");
        } else {
            improvements.add("Pacing: Maintain a brisk, purposeful stride to maximize cardiovascular engagement.");
            improvements.add("Posture: Keep an upright posture with active arm swing to increase upper body calorie burn.");
            suggestions.add("Next Workout: 45-minute incline power walk or light interval jog.");
            suggestions.add("Flexibility: 10 minutes of full-body yoga and ankle mobility.");
            safety.add("Wear comfortable supportive walking footwear.");
            safety.add("Stay mindful of terrain and stay hydrated throughout the workout.");
        }

        return Recommendation.builder()
                .activityId(activity.getId())
                .userId(activity.getUserid())
                .activityType(activity.getType())
                .recommendation(fullAnalysis)
                .improvements(improvements)
                .suggestions(suggestions)
                .safety(safety)
                .createdAt(LocalDateTime.now())
                .build();
    }

    private List<String> extarctSafetyGuidelines(JsonNode safetyNode) {
        List<String> safety = new ArrayList<>();
        if(safetyNode.isArray()){
            safetyNode.forEach(item -> safety.add(item.asText()));
        }
        return safety.isEmpty()?
                Collections.singletonList("Follow general safety guidelines") :
                safety;
    }

    private List<String> extarctSuggestions(JsonNode suggestionsNode) {
        List<String> suggestions = new ArrayList<>();
        if(suggestionsNode.isArray()){
            suggestionsNode.forEach(suggestion -> {
                String workout = suggestion.path("workout").asText();
                String description = suggestion.path("description").asText();
                suggestions.add(String.format("%s: %s", workout, description));
            });
        }
        return suggestions.isEmpty()?
                Collections.singletonList("No Specific suggestions provided") :
                suggestions;
    }

    private List<String> extarctImprovements(JsonNode improvementsNode) {
        List<String> improvements = new ArrayList<>();
        if(improvementsNode.isArray()){
            improvementsNode.forEach(improvement -> {
                String area = improvement.path("area").asText();
                String detail = improvement.path("recommendation").asText();
                improvements.add(String.format("%s: %s", area, detail));
            });
        }
        return improvements.isEmpty()?
                Collections.singletonList("No Specific improvements provided") :
                improvements;
    }

    private void addAnalysisSection(StringBuilder fullAnalysis, JsonNode analysisNode, String key, String prefix) {
        if(!analysisNode.path(key).isMissingNode()){
            fullAnalysis.append(prefix)
                    .append(analysisNode.path(key).asText())
                    .append("\n\n");
        }
    }

    private String createPromptForActivity(Activity activity) {
        return String.format("""
        Analyze this fitness activity and provide detailed recommendations.

        Activity Type: %s
        Duration: %d minutes
        Calories Burned: %d
        Additional Metrics: %s

        Focus on:
        - Overall performance
        - Pace
        - Heart rate
        - Calories
        - Improvements
        - Next workout suggestions
        - Safety guidelines

        Return the response in EXACTLY this JSON format:

        {
          "analysis": {
            "overall": "Overall analysis here",
            "pace": "Pace analysis here",
            "heartRate": "Heart rate analysis here",
            "caloriesBurned": "Calories analysis here"
          },
          "improvements": [
            {
              "area": "Area name",
              "recommendation": "Detailed recommendation"
            }
          ],
          "suggestions": [
            {
              "workout": "Workout name",
              "description": "Detailed workout description"
            }
          ],
          "safety": [
            "Safety point 1",
            "Safety point 2"
          ]
        }
        """,
                activity.getType(),
                activity.getDuration(),
                activity.getCaloriesBurned(),
                activity.getAdditonalMetrics()
        );
    }
}
