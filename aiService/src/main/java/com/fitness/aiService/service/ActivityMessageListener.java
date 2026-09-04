package com.fitness.aiService.service;

import com.fitness.aiService.model.Activity;
import com.fitness.aiService.model.Recommendation;
import com.fitness.aiService.repository.RecommendationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ActivityMessageListener {

    private final ActivityAIService aiService;
    private final RecommendationRepository recommendationRepository;

    @RabbitListener(queues = "${rabbitmq.queue.name:activity.queue}")
    public void processActivity(Activity activity) {
        log.info("Received activity for AI processing: id={}, userId={}, type={}",
                activity.getId(), activity.getUserid(), activity.getType());
        try {
            Recommendation recommendation = aiService.generateRecommendation(activity);
            recommendationRepository.save(recommendation);
            log.info("Successfully generated and saved AI recommendation for activity id: {}", activity.getId());
        } catch (Exception ex) {
            log.error("Error processing activity id {}: {}. Triggering retry / DLQ fallback.",
                    activity.getId(), ex.getMessage(), ex);
            throw ex; // rethrow so Spring AMQP retry policy and DLQ routing kick in
        }
    }

    @RabbitListener(queues = "${rabbitmq.dlx.queue.name:activity.queue.dlq}")
    public void processDeadLetter(Activity activity) {
        log.error("ALERT [DLQ]: Message failed all processing retries and was moved to Dead Letter Queue: activityId={}, userId={}",
                activity.getId(), activity.getUserid());
        // In a production system, this could also alert Sentry/PagerDuty or save to an audit collection
    }
}
