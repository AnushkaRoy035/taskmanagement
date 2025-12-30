import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiUsers, FiTarget, FiHeart } from 'react-icons/fi';
import './HomePage.css';

const About = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const showBackButton = location.state?.showBackButton;

  return (
    <div className="about-container">
      {/* Back Button */}
      {showBackButton && (
        <button className="back-button" onClick={() => navigate('/')}>
          <FiArrowLeft /> Back to Home
        </button>
      )}

      <div className="about-content">
        <h1 className="about-title">About TaskNest</h1>
        
        <div className="about-hero">
          <div className="about-hero-content">
            <h2>Organize Your Life, One Task at a Time</h2>
            <p>TaskNest helps you manage your tasks, track your budget, and monitor your well-being all in one beautiful, intuitive platform.</p>
          </div>
          <div className="about-hero-image">
            <img 
              src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
              alt="Organized workspace with purple theme" 
            />
          </div>
        </div>

        <div className="about-section mission-section">
          <div className="about-section-content">
            <div className="section-icon">
              <FiTarget />
            </div>
            <h2>Our Mission</h2>
            <p>TaskNest was created with a simple goal: to help people organize their lives in one convenient place. We believe that when your tasks, finances, and well-being are in harmony, you can achieve more and stress less.</p>
          </div>
          <div className="about-section-image">
            <img 
              src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
              alt="Goal setting and mission" 
            />
          </div>
        </div>

        <div className="about-section story-section">
          <div className="about-section-image">
            <img 
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
              alt="Team collaboration" 
            />
          </div>
          <div className="about-section-content">
            <div className="section-icon">
              <FiHeart />
            </div>
            <h2>Our Story</h2>
            <p>Founded in 2023, TaskNest began as a personal project to solve our own organizational challenges. What started as a simple task manager evolved into a comprehensive life organization platform that now helps thousands of users worldwide.</p>
          </div>
        </div>

        <div className="about-section team-section">
          <div className="about-section-content">
            <div className="section-icon">
              <FiUsers />
            </div>
            <h2>The Team</h2>
            <p>We're a small but dedicated team of developers, designers, and productivity enthusiasts passionate about creating tools that make people's lives easier. Based across different time zones, we're united by our commitment to building the best organizational platform available.</p>
          </div>
          <div className="about-section-image">
            <img 
              src="https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
              alt="Our team working together" 
            />
          </div>
        </div>

        <div className="about-values">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">✓</div>
              <h3>Simplicity</h3>
              <p>We believe powerful tools should be intuitive and easy to use.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🛡️</div>
              <h3>Privacy</h3>
              <p>Your data belongs to you. We protect it with industry-leading security.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">💜</div>
              <h3>User-Focused</h3>
              <p>Every feature is designed with our users' needs in mind.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🚀</div>
              <h3>Innovation</h3>
              <p>We continuously improve to bring you the best organizational tools.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;