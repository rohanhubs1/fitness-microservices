package com.fitness.aiService.service;

import com.fitness.aiService.dto.ChatRequest;
import com.fitness.aiService.dto.ChatResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
@RequiredArgsConstructor
public class AIChatService {

    private final GrokService grokService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Fast in-memory cache to save API credits on repeated queries
    private final Map<String, String> responseCache = new ConcurrentHashMap<>();

    public ChatResponse processChat(ChatRequest request) {
        long startTime = System.currentTimeMillis();
        String message = request.getMessage() != null ? request.getMessage().trim() : "";
        if (message.isBlank()) {
            return ChatResponse.builder()
                    .reply("Please provide a fitness or nutrition question to get started.")
                    .cached(false)
                    .source("system")
                    .responseTimeMs(0)
                    .build();
        }

        double weight = request.getUserWeight() != null ? request.getUserWeight() : 75.0;
        double height = request.getUserHeight() != null ? request.getUserHeight() : 175.0;
        int age = request.getAge() != null ? request.getAge() : 25;
        String goal = request.getFitnessGoal() != null ? request.getFitnessGoal() : "MAINTENANCE";

        String cacheKey = String.format("%s:%s", goal, message.toLowerCase());
        if (responseCache.containsKey(cacheKey)) {
            log.info("Serving chat response from in-memory cache (0 tokens consumed): {}", message);
            return ChatResponse.builder()
                    .reply(responseCache.get(cacheKey))
                    .cached(true)
                    .source("in-memory-cache")
                    .responseTimeMs(System.currentTimeMillis() - startTime)
                    .build();
        }

        // Compressed, high-efficiency system prompt
        String systemPrompt = String.format(
                "You are an elite, world-class Sports Scientist & Master AI Fitness Coach. " +
                "Athlete Context: Weight: %.1fkg, Height: %.1fcm, Age: %d, Goal: %s. " +
                "Instructions: Answer concisely in under 120 words using structured bullet points. " +
                "Provide precise, science-backed guidance with zero filler.",
                weight, height, age, goal
        );

        String rawAiJson = grokService.getChatAnswer(systemPrompt, message);
        String finalReply = null;
        String source = "grok-ai";

        if (rawAiJson != null && !rawAiJson.isBlank()) {
            try {
                JsonNode root = objectMapper.readTree(rawAiJson);
                JsonNode contentNode = root.path("choices").path(0).path("message").path("content");
                if (!contentNode.isMissingNode() && !contentNode.asText().isBlank()) {
                    finalReply = contentNode.asText().trim();
                }
            } catch (Exception e) {
                log.warn("Failed to parse AI chat JSON: {}", e.getMessage());
            }
        }

        // Smart Zero-Cost Fallback Engine if AI is unavailable or rate limited
        if (finalReply == null || finalReply.isBlank()) {
            source = "sports-science-engine";
            finalReply = generateSmartFallback(message, weight, goal);
        }

        // Store in cache for future instant zero-credit retrieval
        responseCache.put(cacheKey, finalReply);

        long duration = System.currentTimeMillis() - startTime;
        return ChatResponse.builder()
                .reply(finalReply)
                .cached(false)
                .source(source)
                .responseTimeMs(duration)
                .build();
    }

    private String generateSmartFallback(String message, double weight, String goal) {
        String q = message.toLowerCase();
        int proteinGrams = (int) Math.round(weight * 2.0);

        if (q.contains("split") || q.contains("routine") || q.contains("workout") || q.contains("push")) {
            return String.format(
                    "💪 **Optimized Push-Pull-Legs Hypertrophy Split (%s Goal)**:\n\n" +
                    "• **Day 1 (Push):** Incline Dumbbell Press (4x8-10), Overhead Press (3x10), Cable Lateral Raises (4x15), Tricep Dips (3x12).\n" +
                    "• **Day 2 (Pull):** Weighted Pull-ups (4x6-8), Chest-Supported Rows (3x10), Face Pulls (4x15), Incline Bicep Curls (3x12).\n" +
                    "• **Day 3 (Legs & Core):** Barbell Squats (4x8), Romanian Deadlifts (3x10), Walking Lunges (3x12/leg), Hanging Leg Raises (3x15).\n" +
                    "• **Day 4:** Active Recovery / 30m Zone 2 Cardio.\n" +
                    "• **Day 5:** Upper Body Power (Bench Press 4x6, Barbell Rows 4x8).",
                    goal.replace("_", " ")
            );
        } else if (q.contains("protein") || q.contains("diet") || q.contains("nutrition") || q.contains("eat") || q.contains("calorie")) {
            return String.format(
                    "🥗 **Daily Nutrition & Protein Blueprint**:\n\n" +
                    "• **Daily Protein Target:** **%dg daily** (1.8 - 2.2g per kg body weight) to maximize muscle protein synthesis.\n" +
                    "• **Meal Distribution:** 4 meals of 35-45g protein spaced 3.5 hours apart.\n" +
                    "• **Hydration:** Minimum 3.5 Liters of water daily for optimal cellular volumization and recovery.\n" +
                    "• **Goal Adjustment (%s):** %s",
                    proteinGrams,
                    goal.replace("_", " "),
                    goal.contains("LOSS") ? "Maintain a 300-500 kcal deficit while keeping protein high to preserve muscle." : "Aim for a slight 200-300 kcal surplus to fuel progressive overload."
            );
        } else if (q.contains("fat") || q.contains("cardio") || q.contains("running") || q.contains("heart") || q.contains("zone")) {
            return "🏃 **Zone 2 Fat Oxidation Strategy**:\n\n" +
                    "• **Target Heart Rate:** 60% – 70% Max HR (approx. 125–140 BPM).\n" +
                    "• **Why:** Maximizes mitochondrial density and lipid metabolism without elevating cortisol or interfering with strength gains.\n" +
                    "• **Protocol:** 3x weekly sessions of 35-45 minutes (incline treadmill walk, cycling, or swimming).";
        } else if (q.contains("sore") || q.contains("recovery") || q.contains("sleep") || q.contains("doms") || q.contains("rest")) {
            return "🩹 **Fast-Track Muscular Recovery Protocol**:\n\n" +
                    "• **Deep Sleep:** 7.5 to 8.5 hours (over 90% of Growth Hormone pulse occurs during Stage 3 deep sleep).\n" +
                    "• **Post-Workout Nutrition:** 30g fast-acting protein + 40g complex carbs within 90 mins post-session.\n" +
                    "• **Active Flushes:** 15 mins light walking or cycling to clear muscular lactic metabolic byproducts.";
        } else {
            return String.format(
                    "🎯 **AI Sports Scientist Guidance**:\n\n" +
                    "• **Progressive Overload:** Increase load or rep quality each week.\n" +
                    "• **Target Consistency:** Log at least 4 structured sessions weekly for %s.\n" +
                    "• **Biometrics:** Calibrated for your %.1fkg body weight.",
                    goal.replace("_", " "), weight
            );
        }
    }
}