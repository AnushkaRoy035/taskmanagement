import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const Budget = ({ addNotification }) => {
  // Get user email from localStorage based on your login structure
  const getUserEmailFromLocalStorage = () => {
    try {
      const userDataStr = localStorage.getItem('user');
      if (!userDataStr) {
        console.log('No user data found in localStorage');
        return null;
      }
      
      const userData = JSON.parse(userDataStr);
      
      if (userData.emailId) {
        return userData.emailId;
      }
      if (userData.email) {
        return userData.email;
      }
      if (userData.userEmail) {
        return userData.userEmail;
      }
      if (userData.username) {
        return userData.username;
      }
      
      return null;
      
    } catch (error) {
      console.error('Error getting user email from localStorage:', error);
      return null;
    }
  };

  // State for user email
  const [userEmail, setUserEmail] = useState(null);
  
  // State for budget data
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [totalFundsAdded, setTotalFundsAdded] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [budgetData, setBudgetData] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fund management state
  const [fundAmount, setFundAmount] = useState('');
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  
  // Auto-distribution states
  const [showDistributionModal, setShowDistributionModal] = useState(false);
  const [categoryPercentages, setCategoryPercentages] = useState({
    food: 30,
    transport: 15,
    bills: 20,
    entertainment: 10,
    shopping: 10,
    healthcare: 8,
    education: 5,
    other: 2
  });
  
  // UI state for category budgets
  const [categoryBudgets, setCategoryBudgets] = useState({
    food: 0,
    transport: 0,
    bills: 0,
    entertainment: 0,
    shopping: 0,
    healthcare: 0,
    education: 0,
    other: 0
  });

  // Get current month in YYYY-MM format
  function getCurrentMonth() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  // Check if user is logged in
  const checkLoginStatus = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userEmail = getUserEmailFromLocalStorage();
    
    return isLoggedIn && userEmail;
  };

  // Initialize user email from localStorage
  useEffect(() => {
    const isLoggedIn = checkLoginStatus();
    if (!isLoggedIn) {
      addNotification('Please log in to view budget', 'error');
      return;
    }
    
    const email = getUserEmailFromLocalStorage();
    if (email) {
      setUserEmail(email);
    } else {
      addNotification('Could not retrieve user information. Please log in again.', 'error');
    }
  }, []);

  // Fetch all data
  const fetchAllData = async () => {
    if (!userEmail) {
      console.error('No user email available');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Fetch budget for current month
      const budgetResponse = await axios.get(
        `http://localhost:8080/api/budgets/${userEmail}/${currentMonth}`
      );
      console.log('Budget response:', budgetResponse.data);
      setBudgetData(budgetResponse.data);
      
      const fundsAmountValue = parseFloat(budgetResponse.data.fundsAmount) || 0;
      const monthlyBudgetValue = parseFloat(budgetResponse.data.monthlyBudget) || 0;
      
      setTotalFundsAdded(fundsAmountValue);
      setMonthlyBudget(fundsAmountValue);

      // 2. Fetch all expenses for the user
      const expensesResponse = await axios.get(
        `http://localhost:8080/api/expenses/user/${userEmail}`
      );
      
      // Filter expenses for current month on client side
      const currentMonthExpenses = expensesResponse.data.filter(expense => {
        if (!expense.purchaseDate) return false;
        const expenseMonth = expense.purchaseDate.substring(0, 7);
        return expenseMonth === currentMonth;
      });
      
      setExpenses(currentMonthExpenses);

      // 3. Fetch stats
      const statsResponse = await axios.get(
        `http://localhost:8080/api/budgets/stats/${userEmail}/${currentMonth}`
      );
      setStats(statsResponse.data);

    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response) {
        if (error.response.status === 401) {
          addNotification('Session expired. Please log in again.', 'error');
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        }
      } else {
        addNotification('Failed to load budget data', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when userEmail or currentMonth changes
  useEffect(() => {
    if (userEmail) {
      fetchAllData();
    }
  }, [userEmail, currentMonth]);

  // Calculate current spending
  const calculateSpending = () => {
    const totalSpent = expenses.reduce((sum, exp) => 
      sum + parseFloat(exp.amount || 0), 0);
    
    const categorySpending = {};
    Object.keys(categoryBudgets).forEach(category => {
      categorySpending[category] = expenses
        .filter(exp => exp.category === category)
        .reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
    });

    return { totalSpent, categorySpending };
  };

  const { totalSpent, categorySpending } = calculateSpending();
  
  const totalAvailableBudget = monthlyBudget;
  const remainingBudget = totalAvailableBudget - totalSpent;
  const percentageUsed = totalAvailableBudget > 0 ? 
    (totalSpent / totalAvailableBudget) * 100 : 0;

  // Check for overspending in categories
  const checkOverspending = () => {
    const overspentCategories = [];
    
    Object.keys(categoryBudgets).forEach(category => {
      const budgeted = categoryBudgets[category] || 0;
      const spent = categorySpending[category] || 0;
      
      if (budgeted > 0 && spent > budgeted) {
        const overspentAmount = spent - budgeted;
        const overspentPercentage = (overspentAmount / budgeted) * 100;
        
        overspentCategories.push({
          category,
          overspentAmount,
          overspentPercentage,
          budgeted,
          spent
        });
      }
    });
    
    return overspentCategories;
  };

  // Get overspending warnings
  const getOverspendingWarnings = () => {
    const overspentCategories = checkOverspending();
    const warnings = [];
    
    if (overspentCategories.length > 0) {
      overspentCategories.forEach(item => {
        warnings.push({
          type: 'category_overspent',
          message: `⚠️ ${item.category.toUpperCase()} is overspent by ₹${item.overspentAmount.toFixed(2)} (${item.overspentPercentage.toFixed(1)}% over budget)`,
          severity: 'high',
          category: item.category
        });
      });
    }
    
    if (remainingBudget < 0) {
      warnings.push({
        type: 'total_overspent',
        message: `🚨 TOTAL BUDGET EXCEEDED! Overspent by ₹${Math.abs(remainingBudget).toFixed(2)}`,
        severity: 'critical'
      });
    } else if (percentageUsed > 90) {
      warnings.push({
        type: 'near_limit',
        message: `⚠️ Budget almost exhausted! ${percentageUsed.toFixed(1)}% used`,
        severity: 'medium'
      });
    }
    
    return warnings;
  };

  // Handle monthly budget update
  const handleMonthlyBudgetUpdate = async (newBudget) => {
    if (!budgetData || !userEmail) return;
    
    try {
      const currentFunds = parseFloat(budgetData.fundsAmount) || 0;
      const difference = newBudget - currentFunds;
      
      if (budgetData.budgetID && difference !== 0) {
        const response = await axios.put(
          `http://localhost:8080/api/budgets/${budgetData.budgetID}/addFunds`,
          null,
          {
            params: { amount: difference }
          }
        );
        setBudgetData(response.data);
        setMonthlyBudget(parseFloat(response.data.fundsAmount) || 0);
        setTotalFundsAdded(parseFloat(response.data.fundsAmount) || 0);
        addNotification('Monthly budget updated successfully', 'success');
      }
      
    } catch (error) {
      console.error('Error updating budget:', error);
      addNotification('Failed to update budget', 'error');
    }
  };

  // Add funds
  const handleAddFunds = async () => {
    const amount = parseFloat(fundAmount);
    if (!amount || amount <= 0) {
      addNotification('Please enter a valid amount', 'error');
      return;
    }

    if (!userEmail) {
      addNotification('User not authenticated', 'error');
      return;
    }

    try {
      if (!budgetData || !budgetData.budgetID) {
        await axios.get(
          `http://localhost:8080/api/budgets/${userEmail}/${currentMonth}`
        );
        const budgetResponse = await axios.get(
          `http://localhost:8080/api/budgets/${userEmail}/${currentMonth}`
        );
        setBudgetData(budgetResponse.data);
      }

      const response = await axios.put(
        `http://localhost:8080/api/budgets/${budgetData.budgetID}/addFunds`,
        null,
        {
          params: { amount: amount }
        }
      );
      
      const newFundsAmount = parseFloat(response.data.fundsAmount) || 0;
      
      setTotalFundsAdded(newFundsAmount);
      setMonthlyBudget(newFundsAmount);
      setBudgetData(response.data);
      
      await fetchAllData();
      
      setFundAmount('');
      addNotification(`Successfully added ₹${amount} to your budget`, 'success');
      
    } catch (error) {
      console.error('Error adding funds:', error);
      addNotification('Failed to add funds. Please try again.', 'error');
    }
  };

  // Remove funds
  const handleRemoveFunds = async () => {
    const amount = parseFloat(fundAmount);
    if (!amount || amount <= 0) {
      addNotification('Please enter a valid amount', 'error');
      return;
    }

    if (amount > totalFundsAdded) {
      addNotification('Cannot remove more than available funds', 'error');
      return;
    }

    if (!userEmail) {
      addNotification('User not authenticated', 'error');
      return;
    }

    try {
      const negativeAmount = -amount;
      const response = await axios.put(
        `http://localhost:8080/api/budgets/${budgetData.budgetID}/addFunds`,
        null,
        {
          params: { amount: negativeAmount }
        }
      );
      
      const newFundsAmount = parseFloat(response.data.fundsAmount) || 0;
      
      setTotalFundsAdded(newFundsAmount);
      setMonthlyBudget(newFundsAmount);
      setBudgetData(response.data);
      
      await fetchAllData();
      
      setFundAmount('');
      addNotification(`Successfully removed ₹${amount} from your budget`, 'success');
      
    } catch (error) {
      console.error('Error removing funds:', error);
      addNotification('Failed to remove funds', 'error');
    }
  };

  // Open distribution modal
  const openDistributionModal = () => {
    if (monthlyBudget <= 0) {
      addNotification('Please set a monthly budget first', 'error');
      return;
    }
    
    // Calculate current distribution if category budgets are set
    const currentTotal = Object.values(categoryBudgets).reduce((sum, val) => sum + val, 0);
    if (currentTotal > 0) {
      const newPercentages = {};
      Object.keys(categoryBudgets).forEach(category => {
        newPercentages[category] = (categoryBudgets[category] / currentTotal) * 100;
      });
      setCategoryPercentages(newPercentages);
    }
    
    setShowDistributionModal(true);
  };

  // Apply distribution
  const applyDistribution = () => {
    const totalPercentage = Object.values(categoryPercentages).reduce((sum, val) => sum + val, 0);
    
    if (Math.abs(totalPercentage - 100) > 0.1) {
      addNotification(`Total percentage must be 100% (currently ${totalPercentage.toFixed(1)}%)`, 'error');
      return;
    }
    
    const newCategoryBudgets = {};
    Object.keys(categoryPercentages).forEach(category => {
      newCategoryBudgets[category] = (monthlyBudget * categoryPercentages[category]) / 100;
    });
    
    setCategoryBudgets(newCategoryBudgets);
    setShowDistributionModal(false);
    
    // Check for overspending after distribution
    const overspentCategories = checkOverspending();
    if (overspentCategories.length > 0) {
      const overspentList = overspentCategories.map(item => 
        `${item.category}: ₹${item.overspentAmount.toFixed(2)} over`
      ).join(', ');
      addNotification(`Distribution applied. Warning: ${overspentList}`, 'warning');
    } else {
      addNotification('Distribution applied successfully', 'success');
    }
  };

  // Reset to default percentages
  const resetToDefaults = () => {
    setCategoryPercentages({
      food: 30,
      transport: 15,
      bills: 20,
      entertainment: 10,
      shopping: 10,
      healthcare: 8,
      education: 5,
      other: 2
    });
    addNotification('Reset to default percentages', 'info');
  };

  // Handle percentage change
  const handlePercentageChange = (category, value) => {
    const numValue = parseFloat(value) || 0;
    
    if (numValue < 0) {
      addNotification('Percentage cannot be negative', 'error');
      return;
    }
    
    setCategoryPercentages(prev => ({
      ...prev,
      [category]: numValue
    }));
  };

  // Adjust distribution to fix overspending
  const adjustForOverspending = () => {
  const overspentCategories = checkOverspending();
  
  if (overspentCategories.length === 0) {
    addNotification('No overspending detected', 'info');
    return;
  }
  
  // Create a copy of current percentages
  const newPercentages = { ...categoryPercentages };
  
  // Calculate total current budget from percentages
  const totalBudget = monthlyBudget;
  
  // Step 1: For overspent categories, set their percentage to match what they've actually spent
  overspentCategories.forEach(item => {
    const spentPercent = (item.spent / totalBudget) * 100;
    // Set percentage to actual spent amount plus a small buffer (5%)
    newPercentages[item.category] = Math.max(1, spentPercent + 5); // Minimum 1%
  });
  
  // Step 2: Calculate how much percentage is now allocated
  const allocatedPercent = Object.values(newPercentages).reduce((sum, val) => sum + val, 0);
  
  // Step 3: Find non-overspent categories
  const nonOverspentCategories = Object.keys(newPercentages).filter(
    cat => !overspentCategories.some(item => item.category === cat)
  );
  
  if (nonOverspentCategories.length > 0) {
    // Step 4: If we've allocated more than 100%, we need to reduce non-overspent categories
    if (allocatedPercent > 100) {
      const excess = allocatedPercent - 100;
      const reductionPerCategory = excess / nonOverspentCategories.length;
      
      nonOverspentCategories.forEach(category => {
        newPercentages[category] = Math.max(1, newPercentages[category] - reductionPerCategory);
      });
    } else if (allocatedPercent < 100) {
      // Step 5: If we have room left, distribute it among non-overspent categories
      const remaining = 100 - allocatedPercent;
      const additionPerCategory = remaining / nonOverspentCategories.length;
      
      nonOverspentCategories.forEach(category => {
        newPercentages[category] += additionPerCategory;
      });
    }
  } else {
    // All categories are overspent - redistribute equally
    const equalShare = 100 / Object.keys(newPercentages).length;
    Object.keys(newPercentages).forEach(category => {
      newPercentages[category] = equalShare;
    });
  }
  
  // Step 6: Normalize to ensure total is exactly 100%
  const finalTotal = Object.values(newPercentages).reduce((sum, val) => sum + val, 0);
  if (Math.abs(finalTotal - 100) > 0.01) {
    const scale = 100 / finalTotal;
    Object.keys(newPercentages).forEach(category => {
      newPercentages[category] = Math.round(newPercentages[category] * scale * 10) / 10;
    });
  }
  
  // Step 7: Round to 1 decimal place for display
  Object.keys(newPercentages).forEach(category => {
    newPercentages[category] = Math.round(newPercentages[category] * 10) / 10;
  });
  
  // Step 8: Final validation
  const finalCheck = Object.values(newPercentages).reduce((sum, val) => sum + val, 0);
  if (Math.abs(finalCheck - 100) > 0.1) {
    console.warn("Percentage total not 100% after adjustment:", finalCheck);
    // Force normalize
    const equalShare = 100 / Object.keys(newPercentages).length;
    Object.keys(newPercentages).forEach(category => {
      newPercentages[category] = Math.round(equalShare * 10) / 10;
    });
  }
  
  // Update the state
  setCategoryPercentages(newPercentages);
  
  // Show notification with details
  const overspentList = overspentCategories.map(item => 
    `${item.category}: ₹${item.overspentAmount.toFixed(2)} over`
  ).join(', ');
  addNotification(`Auto-adjusted budget distribution for: ${overspentList}`, 'success');
  
  // Log for debugging
  console.log("Auto-adjust applied:", {
    overspentCategories,
    newPercentages,
    monthlyBudget,
    totalAllocated: Object.values(newPercentages).reduce((sum, val) => sum + val, 0)
  });
};
  // Get spending suggestions
  const getSpendingSuggestions = () => {
    const suggestions = [];
    
    Object.keys(categoryBudgets).forEach(category => {
      const budgeted = categoryBudgets[category] || 0;
      const spent = categorySpending[category] || 0;
      
      if (budgeted > 0 && spent > budgeted) {
        const overspent = spent - budgeted;
        suggestions.push({
          category,
          message: `You've overspent ₹${overspent.toFixed(2)} in ${category}. Consider reducing ${category} expenses.`,
          severity: 'high'
        });
      } else if (budgeted > 0 && spent > budgeted * 0.8) {
        suggestions.push({
          category,
          message: `You're approaching your ${category} budget limit. Be mindful of your spending.`,
          severity: 'medium'
        });
      }
    });

    if (remainingBudget < 0) {
      suggestions.push({
        category: 'overall',
        message: `You've exceeded your available budget by ₹${Math.abs(remainingBudget).toFixed(2)}. Review your expenses.`,
        severity: 'high'
      });
    } else if (percentageUsed > 80) {
      suggestions.push({
        category: 'overall',
        message: `You've used ${percentageUsed.toFixed(1)}% of your available budget. Consider slowing down spending.`,
        severity: 'medium'
      });
    }

    return suggestions;
  };

  const warnings = getOverspendingWarnings();
  const suggestions = getSpendingSuggestions();

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (!userEmail) {
    return (
      <div className="budget-planner">
        <div className="error-message">
          <h3>Authentication Required</h3>
          <p>Please log in to view your budget.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="login-btn"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="budget-planner">
        <div className="loading-message">
          <h3>Loading Budget Data...</h3>
          <p>Please wait while we fetch your budget information.</p>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="budget-planner">
      {/* User Info and Month Selection */}
      <div className="header-section">
        <div className="user-info">
          <h3>Budget Dashboard</h3>
          <div className="user-details">
            
          </div>
        </div>
        
        <div className="month-selection">
          <label htmlFor="month-picker">Select Month:</label>
          <input
            id="month-picker"
            type="month"
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            className="month-picker"
          />
          <span className="current-month-display">{currentMonth}</span>
        </div>
      </div>

      {/* Overspending Warnings */}
      {warnings.length > 0 && (
        <div className="warnings-section">
          <h3>⚠️ Budget Warnings</h3>
          <div className="warnings-list">
            {warnings.map((warning, index) => (
              <div 
                key={index} 
                className={`warning-item ${warning.severity}`}
              >
                <div className="warning-message">
                  {warning.message}
                </div>
                {warning.severity === 'critical' && (
                  <button 
                    onClick={adjustForOverspending}
                    className="warning-action-btn"
                  >
                    Fix Distribution
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fund Management Section */}
      <div className="fund-management-section">
        <div className="section-header">
          <h3>Manage Funds</h3>
        </div>
        
        <div className="fund-controls">
          <div className="fund-input-group">
            <label>Amount (₹):</label>
            <input
              type="number"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              min="1"
              step="100"
              className="fund-input"
              placeholder="Enter amount"
            />
          </div>
          
          <div className="fund-buttons">
            <button 
              onClick={handleAddFunds}
              className="add-fund-btn"
              disabled={!fundAmount || parseFloat(fundAmount) <= 0}
            >
              Add Funds
            </button>
            <button 
              onClick={handleRemoveFunds}
              className="remove-fund-btn"
              disabled={!fundAmount || parseFloat(fundAmount) <= 0 || parseFloat(fundAmount) > totalFundsAdded}
            >
              Remove Funds
            </button>
          </div>
        </div>

        <div className="funds-summary">
          <div className="funds-total">
            <span>Total Available Funds: </span>
            <strong>₹{totalFundsAdded.toLocaleString('en-IN')}</strong>
          </div>
          <div className="funds-note">
            Note: Adding/removing funds updates your monthly budget automatically.
          </div>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="budget-overview">
        <div className="budget-card total-budget">
          <h3>Monthly Budget</h3>
          <div className="budget-amount">₹{monthlyBudget.toLocaleString('en-IN')}</div>
          <div className="budget-input-group">
            <label>Set Monthly Budget (₹):</label>
            <input
              type="number"
              value={monthlyBudget}
              onChange={(e) => {
                const newBudget = parseFloat(e.target.value) || 0;
                setMonthlyBudget(newBudget);
                handleMonthlyBudgetUpdate(newBudget);
              }}
              min="0"
              step="100"
              className="budget-input"
              placeholder="Set budget"
            />
          </div>
        </div>

        <div className="budget-card total-spent">
          <h3>Total Spent</h3>
          <div className={`spent-amount ${remainingBudget < 0 ? 'over-budget' : ''}`}>
            ₹{totalSpent.toLocaleString('en-IN')}
          </div>
          <div className="budget-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${Math.min(percentageUsed, 100)}%` }}
              ></div>
            </div>
            <span>{percentageUsed.toFixed(1)}% of budget used</span>
          </div>
        </div>

        <div className="budget-card remaining-budget">
          <h3>Budget Status</h3>
          <div className="available-amount">
            Budget: ₹{totalAvailableBudget.toLocaleString('en-IN')}
          </div>
          <div className={`remaining-amount ${remainingBudget < 0 ? 'negative' : 'positive'}`}>
            {remainingBudget < 0 ? 'Overspent by ' : 'Remaining: '}
            ₹{Math.abs(remainingBudget).toLocaleString('en-IN')}
          </div>
          <div className="budget-status">
            {remainingBudget < 0 ? 'Over Budget' : 
             percentageUsed < 70 ? 'Excellent' : 
             percentageUsed < 90 ? 'On Track' : 'Close to Limit'}
          </div>
        </div>
      </div>

      {/* Category Budgets */}
      <div className="category-budgets-section">
        <div className="section-header">
          <h3>Category-wise Budgets</h3>
          <div className="distribution-buttons">
            <button onClick={openDistributionModal} className="auto-distribute-btn">
              📊 Customize Distribution
            </button>
            <button 
              onClick={() => {
                const defaultPercentages = {
                  food: 30,
                  transport: 15,
                  bills: 20,
                  entertainment: 10,
                  shopping: 10,
                  healthcare: 8,
                  education: 5,
                  other: 2
                };
                const newCategoryBudgets = {};
                Object.keys(defaultPercentages).forEach(category => {
                  newCategoryBudgets[category] = (monthlyBudget * defaultPercentages[category]) / 100;
                });
                setCategoryBudgets(newCategoryBudgets);
                addNotification('Applied default distribution', 'success');
              }}
              className="quick-distribute-btn"
              disabled={monthlyBudget <= 0}
            >
              ⚡ Quick Default
            </button>
          </div>
        </div>

        <div className="category-budgets-grid">
          {Object.keys(categoryBudgets).map(category => {
            const budgeted = categoryBudgets[category] || 0;
            const spent = categorySpending[category] || 0;
            const remaining = budgeted - spent;
            const categoryPercentage = budgeted > 0 ? (spent / budgeted) * 100 : 0;
            const isOverspent = spent > budgeted && budgeted > 0;

            return (
              <div key={category} className={`category-budget-card ${isOverspent ? 'overspent-card' : ''}`}>
                <div className="category-header">
                  <span className="category-name">{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                  <span className="category-status">
                    {isOverspent ? (
                      <span className="overspent">⚠️ Overspent</span>
                    ) : budgeted > 0 ? (
                      <span className="on-track">✓ On Track</span>
                    ) : (
                      <span className="not-set">○ Not Set</span>
                    )}
                  </span>
                </div>

                <div className="category-budget-input">
                  <label>Budget (₹):</label>
                  <input
                    type="number"
                    value={budgeted}
                    onChange={(e) => {
                      const newCategoryBudgets = { ...categoryBudgets };
                      newCategoryBudgets[category] = parseFloat(e.target.value) || 0;
                      setCategoryBudgets(newCategoryBudgets);
                    }}
                    min="0"
                    step="50"
                    placeholder="Set budget"
                    className="category-input"
                  />
                </div>

                <div className="category-spending">
                  <div className="spending-bar">
                    <div 
                      className="spending-fill"
                      style={{ 
                        width: `${Math.min(categoryPercentage, 100)}%`,
                        backgroundColor: isOverspent ? '#e74c3c' : 
                                       categoryPercentage > 80 ? '#f39c12' : '#27ae60'
                      }}
                    ></div>
                  </div>
                  <div className="spending-details">
                    <span>Spent: ₹{spent.toFixed(2)}</span>
                    <span className={isOverspent ? 'negative' : ''}>
                      {isOverspent ? `Overspent: ₹${Math.abs(remaining).toFixed(2)}` : `Remaining: ₹${remaining.toFixed(2)}`}
                    </span>
                  </div>
                </div>
                
                {isOverspent && (
                  <div className="overspent-warning">
                    <small>Exceeds budget by {(categoryPercentage - 100).toFixed(1)}%</small>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Spending Suggestions */}
      {suggestions.length > 0 && (
        <div className="suggestions-section">
          <h3>Spending Suggestions</h3>
          <div className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <div 
                key={index} 
                className={`suggestion-item ${suggestion.severity}`}
              >
                <div className="suggestion-icon">
                  {suggestion.severity === 'high' ? '⚠️' : '💡'}
                </div>
                <div className="suggestion-message">
                  {suggestion.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats from Backend */}
      {stats && (
        <div className="quick-stats">
          <h3>Monthly Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Monthly Budget</span>
              <span className="stat-value">
                ₹{stats.monthlyBudget?.toLocaleString('en-IN') || '0'}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Spent</span>
              <span className="stat-value">
                ₹{stats.totalSpent?.toLocaleString('en-IN') || '0'}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Available</span>
              <span className="stat-value">
                ₹{stats.availableBudget?.toLocaleString('en-IN') || '0'}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Most Spent Category</span>
              <span className="stat-value">
                {stats.mostSpentCategory || 'N/A'}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Daily Average</span>
              <span className="stat-value">
                ₹{stats.avgDailySpent?.toFixed(2) || '0'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Distribution Modal */}
      {showDistributionModal && (
        <div className="modal-overlay">
          <div className="modal-content distribution-modal">
            <div className="modal-header">
              <h3>Customize Budget Distribution</h3>
              <button 
                className="close-button"
                onClick={() => setShowDistributionModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="distribution-summary">
                <p><strong>Monthly Budget:</strong> ₹{monthlyBudget.toLocaleString('en-IN')}</p>
                <p><strong>Current Spending:</strong> ₹{totalSpent.toLocaleString('en-IN')}</p>
                <p><strong>Remaining:</strong> ₹{remainingBudget.toLocaleString('en-IN')}</p>
              </div>
              
              <div className="percentage-controls">
                <h4>Set Category Percentages (Total must be 100%)</h4>
                {Object.keys(categoryPercentages).map(category => {
                  const currentPercent = categoryPercentages[category];
                  const calculatedAmount = (monthlyBudget * currentPercent) / 100;
                  const spentAmount = categorySpending[category] || 0;
                  const isOverspent = spentAmount > calculatedAmount && calculatedAmount > 0;
                  
                  return (
                    <div key={category} className="percentage-control-row">
                      <div className="percentage-label">
                        <span className="category-name">{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                        {isOverspent && <span className="overspent-badge">⚠️ Overspent</span>}
                      </div>
                      
                      <div className="percentage-controls-group">
                        <div className="percentage-input-group">
                          <input
                            type="number"
                            value={currentPercent}
                            onChange={(e) => handlePercentageChange(category, e.target.value)}
                            min="0"
                            max="100"
                            step="1"
                            className="percentage-input"
                          />
                          <span className="percentage-unit">%</span>
                        </div>
                        
                        <div className="calculated-amount">
                          = ₹{calculatedAmount.toFixed(2)}
                        </div>
                        
                        <div className={`spent-indicator ${isOverspent ? 'overspent' : ''}`}>
                          Spent: ₹{spentAmount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                <div className="percentage-total">
                  <span>Total: </span>
                  <strong>{Object.values(categoryPercentages).reduce((sum, val) => sum + val, 0).toFixed(1)}%</strong>
                  <span className="total-validation">
                    {Math.abs(Object.values(categoryPercentages).reduce((sum, val) => sum + val, 0) - 100) > 0.1 ? 
                      '❌ Must be 100%' : '✅ Valid'}
                  </span>
                </div>
              </div>
              
              <div className="modal-actions">
                <button onClick={resetToDefaults} className="secondary-btn">
                  Reset to Defaults
                </button>
                
                <button onClick={applyDistribution} className="primary-btn">
                  Apply Distribution
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      
    </div>
  );
};

export default Budget;