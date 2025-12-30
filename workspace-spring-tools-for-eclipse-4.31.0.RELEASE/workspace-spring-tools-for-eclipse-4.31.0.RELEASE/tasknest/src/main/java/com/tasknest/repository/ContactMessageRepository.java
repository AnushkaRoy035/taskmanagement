package com.tasknest.repository;

import com.tasknest.entity.ContactMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {
    
    // Find all messages ordered by creation date (newest first)
    List<ContactMessage> findAllByOrderByCreatedAtDesc();
    
    // Find unread messages
    List<ContactMessage> findByIsReadFalseOrderByCreatedAtDesc();
    
    // Find messages that need response
    List<ContactMessage> findByIsRespondedFalseOrderByCreatedAtDesc();
    
    // Find messages by email
    List<ContactMessage> findByEmailOrderByCreatedAtDesc(String email);
    
    // Find messages created after a specific date
    List<ContactMessage> findByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime date);
    
    // Count unread messages
    Long countByIsReadFalse();
    
    // Count messages that need response
    Long countByIsRespondedFalse();
    
    // Custom query to get message statistics
    @Query("SELECT DATE(c.createdAt) as date, COUNT(c) as count FROM ContactMessage c " +
           "WHERE c.createdAt >= :startDate " +
           "GROUP BY DATE(c.createdAt) " +
           "ORDER BY date DESC")
    List<Object[]> getMessageStatistics(LocalDateTime startDate);
}