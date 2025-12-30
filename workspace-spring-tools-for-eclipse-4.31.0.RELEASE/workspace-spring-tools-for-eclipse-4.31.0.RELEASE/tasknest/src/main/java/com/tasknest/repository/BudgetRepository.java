package com.tasknest.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.tasknest.entity.Budget;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {

    Optional<Budget> findByUserEmailAndMonth(String userEmail, String month);

    boolean existsByUserEmailAndMonth(String userEmail, String month);
}
