package com.tasknest.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import com.tasknest.entity.Expenses;

public interface ExpensesService {
    Expenses createExpense(Expenses expense);
    List<Expenses> getAllExpenses();
    Optional<Expenses> getExpenseById(Long id);
    List<Expenses> getExpensesByUserEmail(String userEmail);
    List<Expenses> getExpensesForMonth(String email, LocalDate start, LocalDate end);
    Expenses updateExpense(Long id, Expenses expense);
    void deleteExpense(Long id);
}

