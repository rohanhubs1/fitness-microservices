package com.fitness.activityService.config;

import com.mongodb.ConnectionString;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.core.MongoTemplate;

@Configuration
@EnableMongoAuditing
@Slf4j
public class MongoConfig {

    private static final String DEFAULT_ATLAS_URI =
            "mongodb+srv://agarwalrohan2222_db_user:nahor281515139@fitnesscluster.10pwkgi.mongodb.net/fitness?appName=FitnessCluster";

    @Value("${spring.data.mongodb.uri:${MONGO_URI_ACTIVITY:${MONGO_URI:${SPRING_MONGODB_URI:}}}}")
    private String mongoUri;

    private String getEffectiveUri() {
        if (mongoUri != null && !mongoUri.isBlank() && !mongoUri.contains("localhost")) {
            return mongoUri;
        }
        return DEFAULT_ATLAS_URI;
    }

    @Bean
    @Primary
    public MongoClient mongoClient() {
        String uri = getEffectiveUri();
        log.info("Connecting activityService MongoDB to: {}", uri.replaceAll(":[^@]+@", ":****@"));
        return MongoClients.create(uri);
    }

    @Bean
    @Primary
    public MongoTemplate mongoTemplate(MongoClient mongoClient) {
        String uri = getEffectiveUri();
        String databaseName = "fitness";
        try {
            ConnectionString cs = new ConnectionString(uri);
            if (cs.getDatabase() != null && !cs.getDatabase().isBlank()) {
                databaseName = cs.getDatabase();
            }
        } catch (Exception ignored) {}
        return new MongoTemplate(mongoClient, databaseName);
    }
}
