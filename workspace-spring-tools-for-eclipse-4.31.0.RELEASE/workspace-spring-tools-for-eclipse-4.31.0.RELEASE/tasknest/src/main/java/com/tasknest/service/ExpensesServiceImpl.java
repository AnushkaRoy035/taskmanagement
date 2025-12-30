package com.tasknest.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tasknest.entity.Expenses;
import com.tasknest.repository.ExpensesRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ExpensesServiceImpl implements ExpensesService {

    private final ExpensesRepository expensesRepository;

    @Autowired
    public ExpensesServiceImpl(ExpensesRepository expenseRepository) {
        this.expensesRepository = expenseRepository;
    }

    @Override
    public Expenses createExpense(Expenses expense) {
        // ensure id is null so DB will generate it
        expense.setExpenseId(null);
        return expensesRepository.save(expense);
    }

    @Override
    public List<Expenses> getAllExpenses() {
        return expensesRepository.findAll();
    }

    @Override
    public Optional<Expenses> getExpenseById(Long id) {
        return expensesRepository.findById(id);
    }

    @Override
    public List<Expenses> getExpensesByUserEmail(String userEmail) {
        // uses the derived query added to the repository
        return expensesRepository.findByUserEmail(userEmail);
    }
    
    @Override
    public List<Expenses> getExpensesForMonth(String email, LocalDate start, LocalDate end) {
        return expensesRepository.findByUserEmailAndPurchaseDateBetween(email, start, end);
    }

    @Override
    public Expenses updateExpense(Long id, Expenses expense) {
        return expensesRepository.findById(id).map(existing -> {
            existing.setDescription(expense.getDescription());
            existing.setPurchaseDate(expense.getPurchaseDate());
            existing.setAmount(expense.getAmount());
            existing.setCategory(expense.getCategory());
            // paymentMethod removed from Expense entity — do not set it here
            existing.setUserEmail(expense.getUserEmail());
            return expensesRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Expense not found with id " + id));
    }

    @Override
    public void deleteExpense(Long id) {
        expensesRepository.deleteById(id);
    }
}

