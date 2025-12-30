package com.tasknest.service;

import org.springframework.stereotype.Service;
import com.tasknest.entity.MoodTrack;
import com.tasknest.repository.MoodTrackRepository;
import com.tasknest.service.MoodTrackService;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class MoodTrackServiceImpl implements MoodTrackService {

    private final MoodTrackRepository moodTrackRepository;

    public MoodTrackServiceImpl(MoodTrackRepository moodTrackRepository) {
        this.moodTrackRepository = moodTrackRepository;
    }

    @Override
    public MoodTrack saveMoodEntry(MoodTrack moodTrack) {
        return moodTrackRepository.save(moodTrack);
    }

    @Override
    public List<MoodTrack> getMoodEntriesByUser(String userEmail) {
        return moodTrackRepository.findByUserEmail(userEmail);
    }

    @Override
    public List<MoodTrack> getMoodHistory(String userEmail) {
        return moodTrackRepository
                .findByUserEmailOrderByTimestampDesc(
                    userEmail.trim().toLowerCase()
                );
    }

    @Override
    public Optional<MoodTrack> getMoodByDay(String userEmail, LocalDate day) {
        return moodTrackRepository.findByUserEmailAndDay(userEmail, day);
    }
    
}
