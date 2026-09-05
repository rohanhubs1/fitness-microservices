package com.fitness.activityService.repository;

import com.fitness.activityService.model.Activity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActivityRepository extends MongoRepository<Activity,String> {
    List<Activity> findByUserid(String userId);
    List<Activity> findByCreatedAtAfter(LocalDateTime date);
    void deleteByUserid(String userId);
}
