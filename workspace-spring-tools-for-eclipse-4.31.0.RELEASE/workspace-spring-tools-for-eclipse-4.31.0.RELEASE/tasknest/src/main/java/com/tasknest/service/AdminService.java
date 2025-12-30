package com.tasknest.service;

import java.util.List;
import java.util.Optional;

import com.tasknest.entity.Admin;

public interface AdminService {

    // Insert or update admin
    Admin saveAdmin(Admin admin);

    // Get all admins
    List<Admin> getAllAdmins();

    // Get admin by email
    Optional<Admin> getAdminByEmail(String adminEmail);

    // Update admin by email
    Admin updateAdmin(String adminEmail, Admin updatedAdmin);

    // Delete admin by email
    void deleteAdmin(String adminEmail);

    // Login authentication
    Optional<Admin> login(String adminEmail, String password);
}

