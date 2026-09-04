package com.fitness.aiService.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class GrokService {

    @Value("${grok.api.url:${gemini.api.url:https://api.groq.com/openai/v1/chat/completions}}")
    private String apiUrl;

    @Value("${grok.api.key:${gemini.api.key:}}")
    private String apiKey;

    @Value("${grok.api.model:llama-3.3-70b-versatile}")
    private String modelName;

    private final WebClient webClient;

    public GrokService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public String getAnswer(String question) {
        log.info("Calling Grok/AI API at URL: {}, Model: {}", apiUrl, modelName);
        try {
            Map<String, Object> requestBody = Map.of(
                    "model", modelName,
                    "messages", List.of(
                            Map.of(
                                    "role", "user",
                                    "content", question
                            )
                    )
            );

            return webClient.post()
                    .uri(apiUrl)
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (Exception e) {
            log.warn("External AI API call failed: {}. Falling back to rule-based recommendation.", e.getMessage());
            return null;
        }
    }
}