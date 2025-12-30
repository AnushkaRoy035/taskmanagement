package com.tasknest.service;

import com.tasknest.entity.Budget;
import java.math.BigDecimal;
import java.util.Map;

public interface BudgetService {

    Budget getOrCreateMonthlyBudget(String userEmail, String month);

    Budget addFunds(Long budgetId, BigDecimal amount);

    Map<String, Object> getMonthlyStats(String userEmail, String month);
}
