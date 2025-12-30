package com.tasknest.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.tasknest.entity.Expenses;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpensesRepository extends JpaRepository<Expenses, Long> {

    // Fetch all expenses belonging to a specific user by email
    List<Expenses> findByUserEmail(String userEmail);
    
    List<Expenses> findByUserEmailAndPurchaseDateBetween(
            String userEmail,
            LocalDate start,
            LocalDate end
    );
}