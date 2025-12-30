import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiMail, FiLock, FiX, FiArrowRight, FiEye, FiEyeOff, FiShield, FiKey } from 'react-icons/fi';
import './HomePage.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetStep, setResetStep] = useState(1); // 1: email, 2: code, 3: new password
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call for admin authentication
    setTimeout(() => {
      const adminCredentials = {
        email: 'admin@tasknest.com',
        password: 'admin@123'
      };

      const storedAdmin = localStorage.getItem('admin');
      let isValidAdmin = false;

      if (storedAdmin) {
        const admin = JSON.parse(storedAdmin);
        isValidAdmin = admin.email === email && admin.password === password;
      } else {
        isValidAdmin = email === adminCredentials.email && password === adminCredentials.password;
        
        if (isValidAdmin) {
          localStorage.setItem('admin', JSON.stringify(adminCredentials));
        }
      }

      if (isValidAdmin) {
        localStorage.setItem('isAdminLoggedIn', 'true');
        localStorage.setItem('adminUser', JSON.stringify({
          email: email,
          name: 'Administrator',
          role: 'admin'
        }));
        
        alert('Welcome, Administrator!');
        navigate('/admin-dashboard');
      } else {
        alert('Invalid admin credentials. Please try again.');
      }
      setIsLoading(false);
    }, 1500);
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
    setResetStep(1);
    setResetEmail('');
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const closeForgotPassword = () => {
    setShowForgotPassword(false);
    setResetStep(1);
  };

  const sendResetCode = () => {
    if (!resetEmail) {
      alert('Please enter your admin email address');
      return;
    }

    // Check if email exists in stored admin data
    const storedAdmin = localStorage.getItem('admin');
    const hardcodedAdmin = { email: 'admin@tasknest.com', password: 'admin123' };
    
    const adminEmail = storedAdmin 
      ? JSON.parse(storedAdmin).email 
      : hardcodedAdmin.email;

    if (resetEmail !== adminEmail) {
      alert('No admin account found with this email address');
      return;
    }

    // Generate a simple 6-digit reset code (in real app, this would be sent via email)
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem('adminResetCode', resetCode);
    localStorage.setItem('adminResetEmail', resetEmail);
    
    // Set expiration time (10 minutes from now)
    const expirationTime = new Date().getTime() + 10 * 60 * 1000;
    localStorage.setItem('adminResetCodeExpiry', expirationTime.toString());

    alert(`Password reset code sent to ${resetEmail}\nDemo Code: ${resetCode}`);
    setResetStep(2);
  };

  const verifyResetCode = () => {
    if (!resetCode) {
      alert('Please enter the reset code');
      return;
    }

    const storedCode = localStorage.getItem('adminResetCode');
    const storedEmail = localStorage.getItem('adminResetEmail');
    const expiryTime = localStorage.getItem('adminResetCodeExpiry');
    const currentTime = new Date().getTime();

    if (!storedCode || !expiryTime) {
      alert('Reset code not found or expired. Please request a new one.');
      return;
    }

    if (currentTime > parseInt(expiryTime)) {
      alert('Reset code has expired. Please request a new one.');
      localStorage.removeItem('adminResetCode');
      localStorage.removeItem('adminResetCodeExpiry');
      return;
    }

    if (resetCode !== storedCode || resetEmail !== storedEmail) {
      alert('Invalid reset code. Please try again.');
      return;
    }

    setResetStep(3);
  };

  const resetPassword = () => {
    if (!newPassword || !confirmPassword) {
      alert('Please enter and confirm your new password');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('Passwords do not match. Please try again.');
      return;
    }

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    // Update admin password in localStorage
    const storedAdmin = localStorage.getItem('admin');
    const hardcodedAdmin = { email: 'admin@tasknest.com', password: 'admin@123' };
    
    const adminData = storedAdmin 
      ? JSON.parse(storedAdmin) 
      : hardcodedAdmin;

    // Update password
    adminData.password = newPassword;
    localStorage.setItem('admin', JSON.stringify(adminData));

    // Clear reset data
    localStorage.removeItem('adminResetCode');
    localStorage.removeItem('adminResetCodeExpiry');
    localStorage.removeItem('adminResetEmail');

    alert('Password reset successfully! You can now login with your new password.');
    closeForgotPassword();
  };

  const resendResetCode = () => {
    localStorage.removeItem('adminResetCode');
    localStorage.removeItem('adminResetCodeExpiry');
    setResetStep(1);
    alert('Please enter your email again to receive a new code.');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Back Button */}
        <button className="back-home-button" onClick={() => navigate('/')}>
          <FiHome className="button-icon" />
          Back to Home
        </button>
        
        <div className="auth-box admin-auth-box">
          <div className="auth-header">
            <div className="logo admin-logo">
              <FiShield className="admin-icon" />
              TaskNest Admin
            </div>
            <h2>Admin Portal</h2>
            <p>Sign in to access the administration panel</p>
          </div>
          
          <form onSubmit={handleAdminLogin}>
            <div className="input-group">
              <FiMail className="input-icon" />
              <input
                type="email"
                placeholder="Admin email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="input-group">
              <FiLock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Admin password"
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
              className={`admin-login-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In as Admin'}
              <FiArrowRight className="btn-icon" />
            </button>
            
            <p className="signup-link">
              Regular user? <span onClick={() => navigate('/login')}>User login</span>
            </p>
          </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="modal-overlay">
          <div className="modal-content admin-reset-modal">
            <div className="modal-header">
              <h3>Reset Admin Password</h3>
              <button className="close-button" onClick={closeForgotPassword}>
                <FiX size={20} />
              </button>
            </div>

            <div className="modal-body">
              {resetStep === 1 && (
                <div className="reset-step">
                  <FiKey className="step-icon" size={32} />
                  <h4>Enter Admin Email</h4>
                  <p>Enter your admin email address to receive a reset code</p>
                  <div className="input-group">
                    <FiMail className="input-icon" />
                    <input
                      type="email"
                      placeholder="Admin email address"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                    />
                  </div>
                  <button className="reset-btn" onClick={sendResetCode}>
                    Send Reset Code
                  </button>
                </div>
              )}

              {resetStep === 2 && (
                <div className="reset-step">
                  <FiMail className="step-icon" size={32} />
                  <h4>Enter Reset Code</h4>
                  <p>Enter the 6-digit code sent to your email</p>
                  <div className="input-group">
                    <FiKey className="input-icon" />
                    <input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      maxLength={6}
                    />
                  </div>
                  <button className="reset-btn" onClick={verifyResetCode}>
                    Verify Code
                  </button>
                  <p className="resend-link">
                    Didn't receive code? <span onClick={resendResetCode}>Resend</span>
                  </p>
                </div>
              )}

              {resetStep === 3 && (
                <div className="reset-step">
                  <FiLock className="step-icon" size={32} />
                  <h4>Set New Password</h4>
                  <p>Enter your new password</p>
                  <div className="input-group">
                    <FiLock className="input-icon" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button 
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                  <div className="input-group">
                    <FiLock className="input-icon" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button 
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                  <button className="reset-btn" onClick={resetPassword}>
                    Reset Password
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogin;