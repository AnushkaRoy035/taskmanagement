package com.tasknest.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.tasknest.entity.User;
import com.tasknest.service.UserService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    // ------------------- CRUD OPERATIONS -------------------

    // Create or Register new user
    @PostMapping("/signup")
    public User createUser(@RequestBody User user) {
        return userService.saveUser(user);
    }

    // Get all users
    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // Get user by email ID (Primary Key)
    @GetMapping("/{emailId}")
    public ResponseEntity<User> getUserByEmailId(@PathVariable String emailId) {
        return userService.getUserByEmailId(emailId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Login
    @PostMapping("/login")
    public ResponseEntity<User> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("emailId");
        String password = loginRequest.get("password");

        return userService.login(email, password)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(401).body(null));
    }

    // Update user details by email ID
    @PutMapping("/{emailId}")
    public User updateUser(@PathVariable String emailId, @RequestBody User updatedUser) {
        return userService.updateUser(emailId, updatedUser);
    }

    // Delete user by email ID
    @DeleteMapping("/{emailId}")
    public String deleteUser(@PathVariable String emailId) {
        userService.deleteUser(emailId);
        return "User deleted successfully with email ID: " + emailId;
    }

    // ------------------- CUSTOM QUERIES -------------------
    @GetMapping("/search/name/{name}")
    public List<User> getUsersByFullName(@PathVariable String name) {
        return userService.getUsersByName(name);
    }

    @GetMapping("/search/profession/{profession}")
    public List<User> getUsersByProfession(@PathVariable String profession) {
        return userService.getUsersByProfession(profession);
    }

    @GetMapping("/search/age")
    public List<User> getUsersByAgeRange(@RequestParam Integer min, @RequestParam Integer max) {
        return userService.getUsersByAgeRange(min, max);
    }

    

    @GetMapping("/search/gmail")
    public List<User> getAllGmailUsers() {
        return userService.getAllGmailUsers();
    }

    // ------------------- FORGOT PASSWORD -------------------

    // Step 1: Request password reset (generates token)
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        try {
            String token = userService.generateResetToken(email);
            // In real app: send token via email
            return ResponseEntity.ok("Reset token generated (demo): " + token);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Step 2: Verify reset token
    @PostMapping("/verify-reset-token")
    public ResponseEntity<String> verifyResetToken(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String token = payload.get("token");
        boolean valid = userService.verifyResetToken(email, token);
        if (valid) {
            return ResponseEntity.ok("Reset token is valid");
        } else {
            return ResponseEntity.status(400).body("Invalid or expired reset token");
        }
    }

    // Step 3: Reset password using token
    @PostMapping("/{emailId}/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String token = payload.get("token");
        String newPassword = payload.get("newPassword");

        try {
            userService.resetPassword(email, token, newPassword);
            return ResponseEntity.ok("Password reset successful");
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }
    
    @PutMapping("/{emailId}/reset-normal")
    public ResponseEntity<String> resetPasswordNormal(
            @PathVariable String emailId,
            @RequestBody Map<String, String> payload
    ) {
        String newPassword = payload.get("password");

        if (newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body("Password must be at least 6 characters");
        }

        try {
            userService.resetPasswordNormal(emailId, newPassword);
            return ResponseEntity.ok("Password reset successfully");
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    
   
}
