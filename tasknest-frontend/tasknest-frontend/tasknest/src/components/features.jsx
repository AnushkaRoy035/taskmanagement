import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiArrowRight } from 'react-icons/fi';
import './HomePage.css';

const Features = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const showBackButton = location.state?.showBackButton;
  const [activeFeature, setActiveFeature] = useState(0);
  const [user, setUser] = useState(null);

  // Check if user is logged in
  useEffect(() => {
    const checkAuthenticationStatus = () => {
      try {
        const userData = localStorage.getItem('user');
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        
        if (userData && isLoggedIn) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        setUser(null);
      }
    };

    checkAuthenticationStatus();
  }, [location]);

  const features = [
    {
      title: "Task Management",
      description: "Organize your tasks with our intuitive drag-and-drop interface. Set priorities, due dates, and reminders.",
      benefits: ["Drag & Drop", "Priority Levels", "Due Date Reminders", "Subtasks"],
      image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
      title: "Budget Planning",
      description: "Track your expenses and income with visual charts. Set budgets and get alerts when you're close to limits.",
      benefits: ["Expense Tracking", "Budget Alerts", "Visual Reports", "Income Management"],
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
      title: "Mood Tracking",
      description: "Monitor your emotional well-being with our daily mood tracker. Identify patterns and triggers.",
      benefits: ["Daily Check-ins", "Mood History", "Pattern Analysis", "Export Data"],
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
      title: "Cross-Platform Sync",
      description: "Access your data from any device. Your information is securely synced across all your devices.",
      benefits: ["Real-time Sync", "End-to-end Encryption", "Multiple Devices", "Offline Access"],
      image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
      title: "Customizable Dashboard",
      description: "Personalize your dashboard with the widgets and information that matter most to you.",
      benefits: ["Widget Library", "Drag & Drop Layout", "Color Themes", "Custom Widgets"],
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    },
    {
      title: "Data Visualization",
      description: "See your progress with beautiful charts and graphs that make understanding your habits easy.",
      benefits: ["Multiple Chart Types", "Export Options", "Custom Reports", "Trend Analysis"],
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
    }
  ];

  const nextFeature = () => {
    setActiveFeature((prev) => (prev + 1) % features.length);
  };

  const prevFeature = () => {
    setActiveFeature((prev) => (prev - 1 + features.length) % features.length);
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  // Function to get user's first name
  const getUserFirstName = () => {
    if (user && user.name) {
      return user.name.split(' ')[0];
    }
    return 'User';
  };

  return (
    <div className="features-page-container">
      {/* Back Button */}
      {showBackButton && (
        <button className="back-button" onClick={() => navigate('/')}>
          <FiArrowLeft /> Back to Home
        </button>
      )}

      <div className="features-page-content">
        <header className="features-header">
          <h1>TaskNest Features</h1>
          <p>Discover how TaskNest helps you organize your life, track your finances, and monitor your well-being</p>
        </header>
        
        {/* Feature Carousel for Mobile */}
        <div className="feature-carousel">
          <div className="carousel-container">
            <div className="carousel-item">
              <div className="carousel-image-container">
                <img 
                  src={features[activeFeature].image} 
                  alt={features[activeFeature].title}
                  className="carousel-image"
                />
              </div>
              <h3>{features[activeFeature].title}</h3>
              <p>{features[activeFeature].description}</p>
              <div className="benefits-list">
                {features[activeFeature].benefits.map((benefit, index) => (
                  <div key={index} className="benefit-item">
                    <FiCheck className="benefit-icon" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="carousel-controls">
              <button onClick={prevFeature} className="carousel-btn">
                <FiArrowRight className="flip" />
              </button>
              <div className="carousel-dots">
                {features.map((_, index) => (
                  <button
                    key={index}
                    className={`dot ${index === activeFeature ? 'active' : ''}`}
                    onClick={() => setActiveFeature(index)}
                  />
                ))}
              </div>
              <button onClick={nextFeature} className="carousel-btn">
                <FiArrowRight />
              </button>
            </div>
          </div>
        </div>
        
        {/* Features Grid for Desktop */}
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-item">
              <div className="feature-image-container">
                <img 
                  src={feature.image} 
                  alt={feature.title}
                  className="feature-image"
                />
              </div>
              <div className="feature-content">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <div className="benefits-list">
                  {feature.benefits.map((benefit, idx) => (
                    <div key={idx} className="benefit-item">
                      <FiCheck className="benefit-icon" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Conditional Call to Action */}
        <div className="features-cta">
          {user ? (
            // Show personalized greeting and dashboard button when user is logged in
            <>
              <h2>Welcome back, {getUserFirstName()}! 👋</h2>
              <p>You're already enjoying TaskNest! Ready to continue organizing your life?</p>
              <div className="cta-buttons">
                <button className="cta-primary" onClick={handleGoToDashboard}>
                  Go to Dashboard
                </button>
              </div>
            </>
          ) : (
            // Show signup CTA when user is not logged in
            <>
              <h2>Ready to Get Started?</h2>
              <p>Join thousands of users who are already organizing their lives with TaskNest</p>
              <div className="cta-buttons">
                <button className="cta-primary" onClick={handleSignUp}>Sign Up Free</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Features;