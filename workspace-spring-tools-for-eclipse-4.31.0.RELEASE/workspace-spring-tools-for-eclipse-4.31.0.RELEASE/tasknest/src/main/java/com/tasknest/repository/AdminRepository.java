package com.tasknest.repository;

import com.tasknest.entity.Admin;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminRepository extends JpaRepository<Admin, String> {

    Optional<Admin> findByAdminEmail(String adminEmail);

    boolean existsByAdminEmail(String adminEmail);

    Optional<Admin> findByAdminEmailAndPassword(String adminEmail, String password);
}
