package com.tasknest.service;

import com.tasknest.entity.MoodTrack;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MoodTrackService {
    MoodTrack saveMoodEntry(MoodTrack moodTrack);
    List<MoodTrack> getMoodEntriesByUser(String userEmail);
    List<MoodTrack> getMoodHistory(String userEmail);

    Optional<MoodTrack> getMoodByDay(String userEmail, LocalDate day);
}
