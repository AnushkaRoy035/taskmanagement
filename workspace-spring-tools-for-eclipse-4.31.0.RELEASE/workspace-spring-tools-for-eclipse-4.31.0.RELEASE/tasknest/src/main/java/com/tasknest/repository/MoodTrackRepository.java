package com.tasknest.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.tasknest.entity.MoodTrack;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MoodTrackRepository extends JpaRepository<MoodTrack, Long> {
    List<MoodTrack> findByUserEmail(String userEmail);
    List<MoodTrack> findByUserEmailOrderByTimestampDesc(String userEmail);
    Optional<MoodTrack> findByUserEmailAndDay(String userEmail, LocalDate day);
    
}
