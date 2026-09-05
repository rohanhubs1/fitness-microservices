package com.fitness.activityService.config;

import com.mongodb.ConnectionString;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.core.MongoTemplate;

@Configuration
@EnableMongoAuditing
public class MongoConfig {

    @Value("${spring.data.mongodb.uri:${MONGO_URI_ACTIVITY:${MONGO_URI:${SPRING_MONGODB_URI:mongodb://localhost:27017/fitness}}}}")
    private String mongoUri;

    @Bean
    @Primary
    public MongoClient mongoClient() {
        return MongoClients.create(mongoUri);
    }

    @Bean
    @Primary
    public MongoTemplate mongoTemplate(MongoClient mongoClient) {
        String databaseName = "fitness";
        try {
            ConnectionString cs = new ConnectionString(mongoUri);
            if (cs.getDatabase() != null && !cs.getDatabase().isBlank()) {
                databaseName = cs.getDatabase();
            }
        } catch (Exception ignored) {}
        return new MongoTemplate(mongoClient, databaseName);
    }
}
