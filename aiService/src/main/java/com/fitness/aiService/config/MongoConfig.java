package com.fitness.aiService.config;

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

    // Credentials must come from the environment (MONGO_URI_AI / MONGO_URI), never from source code.
    private static final String DEFAULT_LOCAL_URI = "mongodb://localhost:27017/fitnessrecommendation";

    @Value("${spring.data.mongodb.uri:${MONGO_URI_AI:${MONGO_URI:${SPRING_MONGODB_URI:}}}}")
    private String mongoUri;

    private String getEffectiveUri() {
        if (mongoUri != null && !mongoUri.isBlank()) {
            return mongoUri;
        }
        return DEFAULT_LOCAL_URI;
    }

    @Bean
    @Primary
    public MongoClient mongoClient() {
        return MongoClients.create(getEffectiveUri());
    }

    @Bean
    @Primary
    public MongoTemplate mongoTemplate(MongoClient mongoClient) {
        String uri = getEffectiveUri();
        String databaseName = "fitnessrecommendation";
        try {
            ConnectionString cs = new ConnectionString(uri);
            if (cs.getDatabase() != null && !cs.getDatabase().isBlank()) {
                databaseName = cs.getDatabase();
            }
        } catch (Exception ignored) {}
        return new MongoTemplate(mongoClient, databaseName);
    }
}
