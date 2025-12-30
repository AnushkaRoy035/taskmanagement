package com.tasknest.service;

import com.tasknest.entity.Budget;
import com.tasknest.entity.Expenses;
import com.tasknest.repository.BudgetRepository;
import com.tasknest.repository.ExpensesRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;

@Service
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepo;
    private final ExpensesRepository expensesRepo;

    public BudgetServiceImpl(BudgetRepository b, ExpensesRepository e) {
        this.budgetRepo = b;
        this.expensesRepo = e;
    }

    @Override
    public Budget getOrCreateMonthlyBudget(String email, String month) {
        return budgetRepo.findByUserEmailAndMonth(email, month)
                .orElseGet(() -> {
                    Budget b = new Budget();
                    b.setUserEmail(email);
                    b.setMonth(month);
                    b.setFundsAmount(BigDecimal.ZERO);
                    b.setMonthlyBudget(BigDecimal.ZERO);
                    b.setUpdateDate(LocalDate.now());
                    return budgetRepo.save(b);
                });
    }

    @Override
    public Budget addFunds(Long id, BigDecimal amount) {
        Budget b = budgetRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found"));

        BigDecimal updated = b.getFundsAmount().add(amount);
        b.setFundsAmount(updated);
        b.setMonthlyBudget(updated); // derived
        b.setUpdateDate(LocalDate.now());
        return budgetRepo.save(b);
    }

    @Override
    public Map<String, Object> getMonthlyStats(String email, String month) {

        YearMonth ym = YearMonth.parse(month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        Budget budget = getOrCreateMonthlyBudget(email, month);
        List<Expenses> expenses =
                expensesRepo.findByUserEmailAndPurchaseDateBetween(email, start, end);

        BigDecimal totalSpent = expenses.stream()
                .map(Expenses::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, BigDecimal> categoryTotals = new HashMap<>();
        Map<LocalDate, BigDecimal> dailyTotals = new HashMap<>();

        for (Expenses e : expenses) {
            categoryTotals.merge(e.getCategory(), e.getAmount(), BigDecimal::add);
            dailyTotals.merge(e.getPurchaseDate(), e.getAmount(), BigDecimal::add);
        }

        String mostSpentCategory = categoryTotals.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");

        BigDecimal avgDaily =
                dailyTotals.isEmpty()
                        ? BigDecimal.ZERO
                        : totalSpent.divide(
                                BigDecimal.valueOf(dailyTotals.size()),
                                2,
                                RoundingMode.HALF_UP
                        );

        return Map.of(
                "monthlyBudget", budget.getMonthlyBudget(),
                "totalSpent", totalSpent,
                "availableBudget", budget.getMonthlyBudget().subtract(totalSpent),
                "mostSpentCategory", mostSpentCategory,
                "avgDailySpent", avgDaily
        );
    }
}
