import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import Features from './components/features';
import About from './components/About';
import Contact from './components/Contact';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import Overview from './components/Overview';
import Tasks from './components/Tasks';
import Budget from './components/Budget';
import MoodTracker from './components/MoodTracker';
import Calendar from './components/Calendar';
import Chatbot from './components/Chatbot';
import UserProfile from './components/UserProfile';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import ContactReportsBackend from './components/ContactReportsBackend';
import UserManagementPage from './components/UserManagementPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/features" element={<Features />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Additional routes for individual sections if needed */}
          <Route path="/overview" element={<Overview />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/mood" element={<MoodTracker />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/userprofile" element={<UserProfile />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin-contactreportsbackend" element={<ContactReportsBackend />} />
          <Route path="/admin-usermanagement" element={<UserManagementPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;