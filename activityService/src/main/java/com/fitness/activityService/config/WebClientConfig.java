package com.fitness.activityService.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Value("${USER_SERVICE_URL:lb://USER-SERVICE}")
    private String userServiceUrl;

    @Bean
    @LoadBalanced
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder();
    }

    @Bean
    public WebClient userServiceWebClient(WebClient.Builder webClientBuilder) {
        if (userServiceUrl != null && !userServiceUrl.isBlank() && !userServiceUrl.startsWith("lb://")) {
            return WebClient.builder()
                    .baseUrl(userServiceUrl)
                    .build();
        }
        return webClientBuilder
                .baseUrl("http://USER-SERVICE")
                .build();
    }
}
