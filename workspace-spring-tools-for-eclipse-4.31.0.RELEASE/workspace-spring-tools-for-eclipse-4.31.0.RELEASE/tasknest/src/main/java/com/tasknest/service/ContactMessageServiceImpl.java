package com.tasknest.service;

import com.tasknest.entity.ContactMessage;
import com.tasknest.repository.ContactMessageRepository;
import com.tasknest.service.ContactMessageService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class ContactMessageServiceImpl implements ContactMessageService {
    
    @Autowired
    private ContactMessageRepository contactMessageRepository;
    
    @Override
    public ContactMessage saveContactMessage(ContactMessage contactMessage, HttpServletRequest request) {
        // Validate required fields
        validateContactMessage(contactMessage);
        
        // Set additional information from request
        if (request != null) {
            String ipAddress = getClientIpAddress(request);
            String userAgent = request.getHeader("User-Agent");
            
            contactMessage.setIpAddress(ipAddress);
            contactMessage.setUserAgent(userAgent);
        }
        
        // Set timestamps
        contactMessage.setCreatedAt(LocalDateTime.now());
        
        // Save to database
        return contactMessageRepository.save(contactMessage);
    }
    
    @Override
    public List<ContactMessage> getAllContactMessages() {
        return contactMessageRepository.findAllByOrderByCreatedAtDesc();
    }
    
    @Override
    public ContactMessage getContactMessageById(Long id) {
        return contactMessageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact message not found with id: " + id));
    }
    
    @Override
    public List<ContactMessage> getContactMessagesByEmail(String email) {
        return contactMessageRepository.findByEmailOrderByCreatedAtDesc(email);
    }
    
    @Override
    public ContactMessage updateMessageStatus(Long id, Boolean isRead, Boolean isResponded) {
        ContactMessage message = getContactMessageById(id);
        
        if (isRead != null) {
            message.setRead(isRead);
        }
        
        if (isResponded != null) {
            message.setResponded(isResponded);
        }
        
        return contactMessageRepository.save(message);
    }
    
    @Override
    public void deleteContactMessage(Long id) {
        ContactMessage message = getContactMessageById(id);
        contactMessageRepository.delete(message);
    }
    
    @Override
    public Map<String, Object> getMessageStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        // Total messages
        Long totalMessages = contactMessageRepository.count();
        stats.put("totalMessages", totalMessages);
        
        // Unread messages
        Long unreadMessages = contactMessageRepository.countByIsReadFalse();
        stats.put("unreadMessages", unreadMessages);
        
        // Messages needing response
        Long pendingResponse = contactMessageRepository.countByIsRespondedFalse();
        stats.put("pendingResponse", pendingResponse);
        
        // Messages from last 7 days
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        List<ContactMessage> recentMessages = contactMessageRepository.findByCreatedAtAfterOrderByCreatedAtDesc(weekAgo);
        stats.put("recentMessages", recentMessages.size());
        
        // Daily statistics for last 7 days
        List<Object[]> dailyStats = contactMessageRepository.getMessageStatistics(weekAgo);
        stats.put("dailyStatistics", dailyStats);
        
        return stats;
    }
    
    @Override
    public Long getUnreadMessageCount() {
        return contactMessageRepository.countByIsReadFalse();
    }
    
    @Override
    public ContactMessage markAsRead(Long id) {
        return updateMessageStatus(id, true, null);
    }
    
    @Override
    public ContactMessage markAsResponded(Long id) {
        return updateMessageStatus(id, null, true);
    }
    
    // Helper method to validate contact message
    private void validateContactMessage(ContactMessage contactMessage) {
        if (contactMessage.getName() == null || contactMessage.getName().trim().isEmpty()) {
            throw new RuntimeException("Name is required");
        }
        
        if (contactMessage.getEmail() == null || contactMessage.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }
        
        // Basic email validation
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";
        if (!contactMessage.getEmail().matches(emailRegex)) {
            throw new RuntimeException("Invalid email format");
        }
        
        if (contactMessage.getPhone() == null || contactMessage.getPhone().trim().isEmpty()) {
            throw new RuntimeException("Phone number is required");
        }
        
        if (contactMessage.getSubject() == null || contactMessage.getSubject().trim().isEmpty()) {
            throw new RuntimeException("Subject is required");
        }
        
        if (contactMessage.getMessage() == null || contactMessage.getMessage().trim().isEmpty()) {
            throw new RuntimeException("Message is required");
        }
        
        // Limit message length
        if (contactMessage.getMessage().length() > 5000) {
            throw new RuntimeException("Message is too long (maximum 5000 characters)");
        }
    }
    
    // Helper method to get client IP address
    private String getClientIpAddress(HttpServletRequest request) {
        String ipAddress = request.getHeader("X-Forwarded-For");
        
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("Proxy-Client-IP");
        }
        
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("WL-Proxy-Client-IP");
        }
        
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("HTTP_CLIENT_IP");
        }
        
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getRemoteAddr();
        }
        
        // In case of multiple IPs (from proxy), take the first one
        if (ipAddress != null && ipAddress.contains(",")) {
            ipAddress = ipAddress.split(",")[0].trim();
        }
        
        return ipAddress;
    }
}