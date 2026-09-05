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
        } else if ("SWIMMING".equalsIgnoreCase(type)) {
            improvements.add("Stroke Efficiency: Focus on a high-elbow catch and bilateral breathing to reduce drag.");
            improvements.add("Kick Rhythm: Maintain a steady 2-beat kick for distance conservation or 6-beat kick for speed.");
            suggestions.add("Next Workout: 5x100m interval drills with 20 seconds rest between sets.");
            suggestions.add("Dryland Training: Shoulder rotator cuff band exercises and lat pull downs.");
            safety.add("Warm up shoulder joints dynamically before entering the pool.");
            safety.add("Rehydrate post-swim—fluid loss is often masked in the water.");
        } else if ("WEIGHT_TRAINING".equalsIgnoreCase(type)) {
            improvements.add("Progressive Overload: Focus on controlled 3-second eccentric tempo on compound movements.");
            improvements.add("Rest Periods: Maintain 90-120 seconds rest between heavy sets for full ATP replenishment.");
            suggestions.add("Next Workout: Target complementary antagonist muscle groups (e.g. Back & Biceps after Chest & Triceps).");
            suggestions.add("Mobility: 10 minutes of thoracic spine and hip mobility drills.");
            safety.add("Always use proper bracing and a full range of motion before increasing weight.");
            safety.add("Consume 20-30g of high-quality protein within 1-2 hours post-session.");
        } else if ("HIIT".equalsIgnoreCase(type)) {
            improvements.add("Explosiveness: Maximize power output during the work intervals; do not pace yourself during sprints.");
            improvements.add("Active Recovery: Keep moving with light stepping during the rest intervals to clear lactic acid.");
            suggestions.add("Next Workout: Low-impact aerobic recovery session or 30-minute steady-state walking.");
            suggestions.add("Core Stability: Plank progressions and hollow body holds.");
            safety.add("Prioritize form over speed when fatigue sets in to prevent injury.");
            safety.add("Take at least 48 hours before another maximum-intensity HIIT session.");
        } else if ("YOGA".equalsIgnoreCase(type)) {
            improvements.add("Breath Sync: Deepen your Ujjayi breath to match movements and lengthen each inhalation/exhalation.");
            improvements.add("Alignment: Focus on engaging your core and grounding through all four corners of your feet.");
            suggestions.add("Next Workout: 30-minute Vinyasa flow focusing on hip openers and spinal twists.");
            suggestions.add("Meditation: 5-10 minutes of mindful breathing in Savasana.");
            safety.add("Never force a posture or hyperextend joints; use blocks or straps when needed.");
            safety.add("Listen to your body and modify poses to honor your current range of motion.");
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
        You are an elite, world-class Sports Scientist and Master AI Fitness Coach.
        Analyze this workout session with deep biomechanical, physiological, and training precision.

        Activity Type: %s
        Duration: %d minutes
        Calories Burned: %d
        Dynamic Workout Metrics: %s

        Specialized Domain Instructions:
        - If WEIGHT_TRAINING: Analyze muscle group targeted, volume load (sets x reps), peak working weight, progressive overload cues, hypertrophy stimulation, rest intervals, and protein synthesis recovery.
        - If SWIMMING: Analyze stroke technique, lap cadence, aerobic threshold, drag reduction, and shoulder joint preservation.
        - If RUNNING or CYCLING: Analyze cardiovascular pace, distance efficiency, incline resistance / speed, cadence, and tendon recovery.
        - If HIIT: Analyze EPOC (Excess Post-Exercise Oxygen Consumption) afterburn effect, explosive interval power, and autonomic nervous system balance.
        - If YOGA: Analyze mobility gains, core engagement, breath synchronization, and parasympathetic recovery.

        Provide actionable, motivating, and science-backed feedback.
        Return the response in EXACTLY this JSON format:

        {
          "analysis": {
            "overall": "High-impact scientific overview of the session",
            "pace": "Pacing / Intensity / Effort analysis",
            "heartRate": "Estimated heart rate zone and energy system targeted",
            "caloriesBurned": "Metabolic expenditure and energy deficit insight"
          },
          "improvements": [
            {
              "area": "Technique / Intensity / Volume",
              "recommendation": "Precise, actionable cue to optimize performance"
            }
          ],
          "suggestions": [
            {
              "workout": "Recommended Next Workout",
              "description": "Specific session to balance recovery and progress"
            }
          ],
          "safety": [
            "Critical safety, form, or joint protection cue",
            "Hydration and recovery guideline"
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
