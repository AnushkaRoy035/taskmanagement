package com.tasknest.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "budget",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_email", "month"}))
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "budget_id")
    private Long budgetID;

    @Column(name = "monthly_budget", nullable = false)
    private BigDecimal monthlyBudget; // DERIVED from fundsAmount

    @Column(name = "funds_amount", nullable = false)
    private BigDecimal fundsAmount;

    @Column(name = "month", nullable = false)
    private String month; // YYYY-MM

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    @Column(name = "update_date", nullable = false)
    private LocalDate updateDate;

    public Budget() {}

    // getters & setters
    public Long getBudgetID() { return budgetID; }
    public void setBudgetID(Long budgetID) { this.budgetID = budgetID; }

    public BigDecimal getMonthlyBudget() { return monthlyBudget; }
    public void setMonthlyBudget(BigDecimal monthlyBudget) { this.monthlyBudget = monthlyBudget; }

    public BigDecimal getFundsAmount() { return fundsAmount; }
    public void setFundsAmount(BigDecimal fundsAmount) { this.fundsAmount = fundsAmount; }

    public String getMonth() { return month; }
    public void setMonth(String month) { this.month = month; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public LocalDate getUpdateDate() { return updateDate; }
    public void setUpdateDate(LocalDate updateDate) { this.updateDate = updateDate; }
}
