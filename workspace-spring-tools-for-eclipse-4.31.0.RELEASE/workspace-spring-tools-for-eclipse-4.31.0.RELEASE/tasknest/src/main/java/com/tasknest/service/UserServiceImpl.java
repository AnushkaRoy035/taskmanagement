package com.tasknest.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.tasknest.entity.User;
import com.tasknest.repository.UserRepository;

import java.security.SecureRandom;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final ConcurrentHashMap<String, String> resetTokens = new ConcurrentHashMap<>();

    @Autowired
    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Autowired
    private JavaMailSender mailSender;
    
    @Override
    public User saveUser(User user) {
        if (!user.getPassword().equals(user.getConfirmPassword())) {
            throw new RuntimeException("Password and Confirm Password do not match!");
        }
        String hashed = passwordEncoder.encode(user.getPassword());
        user.setPassword(hashed);
        user.setConfirmPassword(hashed);
        return userRepository.save(user);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public Optional<User> getUserByEmailId(String emailId) {
        return userRepository.findById(emailId);
    }

    @Override
    public User updateUser(String emailId, User updatedUser) {
        return userRepository.findById(emailId).map(existing -> {
            existing.setName(updatedUser.getName());
            existing.setAge(updatedUser.getAge());
            existing.setGender(updatedUser.getGender());
            existing.setProfession(updatedUser.getProfession());
            if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
                String hashed = passwordEncoder.encode(updatedUser.getPassword());
                existing.setPassword(hashed);
                existing.setConfirmPassword(hashed);
            }
            return userRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public void deleteUser(String emailId) {
        if (!userRepository.existsById(emailId)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(emailId);
    }

    @Override
    public User resetPasswordNormal(String emailId, String newPassword) {
        User user = userRepository.findById(emailId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String hashed = passwordEncoder.encode(newPassword);
        user.setPassword(hashed);
        user.setConfirmPassword(hashed);

        return userRepository.save(user);
    }
    
    @Override
    public List<User> getUsersByName(String name) {
        return userRepository.findByName(name);
    }

    @Override
    public List<User> getUsersByProfession(String profession) {
        return userRepository.findByProfessionIgnoreCase(profession);
    }

    @Override
    public List<User> getUsersByAgeRange(Integer minAge, Integer maxAge) {
        return userRepository.findByAgeBetween(minAge, maxAge);
    }

    

    @Override
    public Optional<User> login(String emailId, String password) {
        return userRepository.findById(emailId)
                .filter(user -> passwordEncoder.matches(password, user.getPassword()));
    }

    @Override
    public List<User> getAllGmailUsers() {
        return userRepository.findAllGmailUsers();
    }

 // -------------------- Forgot Password --------------------
    @Override
    public String generateResetToken(String email) throws Exception {
        User user = userRepository.findById(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = new SecureRandom().ints(6, 0, 62)
                .mapToObj(i -> "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charAt(i))
                .collect(StringBuilder::new, StringBuilder::append, StringBuilder::append)
                .toString();
        resetTokens.put(email, token);

        // Send token to user email
        sendResetEmail(email, token);

        return token;
    }

    @Override
    public void sendResetEmail(String email, String token) throws Exception {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("TaskNest Password Reset");
        message.setText("Your password reset token is:\n\n" + token +
                        "\n\nUse this token in the app to reset your password.");
        mailSender.send(message);
    }

    @Override
    public boolean verifyResetToken(String email, String token) {
        return resetTokens.containsKey(email) && resetTokens.get(email).equals(token);
    }

    @Override
    public void resetPassword(String email, String token, String newPassword) {
        if (!verifyResetToken(email, token)) {
            throw new RuntimeException("Invalid or expired reset token");
        }
        User user = userRepository.findById(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String hashed = passwordEncoder.encode(newPassword);
        user.setPassword(hashed);
        user.setConfirmPassword(hashed);
        userRepository.save(user);

        // Remove token after successful reset
        resetTokens.remove(email);
    }
}

