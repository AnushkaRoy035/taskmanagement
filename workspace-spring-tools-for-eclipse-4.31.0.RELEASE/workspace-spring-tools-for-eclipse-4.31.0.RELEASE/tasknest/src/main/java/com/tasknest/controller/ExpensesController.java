package com.tasknest.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.tasknest.entity.Expenses;
import com.tasknest.service.ExpensesService;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ExpensesController {

    @Autowired
    private ExpensesService expensesService;

    @PostMapping
    public ResponseEntity<Expenses> createExpense(@RequestBody Expenses expense) {
        return ResponseEntity.ok(expensesService.createExpense(expense));
    }

    @GetMapping
    public ResponseEntity<List<Expenses>> getAllExpenses() {
        return ResponseEntity.ok(expensesService.getAllExpenses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Expenses> getExpense(@PathVariable Long id) {
        return expensesService.getExpenseById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{email}")
    public ResponseEntity<List<Expenses>> getExpensesByUserEmail(@PathVariable String email) {
        return ResponseEntity.ok(expensesService.getExpensesByUserEmail(email));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Expenses> updateExpense(
            @PathVariable Long id,
            @RequestBody Expenses expense
    ) {
        return ResponseEntity.ok(expensesService.updateExpense(id, expense));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        expensesService.deleteExpense(id);
        return ResponseEntity.ok().build();
    }
}
