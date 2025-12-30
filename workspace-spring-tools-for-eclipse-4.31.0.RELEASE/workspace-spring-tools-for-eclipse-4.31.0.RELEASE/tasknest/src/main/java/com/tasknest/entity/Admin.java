package com.tasknest.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "admin")
public class Admin {

    @Id
    @Column(nullable = false, unique = true)
    private String adminEmail;

    @Column(nullable = false)
    private String password;

    // ----------- Constructors -----------

    public Admin() {
        // Default constructor
    }

    public Admin(String adminEmail, String password) {
        this.adminEmail = adminEmail;
        this.password = password;
    }

    // ----------- Getters & Setters -----------

    public String getAdminEmail() {
        return adminEmail;
    }

    public void setAdminEmail(String adminEmail) {
        this.adminEmail = adminEmail;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    // ----------- toString() -----------

    @Override
    public String toString() {
        return "Admin{" +
                "adminEmail='" + adminEmail + '\'' +
                ", password='[PROTECTED]'" +
                '}';
    }
}

