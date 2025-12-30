package com.tasknest.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import com.tasknest.entity.User;

public interface UserService {

    // Insert or Update user
    User saveUser(User user);

    // Get all users (SELECT *)
    List<User> getAllUsers();

    // Get single user by email ID (Primary Key)
    Optional<User> getUserByEmailId(String emailId);
    
    
    // Update user by email ID
    User updateUser(String emailId, User updatedUser);

    // Delete user by email ID
    void deleteUser(String emailId);

    // ---------- Custom Queries ----------

    // 1. Find users by full name
    List<User> getUsersByName(String fullName);

    // 2. Find users by profession
    List<User> getUsersByProfession(String profession);

    // 3. Find users within a given age range
    List<User> getUsersByAgeRange(Integer minAge, Integer maxAge);

    

    // 5. Authenticate user (login)
    Optional<User> login(String emailId, String password);
    
    User resetPasswordNormal(String emailId, String newPassword);

    // 6. Get all users with Gmail addresses
    List<User> getAllGmailUsers();

    String generateResetToken(String email) throws Exception;
    boolean verifyResetToken(String email, String token);
    void resetPassword(String email, String token, String newPassword);
    void sendResetEmail(String email, String token) throws Exception;
    
    

   
}
