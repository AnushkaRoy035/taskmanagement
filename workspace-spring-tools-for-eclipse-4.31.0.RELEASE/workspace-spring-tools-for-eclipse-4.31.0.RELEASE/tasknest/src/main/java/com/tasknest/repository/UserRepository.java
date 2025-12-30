package com.tasknest.repository;

import com.tasknest.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    // 1. Find by full name (exact match)
    List<User> findByName(String name);

    // 2. Find users by profession (case-insensitive)
    List<User> findByProfessionIgnoreCase(String profession);

    

    // 4. Find users within a certain age range
    List<User> findByAgeBetween(Integer minAge, Integer maxAge);

    // 5. Custom JPQL query: find users by gender (case-insensitive)
    @Query("SELECT u FROM User u WHERE LOWER(u.gender) = LOWER(:gender)")
    List<User> findUsersByGender(@Param("gender") String gender);

    // 6. Native SQL query: find all users having Gmail email addresses
    @Query(value = "SELECT * FROM users WHERE email_id LIKE '%@gmail.com'", nativeQuery = true)
    List<User> findAllGmailUsers();

    }
