import React, { useState, useEffect } from 'react';
import { FiUsers, FiBarChart2, FiSettings, FiTrendingUp, FiMail, FiFolder, FiDollarSign, FiUserCheck, FiLogOut, FiActivity, FiMessageSquare, FiDatabase, FiPieChart, FiShoppingBag, FiFilter } from 'react-icons/fi';
import './AdminDashboard.css';
import ContactReportsBackend from './ContactReportsBackend';
import UserManagementPage from './UserManagementPage';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('users');
  const [users, setUsers] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);

  // Load data from localStorage on component mount
  useEffect(() => {
    loadUsers();
    loadContactMessages();
  }, []);

  const loadUsers = () => {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    setUsers(storedUsers);
  };

  const loadContactMessages = () => {
    const storedMessages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    setContactMessages(storedMessages);
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    window.location.href = '/login';
  };

  // Reports Section (Contact Us Messages from LocalStorage) with Email Reply
  const ReportsSection = () => {
    const [replyData, setReplyData] = useState({
      messageId: null,
      subject: '',
      replyContent: '',
      recipientEmail: ''
    });
    const [showReplyModal, setShowReplyModal] = useState(false);

    const deleteMessage = (id) => {
      const updatedMessages = contactMessages.filter(msg => msg.id !== id);
      setContactMessages(updatedMessages);
      localStorage.setItem('contactMessages', JSON.stringify(updatedMessages));
    };

    const openReplyModal = (message) => {
      setReplyData({
        messageId: message.id,
        subject: `Re: ${message.subject}`,
        replyContent: '',
        recipientEmail: message.email
      });
      setShowReplyModal(true);
    };

    const closeReplyModal = () => {
      setShowReplyModal(false);
      setReplyData({
        messageId: null,
        subject: '',
        replyContent: '',
        recipientEmail: ''
      });
    };

    const handleReplySubmit = async () => {
      if (!replyData.replyContent.trim()) {
        alert('Please enter a reply message');
        return;
      }

      try {
        const emailData = {
          to: replyData.recipientEmail,
          subject: replyData.subject,
          message: replyData.replyContent,
          timestamp: new Date().toISOString(),
          originalMessageId: replyData.messageId
        };

        const sentEmails = JSON.parse(localStorage.getItem('sentEmails') || '[]');
        sentEmails.push({
          ...emailData,
          id: Date.now(),
          status: 'sent'
        });
        localStorage.setItem('sentEmails', JSON.stringify(sentEmails));

        const updatedMessages = contactMessages.map(msg => 
          msg.id === replyData.messageId 
            ? { ...msg, replied: true, repliedAt: new Date().toISOString() }
            : msg
        );
        setContactMessages(updatedMessages);
        localStorage.setItem('contactMessages', JSON.stringify(updatedMessages));

        alert('Email sent successfully! (Simulated)');
        closeReplyModal();
      } catch (error) {
        console.error('Failed to send email:', error);
        alert('Failed to send email. Please try again.');
      }
    };

    return (
      <div className="admin-section">
        <h2><FiMail /> Contact Reports (LocalStorage)</h2>
        <div className="section-description">
          <p>View and manage contact messages stored in browser localStorage. For database messages, use the "Contact Reports (Database)" section.</p>
        </div>
        
        <div className="messages-stats">
          <div className="stat-card">
            <FiMail className="stat-icon" />
            <div className="stat-info">
              <h3>Total Messages</h3>
              <p>{contactMessages.length}</p>
            </div>
          </div>
          <div className="stat-card">
            <FiUserCheck className="stat-icon" />
            <div className="stat-info">
              <h3>Replied Messages</h3>
              <p>{contactMessages.filter(msg => msg.replied).length}</p>
            </div>
          </div>
        </div>
        
        <div className="messages-container">
          {contactMessages.map((message, index) => (
            <div key={index} className="message-card">
              <div className="message-header">
                <h4>{message.name}</h4>
                <span className="message-email">{message.email}</span>
                <span className="message-subject">{message.subject}</span>
                <span className="message-date">
                  {new Date(message.timestamp).toLocaleDateString()}
                </span>
                {message.replied && (
                  <span className="replied-badge">Replied</span>
                )}
              </div>
              <div className="message-content">
                <p>{message.message}</p>
              </div>
              <div className="message-actions">
                <button 
                  className="reply-btn"
                  onClick={() => openReplyModal(message)}
                >
                  {message.replied ? 'Reply Again' : 'Reply'}
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => deleteMessage(message.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {contactMessages.length === 0 && (
            <div className="no-data">
              <FiMail size={48} />
              <p>No contact messages found in localStorage</p>
              <p className="hint">Messages submitted via contact form will appear here</p>
            </div>
          )}
        </div>

        {/* Reply Modal */}
        {showReplyModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Reply to Message</h3>
                <button className="close-btn" onClick={closeReplyModal}>×</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>To:</label>
                  <input 
                    type="email" 
                    value={replyData.recipientEmail} 
                    readOnly 
                    className="readonly-input"
                  />
                </div>
                <div className="form-group">
                  <label>Subject:</label>
                  <input 
                    type="text" 
                    value={replyData.subject}
                    onChange={(e) => setReplyData(prev => ({ ...prev, subject: e.target.value }))}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Your Reply:</label>
                  <textarea 
                    value={replyData.replyContent}
                    onChange={(e) => setReplyData(prev => ({ ...prev, replyContent: e.target.value }))}
                    placeholder="Type your reply message here..."
                    rows="6"
                    className="form-textarea"
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={closeReplyModal}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleReplySubmit}>
                  Send Email
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Expense Analysis Section
  const ExpenseAnalysis = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'month', 'week', 'today'
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [userFilter, setUserFilter] = useState('all');

    useEffect(() => {
      fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8080/api/expenses');
        if (!response.ok) {
          throw new Error('Failed to fetch expenses');
        }
        const data = await response.json();
        setExpenses(data);
      } catch (error) {
        console.error('Error fetching expenses:', error);
        // Fallback to localStorage if backend fails
        const localExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        setExpenses(localExpenses);
      } finally {
        setLoading(false);
      }
    };

    // Get unique categories from expenses
    const categories = [...new Set(expenses.map(exp => exp.category))].filter(Boolean);
    
    // Get unique users from expenses
    const users = [...new Set(expenses.map(exp => exp.userEmail))].filter(Boolean);

    // Calculate statistics
    const calculateStats = () => {
      let filteredExpenses = [...expenses];

      // Apply time filter
      const now = new Date();
      if (timeFilter === 'month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        filteredExpenses = filteredExpenses.filter(exp => 
          new Date(exp.purchaseDate || exp.date) >= startOfMonth
        );
      } else if (timeFilter === 'week') {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        filteredExpenses = filteredExpenses.filter(exp => 
          new Date(exp.purchaseDate || exp.date) >= startOfWeek
        );
      } else if (timeFilter === 'today') {
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        filteredExpenses = filteredExpenses.filter(exp => 
          new Date(exp.purchaseDate || exp.date) >= startOfDay
        );
      }

      // Apply category filter
      if (categoryFilter !== 'all') {
        filteredExpenses = filteredExpenses.filter(exp => exp.category === categoryFilter);
      }

      // Apply user filter
      if (userFilter !== 'all') {
        filteredExpenses = filteredExpenses.filter(exp => exp.userEmail === userFilter);
      }

      // Calculate category-wise spending
      const categorySpending = {};
      filteredExpenses.forEach(exp => {
        const category = exp.category || 'Uncategorized';
        const amount = parseFloat(exp.amount) || 0;
        categorySpending[category] = (categorySpending[category] || 0) + amount;
      });

      // Calculate user-wise spending
      const userSpending = {};
      filteredExpenses.forEach(exp => {
        const user = exp.userEmail || 'Unknown';
        const amount = parseFloat(exp.amount) || 0;
        userSpending[user] = (userSpending[user] || 0) + amount;
      });

      // Calculate averages
      const totalSpent = filteredExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
      const avgPerTransaction = filteredExpenses.length > 0 
        ? totalSpent / filteredExpenses.length 
        : 0;
      
      // Find most spent category
      let mostSpentCategory = { name: 'None', amount: 0 };
      Object.entries(categorySpending).forEach(([category, amount]) => {
        if (amount > mostSpentCategory.amount) {
          mostSpentCategory = { name: category, amount };
        }
      });

      // Find top spender
      let topSpender = { email: 'None', amount: 0 };
      Object.entries(userSpending).forEach(([user, amount]) => {
        if (amount > topSpender.amount) {
          topSpender = { email: user, amount };
        }
      });

      // Calculate category percentages
      const categoryPercentages = Object.entries(categorySpending).map(([category, amount]) => ({
        category,
        amount,
        percentage: totalSpent > 0 ? (amount / totalSpent * 100).toFixed(1) : 0
      })).sort((a, b) => b.amount - a.amount);

      return {
        totalSpent,
        totalTransactions: filteredExpenses.length,
        avgPerTransaction,
        mostSpentCategory,
        topSpender,
        categorySpending,
        categoryPercentages,
        userSpending,
        filteredExpenses
      };
    };

    const stats = calculateStats();

    if (loading) {
      return (
        <div className="admin-section">
          <h2><FiPieChart /> Expense Analysis</h2>
          <div className="loading">Loading expense data...</div>
        </div>
      );
    }

    return (
      <div className="admin-section">
        <h2><FiPieChart /> Expense Analysis</h2>
        
        <div className="section-description">
          <p>Analyze spending patterns across all users. View category-wise distribution, top spenders, and average spending.</p>
        </div>

        {/* Filters */}
        <div className="expense-filters">
          <div className="filter-group">
            <label><FiFilter /> Time Period:</label>
            <select 
              value={timeFilter} 
              onChange={(e) => setTimeFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Time</option>
              <option value="month">This Month</option>
              <option value="week">This Week</option>
              <option value="today">Today</option>
            </select>
          </div>

          <div className="filter-group">
            <label><FiShoppingBag /> Category:</label>
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label><FiUsers /> User:</label>
            <select 
              value={userFilter} 
              onChange={(e) => setUserFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Users</option>
              {users.map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
          </div>

          <button 
            className="refresh-btn"
            onClick={fetchExpenses}
            title="Refresh data from backend"
          >
            Refresh Data
          </button>
        </div>

        {/* Summary Stats */}
        <div className="expense-summary-stats">
          <div className="stat-card">
            <FiDollarSign className="stat-icon" />
            <div className="stat-info">
              <h3>Total Spent</h3>
              <p className="stat-value">₹{stats.totalSpent.toFixed(2)}</p>
            </div>
          </div>

          <div className="stat-card">
            <FiBarChart2 className="stat-icon" />
            <div className="stat-info">
              <h3>Total Transactions</h3>
              <p className="stat-value">{stats.totalTransactions}</p>
            </div>
          </div>

          <div className="stat-card">
            <FiTrendingUp className="stat-icon" />
            <div className="stat-info">
              <h3>Average per Transaction</h3>
              <p className="stat-value">₹{stats.avgPerTransaction.toFixed(2)}</p>
            </div>
          </div>

          <div className="stat-card highlight">
            <FiShoppingBag className="stat-icon" />
            <div className="stat-info">
              <h3>Most Spent Category</h3>
              <p className="stat-value">{stats.mostSpentCategory.name}</p>
              <p className="stat-sub">₹{stats.mostSpentCategory.amount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Category Analysis */}
        <div className="analysis-section">
          <h3><FiPieChart /> Category-wise Spending</h3>
          <div className="category-analysis">
            {stats.categoryPercentages.map((item, index) => (
              <div key={index} className="category-item">
                <div className="category-header">
                  <span className="category-name">{item.category}</span>
                  <span className="category-amount">₹{item.amount.toFixed(2)} ({item.percentage}%)</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {stats.categoryPercentages.length === 0 && (
              <div className="no-data">
                <p>No expense data found for the selected filters</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Spenders */}
        <div className="analysis-section">
          <h3><FiUsers /> Top Spenders</h3>
          <div className="top-spenders">
            {Object.entries(stats.userSpending)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 10)
              .map(([user, amount], index) => (
                <div key={index} className="spender-item">
                  <div className="spender-rank">{index + 1}</div>
                  <div className="spender-info">
                    <div className="spender-email">{user}</div>
                    <div className="spender-amount">₹{amount.toFixed(2)}</div>
                  </div>
                  <div className="spender-bar">
                    <div 
                      className="spender-fill"
                      style={{ 
                        width: `${(amount / (stats.topSpender.amount || 1)) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            {Object.keys(stats.userSpending).length === 0 && (
              <div className="no-data">
                <p>No user spending data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Expenses Table */}
        <div className="analysis-section">
          <h3><FiActivity /> Recent Expenses</h3>
          <div className="recent-expenses-table">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.filteredExpenses.slice(0, 10).map((expense, index) => (
                  <tr key={index}>
                    <td>{expense.userEmail}</td>
                    <td>{expense.description}</td>
                    <td>
                      <span className="category-badge">{expense.category}</span>
                    </td>
                    <td className="amount-cell">₹{parseFloat(expense.amount).toFixed(2)}</td>
                    <td>{expense.purchaseDate || expense.date}</td>
                  </tr>
                ))}
                {stats.filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan="5" className="no-data-cell">
                      No expenses found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="admin-header">
          <h2><FiSettings /> Admin Dashboard</h2>
        </div>
        
        <nav className="admin-nav">
          <button 
            className={`nav-item ${activeSection === 'users' ? 'active' : ''}`}
            onClick={() => setActiveSection('users')}
          >
            <FiUsers />
            <span>User Management</span>
          </button>
          
          <button 
            className={`nav-item ${activeSection === 'contact-reports' ? 'active' : ''}`}
            onClick={() => setActiveSection('contact-reports')}
          >
            <FiDatabase />
            <span>Contact Reports</span>
          </button>
          
          <button 
            className={`nav-item ${activeSection === 'expense-analysis' ? 'active' : ''}`}
            onClick={() => setActiveSection('expense-analysis')}
          >
            <FiPieChart />
            <span>Expense Analysis</span>
          </button>
        </nav>

        <div className="logout-section">
          <button 
            className="logout-btn"
            onClick={handleLogout}
          >
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      <div className="admin-main">
        {activeSection === 'users' && <UserManagementPage />}
        {activeSection === 'reports' && <ReportsSection />}
        {activeSection === 'contact-reports' && <ContactReportsBackend />}
        {activeSection === 'expense-analysis' && <ExpenseAnalysis />}
      </div>
    </div>
  );
};

export default AdminDashboard;