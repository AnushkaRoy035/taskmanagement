package com.tasknest.controller;

import com.tasknest.service.BudgetService;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = "http://localhost:3000")
public class BudgetController {

    private final BudgetService service;

    public BudgetController(BudgetService service) {
        this.service = service;
    }

    @GetMapping("/{email}/{month}")
    public Object getBudget(@PathVariable String email, @PathVariable String month) {
        return service.getOrCreateMonthlyBudget(email, month);
    }

    @PutMapping("/{id}/addFunds")
    public Object addFunds(@PathVariable Long id, @RequestParam BigDecimal amount) {
        return service.addFunds(id, amount);
    }

    @GetMapping("/stats/{email}/{month}")
    public Map<String, Object> getStats(
            @PathVariable String email,
            @PathVariable String month) {
        return service.getMonthlyStats(email, month);
    }
}
