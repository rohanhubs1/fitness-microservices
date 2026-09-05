package com.fitness.activityService.controller;

import com.fitness.activityService.model.Announcement;
import com.fitness.activityService.repository.AnnouncementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementRepository announcementRepository;

    @GetMapping("/active")
    public ResponseEntity<Announcement> getActiveAnnouncement() {
        Optional<Announcement> active = announcementRepository.findFirstByActiveTrueOrderByCreatedAtDesc();
        return active.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.noContent().build());
    }

    @GetMapping("/active-all")
    public ResponseEntity<List<Announcement>> getAllActiveAnnouncements() {
        return ResponseEntity.ok(announcementRepository.findByActiveTrueOrderByCreatedAtDesc());
    }

    @GetMapping("/all")
    public ResponseEntity<List<Announcement>> getAllAnnouncements() {
        return ResponseEntity.ok(announcementRepository.findAllByOrderByCreatedAtDesc());
    }

    @PostMapping
    public ResponseEntity<Announcement> createAnnouncement(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-User-ID", required = false) String userId) {
        String message = body.get("message") != null ? String.valueOf(body.get("message")) : null;
        String title = body.get("title") != null ? String.valueOf(body.get("title")) : "";
        String type = body.get("type") != null ? String.valueOf(body.get("type")) : "CHALLENGE";
        String prize = body.get("prize") != null ? String.valueOf(body.get("prize")) : "";
        String targetActivityType = body.get("targetActivityType") != null ? String.valueOf(body.get("targetActivityType")) : "ALL";
        String targetMetric = body.get("targetMetric") != null ? String.valueOf(body.get("targetMetric")) : "CALORIES";

        Double targetGoal = null;
        if (body.get("targetGoal") != null) {
            try {
                targetGoal = Double.parseDouble(String.valueOf(body.get("targetGoal")));
            } catch (Exception ignored) {}
        }

        Integer pointsAwarded = null;
        if (body.get("pointsAwarded") != null) {
            try {
                pointsAwarded = Integer.parseInt(String.valueOf(body.get("pointsAwarded")));
            } catch (Exception ignored) {}
        }

        Integer durationDays = null;
        if (body.get("durationDays") != null) {
            try {
                durationDays = Integer.parseInt(String.valueOf(body.get("durationDays")));
            } catch (Exception ignored) {}
        }

        if (message == null || message.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime end = durationDays != null && durationDays > 0 ? now.plusDays(durationDays) : now.plusDays(7);

        Announcement newAnnouncement = Announcement.builder()
                .title(title != null && !title.isBlank() ? title.trim() : null)
                .message(message.trim())
                .type(type)
                .prize(prize != null && !prize.isBlank() ? prize.trim() : null)
                .targetActivityType(targetActivityType)
                .targetMetric(targetMetric)
                .targetGoal(targetGoal != null ? targetGoal : 1000.0)
                .pointsAwarded(pointsAwarded != null ? pointsAwarded : 500)
                .durationDays(durationDays != null ? durationDays : 7)
                .startDate(now)
                .endDate(end)
                .active(true)
                .createdBy(userId != null ? userId : "admin")
                .createdAt(now)
                .build();

        Announcement saved = announcementRepository.save(newAnnouncement);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<Announcement> toggleAnnouncementActive(@PathVariable String id) {
        return announcementRepository.findById(id).map(a -> {
            a.setActive(!a.isActive());
            return ResponseEntity.ok(announcementRepository.save(a));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAnnouncement(@PathVariable String id) {
        announcementRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/active")
    public ResponseEntity<Void> clearActiveAnnouncement() {
        List<Announcement> oldActive = announcementRepository.findByActiveTrueOrderByCreatedAtDesc();
        for (Announcement a : oldActive) {
            a.setActive(false);
            announcementRepository.save(a);
        }
        return ResponseEntity.noContent().build();
    }
}
