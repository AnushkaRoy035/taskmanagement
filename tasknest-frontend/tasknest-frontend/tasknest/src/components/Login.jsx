import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FiHome, FiMail, FiLock, FiX, FiArrowRight,
  FiEye, FiEyeOff, FiKey, FiShield
} from 'react-icons/fi';
import './HomePage.css';

/* ================= AXIOS GLOBAL CONFIG ================= */
axios.defaults.withCredentials = true;

const Login = () => {
  const [emailId, setEmailId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetTokenSent, setResetTokenSent] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const navigate = useNavigate();

  /* ================= LOGIN ================= */
  const handleUserLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        '/users/login',
        { emailId, password },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('user', JSON.stringify(response.data));
        alert('Login successful!');
        navigate('/dashboard');
      } else {
        alert('Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= FORGOT PASSWORD ================= */
  const handleForgotPassword = () => {
    setShowForgotPassword(true);
    setResetEmail('');
    setResetToken('');
    setNewPassword('');
    setConfirmPassword('');
    setResetTokenSent(false);
  };

  const closeForgotPassword = () => {
    setShowForgotPassword(false);
    setResetLoading(false);
  };

  // Step 1: Send reset token
  const sendResetToken = async () => {
    if (!resetEmail) {
      alert('Enter your email');
      return;
    }
    setResetLoading(true);
    try {
      const res = await axios.post('/users/forgot-password', { email: resetEmail });
      alert('Reset token sent! Please check your email.');
      setResetTokenSent(true);
    } catch (error) {
      console.error('Send token error:', error);
      alert('Failed to send reset token');
    } finally {
      setResetLoading(false);
    }
  };

  // Step 2: Submit new password
  const submitNewPassword = async () => {
    if (!resetToken || !newPassword || !confirmPassword) {
      alert('All fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setResetLoading(true);
    try {
      await axios.post('/users/reset-password', {
        email: resetEmail,
        token: resetToken,
        newPassword,
      });

      alert('Password reset successful! Please login.');
      closeForgotPassword();
    } catch (error) {
      console.error('Reset password error:', error);
      alert('Failed to reset password');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">

        <button className="back-home-button" onClick={() => navigate('/')}>
          <FiHome className="button-icon" /> Back to Home
        </button>

        <button
          className="admin-corner-button"
          onClick={() => navigate('/admin-login')}
          title="Admin Login"
        >
          <FiShield className="admin-button-icon" />
          <span>Admin</span>
        </button>

        <div className="auth-box">
          <div className="auth-header">
            <div className="logo">TaskNest</div>
            <h2>Welcome back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleUserLogin}>
            <div className="input-group">
              <FiMail className="input-icon" />
              <input
                type="email"
                placeholder="Enter your email"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value.toLowerCase())}
                required
              />
            </div>

            <div className="input-group">
              <FiLock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>

            <div className="forgot-password-link">
              <span onClick={handleForgotPassword}>Forgot Password?</span>
            </div>

            <button
              type="submit"
              className={`login-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
              <FiArrowRight className="btn-icon" />
            </button>

            <p className="signup-link">
              Don't have an account? <span onClick={() => navigate('/signup')}>Sign up</span>
            </p>
          </form>
        </div>
      </div>

      {/* ================= FORGOT PASSWORD MODAL ================= */}
      {showForgotPassword && (
        <div className="modal-overlay">
          <div className="modal-content user-reset-modal">
            <div className="modal-header">
              <h3>Reset Your Password</h3>
              <button className="close-button" onClick={closeForgotPassword}>
                <FiX size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="reset-step">
                <FiKey className="step-icon" size={32} />
                <h4>Reset Password</h4>

                {!resetTokenSent ? (
                  <>
                    <div className="input-group">
                      <FiMail className="input-icon" />
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value.toLowerCase())}
                      />
                    </div>
                    <button
                      className={`reset-btn ${resetLoading ? 'loading' : ''}`}
                      onClick={sendResetToken}
                      disabled={resetLoading}
                    >
                      {resetLoading ? 'Sending...' : 'Send Reset Token'}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="input-group">
                      <input
                        type="text"
                        placeholder="Enter reset token"
                        value={resetToken}
                        onChange={(e) => setResetToken(e.target.value)}
                      />
                    </div>
                    <div className="input-group">
                      <FiLock className="input-icon" />
                      <input
                        type="password"
                        placeholder="New password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div className="input-group">
                      <FiLock className="input-icon" />
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                    <button
                      className={`reset-btn ${resetLoading ? 'loading' : ''}`}
                      onClick={submitNewPassword}
                      disabled={resetLoading}
                    >
                      {resetLoading ? 'Resetting...' : 'Reset Password'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
