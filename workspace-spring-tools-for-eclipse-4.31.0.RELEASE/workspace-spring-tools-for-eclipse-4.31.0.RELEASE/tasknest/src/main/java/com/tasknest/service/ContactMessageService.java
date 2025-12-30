package com.tasknest.service;

import com.tasknest.entity.ContactMessage;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

public interface ContactMessageService {
    
    // Save a new contact message
    ContactMessage saveContactMessage(ContactMessage contactMessage, HttpServletRequest request);
    
    // Get all contact messages
    List<ContactMessage> getAllContactMessages();
    
    // Get contact message by ID
    ContactMessage getContactMessageById(Long id);
    
    // Get messages by email
    List<ContactMessage> getContactMessagesByEmail(String email);
    
    // Update message status
    ContactMessage updateMessageStatus(Long id, Boolean isRead, Boolean isResponded);
    
    // Delete a message
    void deleteContactMessage(Long id);
    
    // Get statistics
    Map<String, Object> getMessageStatistics();
    
    // Get unread count
    Long getUnreadMessageCount();
    
    // Mark message as read
    ContactMessage markAsRead(Long id);
    
    // Mark message as responded
    ContactMessage markAsResponded(Long id);
}