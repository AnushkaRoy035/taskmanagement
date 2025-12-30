import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiMail, FiPhone, FiMessageSquare, FiCheck, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';
import './HomePage.css';

// API Configuration
const API_CONFIG = {
  BASE_URL: 'http://localhost:8080',
  CONTACT_ENDPOINT: '/api/contact/submit',
  TIMEOUT: 10000, // 10 seconds
};

// Create axios instance with configuration
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

const Contact = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const showBackButton = location.state?.showBackButton;
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  // UI state
  const [errors, setErrors] = useState({});
  const [wordCount, setWordCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({
    type: '', // 'success' | 'error' | ''
    message: '',
    show: false
  });

  // Subject options with labels
  const subjectOptions = [
    { value: '', label: 'Select a subject', disabled: true },
    { value: 'general-inquiry', label: 'General Inquiry' },
    { value: 'technical-support', label: 'Technical Support' },
    { value: 'feature-request', label: 'Feature Request' },
    { value: 'bug-report', label: 'Bug Report' },
    { value: 'billing-question', label: 'Billing Question' },
    { value: 'partnership', label: 'Partnership Opportunity' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'other', label: 'Other' }
  ];

  // Validation functions
  const validators = {
    name: (value) => {
      if (!value.trim()) return "Name is required";
      if (/^[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/.test(value)) 
        return "Name cannot contain only numbers or symbols";
      if (!/^[a-zA-Z\s\-.,'()&@]*$/.test(value)) 
        return "Name contains invalid characters";
      if (value.trim().length < 2) 
        return "Name must be at least 2 characters";
      if (value.trim().length > 100) 
        return "Name cannot exceed 100 characters";
      return "";
    },

    email: (value) => {
      if (!value) return "Email is required";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) 
        return "Please enter a valid email address";
      if (value.length > 100) 
        return "Email cannot exceed 100 characters";
      return "";
    },

    phone: (value) => {
      if (!value.trim()) return "Phone number is required";
      const cleanPhone = value.replace(/[\s\-]/g, '');
      const phoneRegex = /^[\+]?[1-9][\d]{9,14}$/;
      if (!phoneRegex.test(cleanPhone)) 
        return "Please enter a valid phone number (10-15 digits)";
      return "";
    },

    subject: (value) => {
      if (!value) return "Please select a subject";
      return "";
    },

    message: (value) => {
      if (!value.trim()) return "Message is required";
      
      const words = value.trim().split(/\s+/).filter(word => word.length > 0);
      const wordCount = words.length;
      
      if (wordCount > 1000) 
        return `Message exceeds 1000 words limit (current: ${wordCount})`;
      if (value.trim().length > 5000) 
        return "Message cannot exceed 5000 characters";
      return "";
    }
  };

  // Format phone number as user types
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    // Special handling for phone number formatting
    if (name === 'phone') {
      newValue = value;
    }

    // Update word count for message field
    if (name === 'message') {
      const words = value.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
    }

    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Clear field-specific error
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear submit status if user starts typing
    if (submitStatus.show) {
      setSubmitStatus({
        type: '',
        message: '',
        show: false
      });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    // Validate the field
    if (validators[name]) {
      const error = validators[name](value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Validate each field
    Object.keys(formData).forEach(key => {
      if (validators[key]) {
        const error = validators[key](formData[key]);
        if (error) {
          newErrors[key] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = document.querySelector('.error');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Start submission
    setIsSubmitting(true);
    setSubmitStatus({
      type: '',
      message: '',
      show: false
    });

    try {
      // Prepare data for backend
      const submissionData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message.trim()
      };

      // Send to backend
      const response = await api.post(API_CONFIG.CONTACT_ENDPOINT, submissionData);

      if (response.data.success) {
        // Success
        alert('Your message has been sent successfully!');
        setSubmitStatus({
          type: 'success',
          message: 'Thank you for your message! We will get back to you within 24 hours.',
          show: true
        });

        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
        setWordCount(0);
        setErrors({});

        // Hide success message after 8 seconds
        setTimeout(() => {
          setSubmitStatus(prev => ({ ...prev, show: false }));
        }, 8000);

      } else {
        // Backend validation error
        setSubmitStatus({
          type: 'error',
          message: response.data.message || 'Failed to send message. Please try again.',
          show: true
        });
      }

    } catch (error) {
      console.error('Contact form submission error:', error);
      
      let errorMessage = 'Network error. Please check your connection and try again.';
      
      if (error.response) {
        // Server responded with error
        const { data, status } = error.response;
        
        if (status === 400) {
          errorMessage = data.message || 'Please check your information and try again.';
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (data && data.message) {
          errorMessage = data.message;
        }
      } else if (error.request) {
        // Request made but no response
        errorMessage = 'No response from server. Please check your network connection.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timeout. Please try again.';
      }

      setSubmitStatus({
        type: 'error',
        message: errorMessage,
        show: true
      });

    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
    setWordCount(0);
    setErrors({});
    setSubmitStatus({
      type: '',
      message: '',
      show: false
    });
  };

  // Check if form has data
  const hasFormData = Object.values(formData).some(value => value.trim() !== '');

  return (
    <div className="contact-page-container">
      {/* Back Button */}
      {showBackButton && (
        <button 
          className="back-button" 
          onClick={() => navigate('/')}
          disabled={isSubmitting}
        >
          <FiArrowLeft /> Back to Home
        </button>
      )}

      <div className="contact-page-content">
        <h1 className="contact-title">Contact Us</h1>
        
        {/* Hero Section */}
        <div className="contact-hero">
          <div className="contact-hero-content">
            <h2>We're Here to Help</h2>
            <p>Have questions or feedback about TaskNest? Our team is ready to assist you with any inquiries. We typically respond within 24 hours.</p>
            
            {/* Status Indicator */}
            {submitStatus.show && (
              <div className={`status-indicator ${submitStatus.type}`}>
                {submitStatus.type === 'success' ? <FiCheck /> : <FiAlertCircle />}
                <span>{submitStatus.message}</span>
              </div>
            )}
          </div>
          <div className="contact-hero-image">
            <img 
              src="https://images.unsplash.com/photo-1577563908411-5077b6dc7624?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
              alt="Customer support team" 
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="contact-main">
          {/* Contact Information Section */}
          <div className="contact-info-section">
            <div className="contact-info-card">
              <div className="contact-info-header">
                <h2>Get in Touch</h2>
                <p>Reach out to us through any of these channels</p>
              </div>
              
              <div className="contact-details">
                <div className="contact-item">
                  <div className="contact-icon email">
                    <FiMail />
                  </div>
                  <div className="contact-text">
                    <h3>Email</h3>
                    <p>support@tasknest.com</p>
                    <small>For general inquiries and support</small>
                  </div>
                </div>
                
                <div className="contact-item">
                  <div className="contact-icon phone">
                    <FiPhone />
                  </div>
                  <div className="contact-text">
                    <h3>Phone</h3>
                    <p>+91-9876543210</p>
                    <small>Mon-Fri, 9AM-6PM IST</small>
                  </div>
                </div>
                
                <div className="contact-item">
                  <div className="contact-icon response">
                    <FiMessageSquare />
                  </div>
                  <div className="contact-text">
                    <h3>Response Time</h3>
                    <p>Within 24 hours</p>
                    <small>For all email inquiries</small>
                  </div>
                </div>
              </div>
              
              <div className="contact-additional-info">
                <h4>What happens after you submit?</h4>
                <ul>
                  <li>Our team will review your message within 24 hours</li>
                  <li>We'll respond via email or phone based on your preference</li>
                  <li>All conversations are kept confidential</li>
                </ul>
              </div>
              
              <div className="contact-image">
                <img 
                  src="https://images.unsplash.com/photo-1516387938699-a93567ec168e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                  alt="Contact us illustration" 
                />
              </div>
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="contact-form-section">
            <div className="contact-form-card">
              <div className="form-header">
                <h2>Send us a Message</h2>
                <p>Fill out the form below and we'll get back to you as soon as possible.</p>
              </div>
              
              <form onSubmit={handleSubmit} noValidate>
                {/* Name Field */}
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.name ? 'error' : ''}
                    disabled={isSubmitting}
                    autoComplete="name"
                  />
                  {errors.name && (
                    <div className="error-message">
                      <FiAlertCircle /> {errors.name}
                    </div>
                  )}
                </div>
                
                {/* Email Field */}
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.email ? 'error' : ''}
                    disabled={isSubmitting}
                    autoComplete="email"
                  />
                  {errors.email && (
                    <div className="error-message">
                      <FiAlertCircle /> {errors.email}
                    </div>
                  )}
                </div>
                
                {/* Phone Field */}
                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.phone ? 'error' : ''}
                    disabled={isSubmitting}
                    autoComplete="tel"
                  />
                  {errors.phone && (
                    <div className="error-message">
                      <FiAlertCircle /> {errors.phone}
                    </div>
                  )}
                </div>
                
                {/* Subject Field */}
                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.subject ? 'error' : ''}
                    disabled={isSubmitting}
                  >
                    {subjectOptions.map(option => (
                      <option 
                        key={option.value} 
                        value={option.value}
                        disabled={option.disabled}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.subject && (
                    <div className="error-message">
                      <FiAlertCircle /> {errors.subject}
                    </div>
                  )}
                </div>
                
                {/* Message Field */}
                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    placeholder="Please describe your inquiry in detail..."
                    rows="6"
                    value={formData.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.message ? 'error' : ''}
                    disabled={isSubmitting}
                  />
                  <div className="message-meta">
                    <div className="word-count-container">
                      <span className={`word-count ${wordCount > 1000 ? 'error' : ''}`}>
                        
                      </span>
                      {wordCount > 900 && (
                        <span className="word-warning">
                          {wordCount > 1000 ? 'Limit exceeded!' : 'Approaching limit'}
                        </span>
                      )}
                    </div>
                    <div className="character-count">
                      {formData.message.length} / 5000 characters
                    </div>
                  </div>
                  {errors.message && (
                    <div className="error-message">
                      <FiAlertCircle /> {errors.message}
                    </div>
                  )}
                </div>
                
                {/* Form Actions */}
                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={isSubmitting || wordCount > 1000}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner"></span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <FiMessageSquare /> Send Message
                      </>
                    )}
                  </button>
                  
                  {hasFormData && (
                    <button 
                      type="button" 
                      className="clear-btn"
                      onClick={handleClearForm}
                      disabled={isSubmitting}
                    >
                      Clear Form
                    </button>
                  )}
                </div>
                
                {/* Form Footer */}
                <div className="form-footer">
                  <p className="required-note">* Required fields</p>
                  <p className="privacy-note">
                    By submitting this form, you agree to our Privacy Policy. 
                    We will not share your information with third parties.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;