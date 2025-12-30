import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiHome, FiUser, FiCalendar, FiMail, FiLock } from 'react-icons/fi';
import './HomePage.css';

const Signup = () => {

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [profession, setProfession] = useState('');
  const [emailId, setEmailId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigate = useNavigate();

  // VALIDATIONS
  const validateName = (value) => /^[A-Za-z\s]*$/.test(value);
  const validateAge = (value) => /^\d*$/.test(value);
  const validateEmail = (value) => /^[a-z0-9._%+-]+@gmail\.com$/.test(value);

  // SUBMIT FORM
  const handleSignup = async (e) => {
    e.preventDefault();

    if (!name || !age || !gender || !profession || !emailId || !password || !confirmPassword) {
      alert("Fill all fields");
      return;
    }

    if (!validateName(name)) {
      alert("Name must contain only letters.");
      return;
    }

    const ageValue = parseInt(age);
    if (isNaN(ageValue) || ageValue < 5 || ageValue > 125) {
      alert("Age must be between 5 and 125.");
      return;
    }

    if (!validateEmail(emailId)) {
      alert("Enter a valid Gmail address (lowercase).");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    // Convert data to backend format
    const userData = {
      name: name,
      age: ageValue,
      gender,
      profession,
      emailId,
      password,
      confirmPassword
    };

    try {
      const response = await axios.post(
        "/users/signup",
        userData
      );

      alert("Signup successful!");
      navigate("/login");

    } catch (error) {
      if (error.response) {
        alert("Signup failed: " + error.response.data);
      } else {
        alert("Cannot connect to backend.");
      }
    }
  };

  const professionOptions = [
    'Student',
    'Software Developer',
    'Teacher',
    'Doctor',
    'Engineer',
    'Designer',
    'Manager',
    'Accountant',
    'Researcher',
    'Artist',
    'Writer',
    'Entrepreneur',
    'Consultant',
    'Marketing Professional',
    'Sales Representative',
    'Healthcare Worker',
    'Lawyer',
    'Architect',
    'Other'
  ];

  return (
    <div className="signup-page">

      <button className="back-button" onClick={() => navigate('/')}>
        <FiHome />
        Back to Home
      </button>

      <div className="signup-container">
        <div className="auth-box">

          <div className="auth-header">
            <div className="logo">TaskNest</div>
            <h2>Create your account</h2>
            <p>Join thousands organizing their life with TaskNest</p>
          </div>

          <form onSubmit={handleSignup}>

            <div className="form-row">
              <div className="input-group with-icon">
                <FiUser className="input-icon" />
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => validateName(e.target.value) && setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group with-icon">
                <FiCalendar className="input-icon" />
                <input
                  type="number"
                  placeholder="Age"
                  value={age}
                  onChange={(e) => validateAge(e.target.value) && setAge(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                  className="select-input"
                >
                  <option value="">Gender</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <select
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                required
                className="select-input"
              >
                <option value="">Select Profession</option>
                {professionOptions.map((prof, index) => (
                  <option key={index} value={prof}>{prof}</option>
                ))}
              </select>
            </div>

            <div className="input-group with-icon">
              <FiMail className="input-icon" />
              <input
                type="email"
                placeholder="Enter a valid email as it can't be changed later"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value.toLowerCase())}
                required
              />
            </div>

            <div className="form-row">
              <div className="input-group with-icon">
                <FiLock className="input-icon" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="input-group with-icon">
                <FiLock className="input-icon" />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="signup-btn">Create Account</button>

            <p className="login-link">
              Already have an account? <span onClick={() => navigate('/login')}>Sign in</span>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
