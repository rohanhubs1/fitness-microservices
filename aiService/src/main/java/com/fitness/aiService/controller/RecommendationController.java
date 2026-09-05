package com.fitness.aiService.controller;

import com.fitness.aiService.dto.ChatRequest;
import com.fitness.aiService.dto.ChatResponse;
import com.fitness.aiService.model.Recommendation;
import com.fitness.aiService.service.AIChatService;
import com.fitness.aiService.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final AIChatService aiChatService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Recommendation>> getUserRecommendation(@PathVariable String userId){
        return ResponseEntity.ok(recommendationService.getUserRecommendation(userId));
    }

    @GetMapping("/activity/{activityId}")
    public ResponseEntity<Recommendation> getActivityRecommendation(@PathVariable String activityId){
        return recommendationService.getActivityRecommendation(activityId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chatWithAI(@RequestBody ChatRequest request) {
        return ResponseEntity.ok(aiChatService.processChat(request));
    }
}
