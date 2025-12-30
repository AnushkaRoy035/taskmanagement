import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiLogOut,
  FiUser,
  FiMoon,
  FiSun,
  FiTrendingUp,
  FiCheck,
  FiDollarSign,
  FiSmile,
  FiCalendar,
  FiUsers
} from 'react-icons/fi';
import './Dashboard.css';

// Components
import Chatbot from './Chatbot';
import Overview from './Overview';
import Tasks from './Tasks';
import Budget from './Budget';
import Expense from './Expense';
import MoodTracker from './MoodTracker';
import Calendar from './Calendar';
import UserProfile from './UserProfile';
import Contact from './Contact';

const Dashboard = () => {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState(
    localStorage.getItem('activeSection') || 'overview'
  );

  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  // State for tasks count
  const [tasksCount, setTasksCount] = useState({
    total: 0,
    pending: 0,
    completed: 0
  });

  const [appData, setAppData] = useState({
    tasks: [],
    moodHistory: [],
    budget: {
      monthlyBudget: 0,
      expenses: [],
      income: [],
      categoryBudgets: {},
      fundHistory: [],
      totalFundsAdded: 0
    },
    userStats: {
      level: 1,
      xp: 0,
      badges: ['level-1']
    }
  });

  /* ================= HELPER ================= */
  const getUserEmail = () => {
    const user = localStorage.getItem("user");
    if (!user) return 'unknown@example.com';
    try {
      return JSON.parse(user).emailId || 'unknown@example.com';
    } catch {
      return 'unknown@example.com';
    }
  };

  /* ================= FETCH TASKS COUNT ================= */
  const fetchTasksCount = async () => {
    try {
      const email = getUserEmail();
      const response = await fetch(`http://localhost:8080/tasks?email=${encodeURIComponent(email)}`, {
        credentials: "include",
      });
      
      if (!response.ok) throw new Error("Failed to fetch tasks");
      
      const tasks = await response.json();
      
      if (Array.isArray(tasks)) {
        // Filter out "important date" tasks
        const filteredTasks = tasks.filter(task => 
          task.description !== "important date"
        );
        
        const total = filteredTasks.length;
        const completed = filteredTasks.filter(task => task.completed).length;
        const pending = total - completed;
        
        setTasksCount({
          total,
          completed,
          pending
        });
        
        // Also update appData.tasks for other components
        setAppData(prev => ({
          ...prev,
          tasks: filteredTasks
        }));
      }
    } catch (error) {
      console.error('Error fetching tasks count:', error);
    }
  };

  /* ================= AUTH ================= */
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const storedUser = localStorage.getItem('user');

    if (isLoggedIn !== 'true' || !storedUser) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(storedUser));
    
    // Fetch tasks count after user is loaded
    fetchTasksCount();
  }, [navigate]);

  /* ================= PERSIST ACTIVE SECTION ================= */
  useEffect(() => {
    localStorage.setItem('activeSection', activeSection);
  }, [activeSection]);

  /* ================= REFRESH TASKS WHEN SWITCHING TO TASKS SECTION ================= */
  useEffect(() => {
    if (activeSection === 'tasks') {
      fetchTasksCount();
    }
  }, [activeSection]);

  /* ================= NOTIFICATIONS ================= */
  const addNotification = (message, type = 'info') => {
    setNotifications(prev => [
      { id: Date.now(), message, type },
      ...prev
    ]);
  };

  /* ================= BUDGET UPDATE ================= */
  const setBudget = (updater) => {
    setAppData(prev => ({
      ...prev,
      budget:
        typeof updater === 'function'
          ? updater(prev.budget)
          : updater
    }));
  };

  /* ================= STORAGE ================= */
  useEffect(() => {
    const saved = localStorage.getItem('appData');
    if (saved) setAppData(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('appData', JSON.stringify(appData));
  }, [appData]);

  /* ================= HANDLE TASKS UPDATE ================= */
  const handleTasksUpdate = () => {
    fetchTasksCount();
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (!user) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <div className={`dashboard ${darkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">TaskNest</div>
        </div>

        <div className="user-info clickable" onClick={() => setShowUserProfile(true)}>
          <div className="user-avatar">
            <FiUser size={24} />
          </div>
          <div className="user-details">
            <div className="user-name">{user.name}</div>
            <div className="user-email">{user.email}</div>
            <div className="user-level">Level {appData.userStats.level}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            onClick={() => setActiveSection('overview')} 
            className={`nav-item ${activeSection === 'overview' ? 'active' : ''}`}
          >
            <FiTrendingUp /> Overview
          </button>

          <button 
            onClick={() => setActiveSection('tasks')} 
            className={`nav-item ${activeSection === 'tasks' ? 'active' : ''}`}
          >
            <div className="nav-item-content">
              <FiCheck /> 
              <span className="nav-text">
                Tasks 
                {tasksCount.pending > 0 && (
                  <span className="pending-count">({tasksCount.pending})</span>
                )}
              </span>
            </div>
          </button>

          <button 
            onClick={() => setActiveSection('budget')} 
            className={`nav-item ${activeSection === 'budget' ? 'active' : ''}`}
          >
            <FiDollarSign /> Budget
          </button>

          <button 
            onClick={() => setActiveSection('expenses')} 
            className={`nav-item ${activeSection === 'expenses' ? 'active' : ''}`}
          >
            <FiTrendingUp /> Expenses
          </button>

          <button 
            onClick={() => setActiveSection('mood')} 
            className={`nav-item ${activeSection === 'mood' ? 'active' : ''}`}
          >
            <FiSmile /> Mood
          </button>

          <button 
            onClick={() => setActiveSection('calendar')} 
            className={`nav-item ${activeSection === 'calendar' ? 'active' : ''}`}
          >
            <FiCalendar /> Calendar
          </button>

          <button 
            onClick={() => setActiveSection('contacts')} 
            className={`nav-item ${activeSection === 'contacts' ? 'active' : ''}`}
          >
            <FiUsers /> Contacts
          </button>
        </nav>

        <div className="sidebar-footer">
          <button onClick={() => setDarkMode(!darkMode)} className="theme-toggle">
            {darkMode ? <FiSun /> : <FiMoon />}
            {darkMode ? 'Light' : 'Dark'}
          </button>

          <button onClick={handleLogout} className="logout-btn">
            <FiLogOut /> Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="main-content">
        {activeSection === 'overview' && <Overview {...appData} />}
        
        {activeSection === 'tasks' && (
          <Tasks 
            tasks={appData.tasks} 
            addNotification={addNotification}
            onTasksUpdate={handleTasksUpdate}
          />
        )}

        {activeSection === 'budget' && (
          <Budget
            budget={appData.budget}
            setBudget={setBudget}
            addNotification={addNotification}
          />
        )}

        {activeSection === 'expenses' && (
          <Expense
            budget={appData.budget}
            setBudget={setBudget}
            addNotification={addNotification}
          />
        )}

        {activeSection === 'mood' && <MoodTracker moodHistory={appData.moodHistory} />}
        
        {activeSection === 'calendar' && <Calendar tasks={appData.tasks} />}
        
        {activeSection === 'contacts' && <Contact />}
      </div>

      {/* Chatbot */}
      <Chatbot />

      {/* User Profile Modal */}
      {showUserProfile && (
        <UserProfile
          user={user}
          onClose={() => setShowUserProfile(false)}
          onUpdate={(u) => {
            setUser(u);
            localStorage.setItem('user', JSON.stringify(u));
          }}
        />
      )}

      {/* Notifications (optional) */}
      {notifications.length > 0 && (
        <div className="notifications-container">
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification notification-${notification.type}`}
              onClick={() => {
                setNotifications(prev => prev.filter(n => n.id !== notification.id));
              }}
            >
              {notification.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;