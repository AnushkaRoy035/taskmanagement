import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Dashboard.css';
import axios from 'axios';
import { FiChevronLeft, FiChevronRight, FiFilter } from 'react-icons/fi';

const Overview = () => {
  const [moodHistory, setMoodHistory] = useState([]);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [budget, setBudget] = useState({ expenses: [], monthlyBudget: 0 });
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  
  // Real-time polling states
  const [isPollingActive] = useState(true);
  const pollingInterval = 5000; // 5 seconds
  const pollingRef = useRef(null);

  // Time range filter states
  const [timeRange, setTimeRange] = useState(6); // Default: last 6 months
  const [selectedStartMonth, setSelectedStartMonth] = useState('');
  const [selectedEndMonth, setSelectedEndMonth] = useState('');
  const [customRangeActive, setCustomRangeActive] = useState(false);

  // Motivational quotes
  const motivationalQuotes = [
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
    "Believe you can and you're halfway there. - Theodore Roosevelt",
    "Your time is limited, don't waste it living someone else's life. - Steve Jobs",
    "The future depends on what you do today. - Mahatma Gandhi",
    "It's not whether you get knocked down, it's whether you get up. - Vince Lombardi",
    "The way to get started is to quit talking and begin doing. - Walt Disney",
    "You are never too old to set another goal or to dream a new dream. - C.S. Lewis",
    "The harder you work for something, the greater you'll feel when you achieve it.",
    "Don't stop when you're tired. Stop when you're done. - Marilyn Monroe"
  ];

  // Helper function to get user email from localStorage
  const getUserEmail = () => {
    const user = localStorage.getItem("user");
    if (!user) return 'unknown@example.com';
    try {
      return JSON.parse(user).emailId || 'unknown@example.com';
    } catch {
      return 'unknown@example.com';
    }
  };

  // Generate month options for dropdowns
  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    // Generate options for the last 24 months
    for (let i = 0; i < 24; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthValue = date.toISOString().slice(0, 7); // YYYY-MM format
      const monthLabel = date.toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      });
      options.push({ value: monthValue, label: monthLabel });
    }
    
    return options;
  };

  // Load mood history from API
  const fetchMoodHistory = async () => {
    try {
      const email = getUserEmail();
      const response = await axios.get(`http://localhost:8080/api/mood?userEmail=${email}`);
      const moodData = response.data.map(entry => ({
        date: entry.day,
        score: parseFloat(entry.score) || 0,
        mood: entry.mood,
        details: entry.details ? JSON.parse(entry.details) : {}
      }));
      setMoodHistory(moodData);
      return moodData;
    } catch (error) {
      console.error('Error fetching mood history:', error);
      setMoodHistory([]);
      return [];
    }
  };

  // Load tasks from API
  const fetchTasks = async () => {
    try {
      const email = getUserEmail();
      const response = await axios.get(`http://localhost:8080/tasks?email=${encodeURIComponent(email)}`, {
        withCredentials: true
      });
      
      if (Array.isArray(response.data)) {
        // Filter out "important date" tasks
        const filteredTasks = response.data.filter(task => 
          task.description !== "important date"
        );
        setTasks(filteredTasks);
        return filteredTasks;
      }
      return [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
      return [];
    }
  };

  // Load budget data from API
  const fetchBudgetData = async () => {
    try {
      const email = getUserEmail();
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      
      // Fetch budget for current month
      const budgetResponse = await axios.get(
        `http://localhost:8080/api/budgets/${email}/${currentMonth}`
      );
      
      // Fetch expenses for the user
      const expensesResponse = await axios.get(
        `http://localhost:8080/api/expenses/user/${email}`
      );
      
      // Filter expenses for current month
      const currentMonthExpenses = expensesResponse.data.filter(expense => {
        if (!expense.purchaseDate) return false;
        const expenseMonth = expense.purchaseDate.substring(0, 7);
        return expenseMonth === currentMonth;
      });
      
      const budgetData = {
        expenses: currentMonthExpenses,
        monthlyBudget: parseFloat(budgetResponse.data.fundsAmount) || 0
      };
      
      setBudget(budgetData);
      return budgetData;
      
    } catch (error) {
      console.error('Error fetching budget data:', error);
      const emptyBudget = { expenses: [], monthlyBudget: 0 };
      setBudget(emptyBudget);
      return emptyBudget;
    }
  };

  // Load all data at once
  const fetchAllData = useCallback(async () => {
    try {
      const email = getUserEmail();
      setUserEmail(email);
      
      await Promise.all([
        fetchMoodHistory(),
        fetchTasks(),
        fetchBudgetData()
      ]);
      
    } catch (error) {
      console.error('Error fetching all data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize polling
  const startPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }
    
    pollingRef.current = setInterval(() => {
      fetchAllData();
    }, pollingInterval);
    
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [pollingInterval, fetchAllData]);

  // Initial load and polling setup
  useEffect(() => {
    fetchAllData();
    startPolling();
    
    // Cleanup on unmount
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [fetchAllData, startPolling]);

  // Initialize custom range dates
  useEffect(() => {
    if (generateMonthOptions().length > 0) {
      const options = generateMonthOptions();
      if (!selectedStartMonth && options.length > 0) {
        setSelectedStartMonth(options[options.length - 1].value); // Oldest
      }
      if (!selectedEndMonth && options.length > 0) {
        setSelectedEndMonth(options[0].value); // Current
      }
    }
  }, []);

  // Rotate quotes every 4 seconds
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length);
    }, 4000);

    return () => clearInterval(quoteInterval);
  }, [motivationalQuotes.length]);

  // Task Statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Recent tasks (pending, sorted by due date)
  const recentPendingTasks = tasks
    .filter(task => !task.completed && task.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  // Expense Statistics
  const expenseCategories = {};
  budget.expenses.forEach(expense => {
    if (expense.category) {
      expenseCategories[expense.category] = (expenseCategories[expense.category] || 0) + parseFloat(expense.amount || 0);
    }
  });

  const mostExpensiveCategory = Object.keys(expenseCategories).length > 0 
    ? Object.keys(expenseCategories).reduce((a, b) => 
        expenseCategories[a] > expenseCategories[b] ? a : b
      )
    : 'No expenses';

  const totalExpenses = budget.expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);

  // Monthly Statistics for Graphs with time range filter
  const getMonthlyData = () => {
    const months = [];
    const currentDate = new Date();
    
    if (customRangeActive && selectedStartMonth && selectedEndMonth) {
      // Custom range logic
      const startDate = new Date(selectedStartMonth + '-01');
      const endDate = new Date(selectedEndMonth + '-01');
      
      // Ensure start is before end
      const actualStart = startDate < endDate ? startDate : endDate;
      const actualEnd = startDate < endDate ? endDate : startDate;
      
      let tempDate = new Date(actualStart);
      
      while (tempDate <= actualEnd) {
        const monthKey = tempDate.toLocaleDateString('en-US', { 
          month: 'short', 
          year: 'numeric' 
        });
        months.push(monthKey);
        tempDate.setMonth(tempDate.getMonth() + 1);
      }
    } else {
      // Fixed time range logic (last N months)
      for (let i = timeRange - 1; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthKey = date.toLocaleDateString('en-US', { 
          month: 'short', 
          year: 'numeric' 
        });
        months.push(monthKey);
      }
    }

    // Calculate data for each month
    const moodData = months.map(month => {
      const monthMoods = moodHistory.filter(mood => {
        const moodDate = new Date(mood.date);
        const moodMonth = moodDate.toLocaleDateString('en-US', { 
          month: 'short', 
          year: 'numeric' 
        });
        return moodMonth === month;
      });
      
      const avgMood = monthMoods.length > 0 
        ? Math.round(monthMoods.reduce((sum, mood) => sum + mood.score, 0) / monthMoods.length)
        : 0;
      
      return avgMood;
    });

    const taskData = months.map(month => {
      const monthTasks = tasks.filter(task => {
        const taskDate = new Date(task.createdAt || task.dueDate || new Date());
        const taskMonth = taskDate.toLocaleDateString('en-US', { 
          month: 'short', 
          year: 'numeric' 
        });
        return taskMonth === month;
      });
      
      const completionRate = monthTasks.length > 0
        ? Math.round((monthTasks.filter(task => task.completed).length / monthTasks.length) * 100)
        : 0;
      
      return completionRate;
    });

    const expenseData = months.map(month => {
      const monthExpenses = budget.expenses.filter(expense => {
        const expenseDate = new Date(expense.purchaseDate || expense.date || new Date());
        const expenseMonth = expenseDate.toLocaleDateString('en-US', { 
          month: 'short', 
          year: 'numeric' 
        });
        return expenseMonth === month;
      });
      
      const totalMonthExpenses = monthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
      const budgetPercentage = budget.monthlyBudget > 0
        ? Math.min(Math.round((totalMonthExpenses / budget.monthlyBudget) * 100), 100)
        : 0;
      
      return budgetPercentage;
    });

    return { months, moodData, taskData, expenseData };
  };

  const monthlyData = getMonthlyData();
  const monthOptions = generateMonthOptions();

  // Calculate bar heights for graph
  const calculateBarHeight = (value) => {
    return Math.max((value / 100) * 120, 10);
  };

  const getBarColor = (value, type) => {
    if (value >= 80) {
      return type === 'mood' ? '#4CAF50' : type === 'task' ? '#2196F3' : '#FF9800';
    }
    if (value >= 60) {
      return type === 'mood' ? '#8BC34A' : type === 'task' ? '#64B5F6' : '#FFB74D';
    }
    if (value >= 40) {
      return type === 'mood' ? '#FFC107' : type === 'task' ? '#90CAF9' : '#FFD54F';
    }
    if (value >= 20) {
      return type === 'mood' ? '#FF9800' : type === 'task' ? '#BBDEFB' : '#FFE082';
    }
    return type === 'mood' ? '#F44336' : type === 'task' ? '#E3F2FD' : '#FFF3E0';
  };

  // Apply custom range
  const applyCustomRange = () => {
    if (!selectedStartMonth || !selectedEndMonth) {
      alert('Please select both start and end months');
      return;
    }
    
    setCustomRangeActive(true);
  };

  // Reset to preset range
  const resetToPreset = (range) => {
    setTimeRange(range);
    setCustomRangeActive(false);
  };

  if (loading) {
    return (
      <div className="overview-container">
        <div className="loading-state">
          <h2>Loading Dashboard...</h2>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="overview-container">
      {/* User Info Header */}
      <div className="user-info-header">
        <h2>Dashboard Overview</h2>
        
      </div>

      {/* First Section: Motivational Quotes */}
      <div className="overview-section quote-section">
        <h2>Daily Motivation</h2>
        <div className="quote-container">
          <div className="quote-text">
            "{motivationalQuotes[currentQuoteIndex]}"
          </div>
          <div className="quote-navigation">
            {motivationalQuotes.map((_, index) => (
              <button
                key={index}
                className={`quote-dot ${index === currentQuoteIndex ? 'active' : ''}`}
                onClick={() => setCurrentQuoteIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Second Section: Task Statistics */}
      <div className="overview-section">
        <h2>Task Management</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{pendingTasks}</div>
            <div className="stat-label">Pending Tasks</div>
            <div className="stat-trend pending">Needs Attention</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{completionRate}%</div>
            <div className="stat-label">Completion Rate</div>
            <div className={`stat-trend ${completionRate >= 70 ? 'positive' : completionRate >= 40 ? 'neutral' : 'negative'}`}>
              {completionRate >= 70 ? 'Excellent' : completionRate >= 40 ? 'Good' : 'Needs Improvement'}
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{totalTasks}</div>
            <div className="stat-label">Total Tasks</div>
            <div className="stat-trend neutral">All Activities</div>
          </div>
        </div>
      </div>

      {/* Third Section: Expenses and Recent Tasks */}
      <div className="overview-section">
        <div className="two-column-layout">
          <div className="column">
            <h2>Expense Analysis</h2>
            <div className="info-card">
              <div className="info-item">
                <span className="info-label">Most Spending:</span>
                <span className="info-value">{mostExpensiveCategory}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Total Expenses:</span>
                <span className="info-value">₹{totalExpenses.toFixed(2)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Monthly Budget:</span>
                <span className="info-value">₹{budget.monthlyBudget.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="column">
            <h2>Upcoming Deadlines</h2>
            <div className="tasks-list">
              {recentPendingTasks.length > 0 ? (
                recentPendingTasks.map(task => (
                  <div key={task.id} className="task-item">
                    <div className="task-title">{task.title}</div>
                    <div className="task-due-date">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                    <div 
                      className={`priority-indicator ${task.priority || 'medium'}`}
                      title={`${task.priority || 'medium'} priority`}
                    ></div>
                  </div>
                ))
              ) : (
                <div className="no-tasks">No upcoming tasks! 🎉</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fourth Section: Monthly Review Graph with Filter */}
      <div className="overview-section">
        <div className="graph-header">
          <h2>Monthly Performance Review</h2>
          
          <div className="time-range-filter">
            <div className="filter-toggle">
              <FiFilter />
              <span>Time Range:</span>
            </div>
            
            <div className="preset-ranges">
              <button 
                className={`range-btn ${!customRangeActive && timeRange === 3 ? 'active' : ''}`}
                onClick={() => resetToPreset(3)}
              >
                Last 3 Months
              </button>
              <button 
                className={`range-btn ${!customRangeActive && timeRange === 6 ? 'active' : ''}`}
                onClick={() => resetToPreset(6)}
              >
                Last 6 Months
              </button>
              <button 
                className={`range-btn ${!customRangeActive && timeRange === 12 ? 'active' : ''}`}
                onClick={() => resetToPreset(12)}
              >
                Last 12 Months
              </button>
              <button 
                className={`range-btn ${customRangeActive ? 'active' : ''}`}
                onClick={() => setCustomRangeActive(!customRangeActive)}
              >
                Custom Range
              </button>
            </div>
          </div>
        </div>

        {/* Custom Range Controls */}
        {customRangeActive && (
          <div className="custom-range-controls">
            <div className="range-selectors">
              <div className="month-selector">
                <label>From:</label>
                <select 
                  value={selectedStartMonth} 
                  onChange={(e) => setSelectedStartMonth(e.target.value)}
                >
                  <option value="">Select Month</option>
                  {monthOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="month-selector">
                <label>To:</label>
                <select 
                  value={selectedEndMonth} 
                  onChange={(e) => setSelectedEndMonth(e.target.value)}
                >
                  <option value="">Select Month</option>
                  {monthOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <button 
                className="apply-range-btn"
                onClick={applyCustomRange}
                disabled={!selectedStartMonth || !selectedEndMonth}
              >
                Apply Range
              </button>
            </div>
            
            {selectedStartMonth && selectedEndMonth && (
              <div className="range-summary">
                Showing data from <strong>
                  {new Date(selectedStartMonth + '-01').toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </strong> to <strong>
                  {new Date(selectedEndMonth + '-01').toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </strong>
                <span className="range-months-count">
                  ({monthlyData.months.length} months)
                </span>
              </div>
            )}
          </div>
        )}
        
        <div className="graph-container">
          <div className="graph-bars">
            {monthlyData.months.length > 0 ? (
              monthlyData.months.map((month, index) => (
                <div key={month} className="bar-group">
                  <div className="bar-label">{month}</div>
                  <div className="bars-container">
                    <div 
                      className="bar mood-bar"
                      style={{
                        height: `${calculateBarHeight(monthlyData.moodData[index])}px`,
                        backgroundColor: getBarColor(monthlyData.moodData[index], 'mood')
                      }}
                      title={`Mood: ${monthlyData.moodData[index]}%`}
                    >
                      <div className="percentage-label">{monthlyData.moodData[index]}%</div>
                    </div>
                    <div 
                      className="bar task-bar"
                      style={{
                        height: `${calculateBarHeight(monthlyData.taskData[index])}px`,
                        backgroundColor: getBarColor(monthlyData.taskData[index], 'task')
                      }}
                      title={`Tasks: ${monthlyData.taskData[index]}%`}
                    >
                      <div className="percentage-label">{monthlyData.taskData[index]}%</div>
                    </div>
                    <div 
                      className="bar expense-bar"
                      style={{
                        height: `${calculateBarHeight(monthlyData.expenseData[index])}px`,
                        backgroundColor: getBarColor(monthlyData.expenseData[index], 'expense')
                      }}
                      title={`Expenses: ${monthlyData.expenseData[index]}%`}
                    >
                      <div className="percentage-label">{monthlyData.expenseData[index]}%</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data-message">
                <p>No data available for selected time range</p>
              </div>
            )}
          </div>
          
          <div className="graph-legend">
            <div className="legend-item">
              <div className="legend-color mood-legend1"></div>
              <span>Mood Score</span>
            </div>
            <div className="legend-item">
              <div className="legend-color task-legend"></div>
              <span>Task Completion</span>
            </div>
            <div className="legend-item">
              <div className="legend-color expense-legend"></div>
              <span>Budget Usage</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;