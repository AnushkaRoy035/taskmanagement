package com.tasknest.controller;

import org.springframework.web.bind.annotation.*;
import com.tasknest.entity.MoodTrack;
import com.tasknest.service.MoodTrackService;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/mood")
@CrossOrigin(origins = "http://localhost:3000") // Frontend URL
public class MoodTrackController {

    private final MoodTrackService moodTrackService;

    public MoodTrackController(MoodTrackService moodTrackService) {
        this.moodTrackService = moodTrackService;
    }

    @PostMapping
    public ResponseEntity<MoodTrack> saveMood(@RequestBody MoodTrack moodTrack) {
        try {
            MoodTrack savedEntry = moodTrackService.saveMoodEntry(moodTrack);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedEntry);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Fetch mood history for user
    @GetMapping
    public ResponseEntity<List<MoodTrack>> getMoodHistory(
            @RequestParam String userEmail) {

        return ResponseEntity.ok(
                moodTrackService.getMoodHistory(userEmail)
        );
    }

    // Fetch mood for a specific day
    @GetMapping("/day")
    public ResponseEntity<?> getMoodByDay(
            @RequestParam String userEmail,
            @RequestParam String day) {

        Optional<MoodTrack> mood =
                moodTrackService.getMoodByDay(userEmail, LocalDate.parse(day));

        return mood.map(ResponseEntity::ok)
                   .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
