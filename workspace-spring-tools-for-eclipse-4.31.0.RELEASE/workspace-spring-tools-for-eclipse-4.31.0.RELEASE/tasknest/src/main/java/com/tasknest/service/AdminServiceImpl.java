package com.tasknest.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tasknest.entity.Admin;
import com.tasknest.repository.AdminRepository;

import java.util.List;
import java.util.Optional;

@Service
public class AdminServiceImpl implements AdminService {

    private final AdminRepository adminRepository;

    @Autowired
    public AdminServiceImpl(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    // Create or update admin
    @Override
    public Admin saveAdmin(Admin admin) {
        return adminRepository.save(admin);
    }

    // Get all admins
    @Override
    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }

    // Get admin by email
    @Override
    public Optional<Admin> getAdminByEmail(String adminEmail) {
        return adminRepository.findById(adminEmail);
    }

    // Update admin details by email
    @Override
    public Admin updateAdmin(String adminEmail, Admin updatedAdmin) {
        Optional<Admin> existingAdmin = adminRepository.findById(adminEmail);

        if (existingAdmin.isPresent()) {
            Admin admin = existingAdmin.get();
            admin.setPassword(updatedAdmin.getPassword());
            return adminRepository.save(admin);
        }
        return null;
    }

    // Delete admin by email
    @Override
    public void deleteAdmin(String adminEmail) {
        adminRepository.deleteById(adminEmail);
    }

    // Admin login
    @Override
    public Optional<Admin> login(String adminEmail, String password) {
        return adminRepository.findByAdminEmailAndPassword(adminEmail, password);
    }
}
