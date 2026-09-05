package com.fitness.aiService.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class GrokService {

    @Value("${grok.api.url:${gemini.api.url:https://api.groq.com/openai/v1/chat/completions}}")
    private String apiUrl;

    @Value("${grok.api.key:${gemini.api.key:}}")
    private String apiKey;

    @Value("${grok.api.model:openai/gpt-oss-20b}")
    private String configuredModel;

    private static final List<String> BACKUP_MODELS = List.of(
            "openai/gpt-oss-20b",
            "openai/gpt-oss-120b",
            "qwen/qwen3.6-27b",
            "groq/compound-mini"
    );

    private final WebClient webClient;

    public GrokService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    private List<String> getModelCandidateList() {
        List<String> candidates = new ArrayList<>();
        if (configuredModel != null && !configuredModel.isBlank()) {
            candidates.add(configuredModel.trim());
        }
        for (String backup : BACKUP_MODELS) {
            if (!candidates.contains(backup)) {
                candidates.add(backup);
            }
        }
        return candidates;
    }

    public String getAnswer(String question) {
        List<String> models = getModelCandidateList();
        for (String model : models) {
            try {
                log.info("Calling Grok/AI API at URL: {}, Model: {}", apiUrl, model);
                Map<String, Object> requestBody = Map.of(
                        "model", model,
                        "messages", List.of(
                                Map.of(
                                        "role", "user",
                                        "content", question
                                )
                        )
                );

                String response = webClient.post()
                        .uri(apiUrl)
                        .header("Authorization", "Bearer " + apiKey)
                        .header("Content-Type", "application/json")
                        .bodyValue(requestBody)
                        .retrieve()
                        .bodyToMono(String.class)
                        .block();

                if (response != null && !response.isBlank()) {
                    return response;
                }
            } catch (Exception e) {
                log.warn("Groq API call with model '{}' failed: {}. Trying next candidate.", model, e.getMessage());
            }
        }
        log.warn("All Grok models exhausted. Falling back to rule-based engine.");
        return null;
    }

    public String getChatAnswer(String systemPrompt, String userMessage) {
        List<String> models = getModelCandidateList();
        for (String model : models) {
            try {
                log.info("Calling Grok/AI API for chat at URL: {}, Model: {}", apiUrl, model);
                Map<String, Object> requestBody = Map.of(
                        "model", model,
                        "max_tokens", 350,
                        "temperature", 0.7,
                        "messages", List.of(
                                Map.of("role", "system", "content", systemPrompt),
                                Map.of("role", "user", "content", userMessage)
                        )
                );

                String response = webClient.post()
                        .uri(apiUrl)
                        .header("Authorization", "Bearer " + apiKey)
                        .header("Content-Type", "application/json")
                        .bodyValue(requestBody)
                        .retrieve()
                        .bodyToMono(String.class)
                        .block();

                if (response != null && !response.isBlank()) {
                    return response;
                }
            } catch (Exception e) {
                log.warn("Groq API chat call with model '{}' failed: {}. Trying next candidate.", model, e.getMessage());
            }
        }
        log.warn("All Grok models exhausted for chat. Using Sports Science Fallback Engine.");
        return null;
    }
}