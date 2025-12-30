package com.tasknest.controller;

import com.tasknest.entity.ContactMessage;
import com.tasknest.service.ContactMessageService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "http://localhost:3000") // For development, restrict in production
public class ContactController {
    
    @Autowired
    private ContactMessageService contactMessageService;
    
    /**
     * Submit a new contact message
     * POST /api/contact/submit
     */
    @PostMapping("/submit")
    public ResponseEntity<Map<String, Object>> submitContactForm(
            @RequestBody ContactMessage contactMessage,
            HttpServletRequest request) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Validate and save the contact message
            ContactMessage savedMessage = contactMessageService.saveContactMessage(contactMessage, request);
            
            response.put("success", true);
            response.put("message", "Your message has been sent successfully! We'll get back to you soon.");
            response.put("data", savedMessage);
            response.put("timestamp", java.time.LocalDateTime.now());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", "Validation error: " + e.getMessage());
            response.put("timestamp", java.time.LocalDateTime.now());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to submit your message. Please try again later.");
            response.put("error", e.getMessage());
            response.put("timestamp", java.time.LocalDateTime.now());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Get all contact messages (for admin panel)
     * GET /api/contact/messages
     */
    @GetMapping("/messages")
    public ResponseEntity<Map<String, Object>> getAllMessages() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<ContactMessage> messages = contactMessageService.getAllContactMessages();
            
            response.put("success", true);
            response.put("count", messages.size());
            response.put("data", messages);
            response.put("timestamp", java.time.LocalDateTime.now());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to retrieve messages");
            response.put("error", e.getMessage());
            response.put("timestamp", java.time.LocalDateTime.now());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Get a specific message by ID
     * GET /api/contact/messages/{id}
     */
    @GetMapping("/messages/{id}")
    public ResponseEntity<Map<String, Object>> getMessageById(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            ContactMessage message = contactMessageService.getContactMessageById(id);
            
            response.put("success", true);
            response.put("data", message);
            response.put("timestamp", java.time.LocalDateTime.now());
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            response.put("timestamp", java.time.LocalDateTime.now());
            
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to retrieve message");
            response.put("error", e.getMessage());
            response.put("timestamp", java.time.LocalDateTime.now());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Get messages by email
     * GET /api/contact/messages/email/{email}
     */
    @GetMapping("/messages/email/{email}")
    public ResponseEntity<Map<String, Object>> getMessagesByEmail(@PathVariable String email) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<ContactMessage> messages = contactMessageService.getContactMessagesByEmail(email);
            
            response.put("success", true);
            response.put("count", messages.size());
            response.put("data", messages);
            response.put("timestamp", java.time.LocalDateTime.now());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to retrieve messages");
            response.put("error", e.getMessage());
            response.put("timestamp", java.time.LocalDateTime.now());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Update message status
     * PUT /api/contact/messages/{id}/status
     */
    @PutMapping("/messages/{id}/status")
    public ResponseEntity<Map<String, Object>> updateMessageStatus(
            @PathVariable Long id,
            @RequestParam(required = false) Boolean read,
            @RequestParam(required = false) Boolean responded) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            ContactMessage updatedMessage = contactMessageService.updateMessageStatus(id, read, responded);
            
            response.put("success", true);
            response.put("message", "Message status updated successfully");
            response.put("data", updatedMessage);
            response.put("timestamp", java.time.LocalDateTime.now());
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            response.put("timestamp", java.time.LocalDateTime.now());
            
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update message status");
            response.put("error", e.getMessage());
            response.put("timestamp", java.time.LocalDateTime.now());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Mark message as read
     * PUT /api/contact/messages/{id}/read
     */
    @PutMapping("/messages/{id}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            ContactMessage message = contactMessageService.markAsRead(id);
            
            response.put("success", true);
            response.put("message", "Message marked as read");
            response.put("data", message);
            response.put("timestamp", java.time.LocalDateTime.now());
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            response.put("timestamp", java.time.LocalDateTime.now());
            
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to mark message as read");
            response.put("error", e.getMessage());
            response.put("timestamp", java.time.LocalDateTime.now());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Mark message as responded
     * PUT /api/contact/messages/{id}/responded
     */
    @PutMapping("/messages/{id}/responded")
    public ResponseEntity<Map<String, Object>> markAsResponded(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            ContactMessage message = contactMessageService.markAsResponded(id);
            
            response.put("success", true);
            response.put("message", "Message marked as responded");
            response.put("data", message);
            response.put("timestamp", java.time.LocalDateTime.now());
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            response.put("timestamp", java.time.LocalDateTime.now());
            
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to mark message as responded");
            response.put("error", e.getMessage());
            response.put("timestamp", java.time.LocalDateTime.now());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Delete a message
     * DELETE /api/contact/messages/{id}
     */
    @DeleteMapping("/messages/{id}")
    public ResponseEntity<Map<String, Object>> deleteMessage(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            contactMessageService.deleteContactMessage(id);
            
            response.put("success", true);
            response.put("message", "Message deleted successfully");
            response.put("timestamp", java.time.LocalDateTime.now());
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            response.put("timestamp", java.time.LocalDateTime.now());
            
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete message");
            response.put("error", e.getMessage());
            response.put("timestamp", java.time.LocalDateTime.now());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Get message statistics
     * GET /api/contact/statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Map<String, Object> stats = contactMessageService.getMessageStatistics();
            
            response.put("success", true);
            response.put("data", stats);
            response.put("timestamp", java.time.LocalDateTime.now());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to retrieve statistics");
            response.put("error", e.getMessage());
            response.put("timestamp", java.time.LocalDateTime.now());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Get unread message count
     * GET /api/contact/unread-count
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Object>> getUnreadCount() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Long unreadCount = contactMessageService.getUnreadMessageCount();
            
            response.put("success", true);
            response.put("unreadCount", unreadCount);
            response.put("timestamp", java.time.LocalDateTime.now());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to retrieve unread count");
            response.put("error", e.getMessage());
            response.put("timestamp", java.time.LocalDateTime.now());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Health check endpoint
     * GET /api/contact/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        
        response.put("status", "UP");
        response.put("service", "Contact Service");
        response.put("timestamp", java.time.LocalDateTime.now());
        response.put("version", "1.0.0");
        
        return ResponseEntity.ok(response);
    }
}