package com.tasknest.entity;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "users") // maps this entity to the "users" table
public class User {

    @Id
    @Column(name = "email_id", nullable = false, unique = true)
    private String emailId; // Primary Key

    @Column(name = "full_name", nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer age;

    @Column(nullable = false)
    private String gender;

    @Column(nullable = false)
    private String profession;

    @Column(nullable = false)
    private String password;

    @Transient
    private String confirmPassword;

    

    // Default constructor (required by JPA)
    public User() {}

    //  All-args constructor (for convenience) — joiningDate excluded (auto-set)
    public User(String emailId, String name, Integer age, String gender, String profession,
                String password, String confirmPassword) {
        this.emailId = emailId;
        this.name = name;
        this.age = age;
        this.gender = gender;
        this.profession = profession;
        this.password = password;
        this.confirmPassword = confirmPassword;
    }

    

    // 🧩 Getters and Setters
    public String getEmailId() {
        return emailId;
    }

    public void setEmailId(String emailId) {
        this.emailId = emailId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getProfession() {
        return profession;
    }

    public void setProfession(String profession) {
        this.profession = profession;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getConfirmPassword() {
        return confirmPassword;
    }

    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }

    

    // 🧩 toString() method for debugging/logging
    @Override
    public String toString() {
        return "User [emailId=" + emailId + ", fullName=" + name + ", age=" + age +
                ", gender=" + gender + ", profession=" + profession +
                ", password=" + password + ", confirmPassword=" + confirmPassword +  "]";
    }
}
