package com.tasknest.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDate;

@Entity
@Table(name = "mood_track")
public class MoodTrack {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "day", nullable = false)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate day;

    @Column(nullable = false)
    private String mood;

    @Column(nullable = false)
    private String score;

    @Column(nullable = false)
    private String userEmail;

    @Column(nullable = false)
    private String timestamp;

    @Column(columnDefinition = "TEXT")
    private String details; // store everything as JSON (positiveEvents, challenges, gratitude, suggestions, etc.)

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDate getDay() { return day; }
    public void setDay(LocalDate day) { this.day = day; }

    public String getMood() { return mood; }
    public void setMood(String mood) { this.mood = mood; }

    public String getScore() { return score; }
    public void setScore(String score) { this.score = score; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
}
