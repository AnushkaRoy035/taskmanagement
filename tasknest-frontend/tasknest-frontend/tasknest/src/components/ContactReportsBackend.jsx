import React, { useState, useEffect } from 'react';
import { FiMail, FiUserCheck, FiMessageSquare, FiClock, FiCheckCircle, FiXCircle, FiEye, FiTrash2 } from 'react-icons/fi';
import axios from 'axios';
import './ContactReports.css';

const API_CONFIG = {
  BASE_URL: 'http://localhost:8080',
  MESSAGES_ENDPOINT: '/api/contact/messages',
  UPDATE_STATUS_ENDPOINT: '/api/contact/messages',
  DELETE_ENDPOINT: '/api/contact/messages',
  HEALTH_ENDPOINT: '/api/contact/health'
};

const ContactReportsBackend = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [backendStatus, setBackendStatus] = useState('checking');
  const [filter, setFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    responded: 0
  });

  // Create axios instance
  const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  // Check backend health
  const checkBackendHealth = async () => {
    try {
      const response = await api.get(API_CONFIG.HEALTH_ENDPOINT);
      if (response.data.status === 'UP') {
        setBackendStatus('connected');
        return true;
      }
    } catch (error) {
      console.error('Backend health check failed:', error);
      setBackendStatus('disconnected');
      return false;
    }
    return false;
  };

  // Fetch messages from backend
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const isHealthy = await checkBackendHealth();
      
      if (!isHealthy) {
        setError('Backend server is not available. Please ensure the backend is running.');
        setLoading(false);
        return;
      }

      const response = await api.get(API_CONFIG.MESSAGES_ENDPOINT);
      
      if (response.data.success) {
        const messagesData = response.data.data || [];
        setMessages(messagesData);
        
        // Calculate statistics
        const statsData = {
          total: messagesData.length,
          unread: messagesData.filter(msg => !msg.read).length,
          responded: messagesData.filter(msg => msg.responded).length
        };
        setStats(statsData);
        setError('');
      } else {
        setError(response.data.message || 'Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to connect to server. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  // Mark message as read
  const markAsRead = async (messageId) => {
    try {
      const response = await api.put(`${API_CONFIG.UPDATE_STATUS_ENDPOINT}/${messageId}/read`);
      
      if (response.data.success) {
        // Update local state
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, read: true } : msg
        ));
        
        // Update stats
        setStats(prev => ({
          ...prev,
          unread: Math.max(0, prev.unread - 1)
        }));
        
        return true;
      }
    } catch (error) {
      console.error('Error marking as read:', error);
      alert('Failed to mark message as read');
    }
    return false;
  };

  // Mark message as responded
  const markAsResponded = async (messageId) => {
    try {
      const response = await api.put(`${API_CONFIG.UPDATE_STATUS_ENDPOINT}/${messageId}/responded`);
      
      if (response.data.success) {
        // Update local state
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, responded: true } : msg
        ));
        
        // Update stats
        setStats(prev => ({
          ...prev,
          responded: prev.responded + 1
        }));
        
        return true;
      }
    } catch (error) {
      console.error('Error marking as responded:', error);
      alert('Failed to mark message as responded');
    }
    return false;
  };

  // Delete message
  const deleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      const response = await api.delete(`${API_CONFIG.DELETE_ENDPOINT}/${messageId}`);
      
      if (response.data.success) {
        // Remove from local state
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
        
        // Update stats
        const deletedMessage = messages.find(msg => msg.id === messageId);
        if (deletedMessage) {
          setStats(prev => ({
            total: prev.total - 1,
            unread: deletedMessage.read ? prev.unread : Math.max(0, prev.unread - 1),
            responded: deletedMessage.responded ? prev.responded - 1 : prev.responded
          }));
        }
        alert('Message deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter messages
  const filteredMessages = messages.filter(message => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !message.read;
    if (filter === 'read') return message.read;
    if (filter === 'responded') return message.responded;
    if (filter === 'pending') return !message.responded;
    return true;
  });

  // Fetch messages on component mount
  useEffect(() => {
    fetchMessages();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchMessages, 30000);
    return () => clearInterval(interval);
  }, []);

  // Get subject label
  const getSubjectLabel = (subject) => {
    const subjectMap = {
      'general-inquiry': 'General Inquiry',
      'technical-support': 'Technical Support',
      'feature-request': 'Feature Request',
      'bug-report': 'Bug Report',
      'billing-question': 'Billing Question',
      'partnership': 'Partnership Opportunity',
      'feedback': 'Feedback',
      'other': 'Other'
    };
    return subjectMap[subject] || subject;
  };

  // Refresh data
  const handleRefresh = () => {
    fetchMessages();
  };

  // View message details
  const viewMessageDetails = (message) => {
    setSelectedMessage(message);
    // Mark as read when viewing
    if (!message.read) {
      markAsRead(message.id);
    }
  };

  return (
    <div className="contact-reports-container">
      {/* Header */}
      <div className="reports-header">
        <h2>
          <FiMessageSquare /> Contact Reports (Database)
        </h2>
        <div className="header-actions">
          <div className={`backend-status ${backendStatus}`}>
            <span className="status-dot"></span>
            Backend: {backendStatus === 'connected' ? 'Connected' : 'Disconnected'}
          </div>
          <button onClick={handleRefresh} className="refresh-btn">
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="reports-statistics">
        <div className="stat-card">
          <div className="stat-icon total">
            <FiMail />
          </div>
          <div className="stat-content">
            <h3>Total Messages</h3>
            <p>{stats.total}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon unread">
            <FiClock />
          </div>
          <div className="stat-content">
            <h3>Unread</h3>
            <p>{stats.unread}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon responded">
            <FiUserCheck />
          </div>
          <div className="stat-content">
            <h3>Responded</h3>
            <p>{stats.responded}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon pending">
            <FiMessageSquare />
          </div>
          <div className="stat-content">
            <h3>Pending Response</h3>
            <p>{stats.total - stats.responded}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="reports-filters">
        <div className="filter-group">
          <label>Filter by Status:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Messages</option>
            <option value="unread">Unread Only</option>
            <option value="read">Read Only</option>
            <option value="responded">Responded</option>
            <option value="pending">Pending Response</option>
          </select>
        </div>
        
        <div className="filter-info">
          Showing {filteredMessages.length} of {messages.length} messages
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-alert">
          <FiXCircle />
          <span>{error}</span>
          <button onClick={fetchMessages} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading messages from database...</p>
        </div>
      )}

      {/* Messages Table */}
      {!loading && !error && (
        <div className="messages-table-container">
          <table className="messages-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>From</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Subject</th>
                <th>Message</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMessages.map((message) => (
                <tr 
                  key={message.id}
                  className={`message-row ${!message.read ? 'unread' : ''} ${message.responded ? 'responded' : ''}`}
                  onClick={() => viewMessageDetails(message)}
                >
                  <td className="status-cell">
                    <div className="status-indicators">
                      {!message.read && <span className="unread-indicator" title="Unread"></span>}
                      {message.responded && <FiCheckCircle className="responded-icon" title="Responded" />}
                    </div>
                  </td>
                  <td className="sender-cell">
                    <div className="sender-name">{message.name}</div>
                  </td>
                  <td className="email-cell">
                    <a href={`mailto:${message.email}`} onClick={(e) => e.stopPropagation()}>
                      {message.email}
                    </a>
                  </td>
                  <td className="phone-cell">
                    <a href={`tel:${message.phone}`} onClick={(e) => e.stopPropagation()}>
                      {message.phone}
                    </a>
                  </td>
                  <td className="subject-cell">
                    <span className="subject-badge">
                      {getSubjectLabel(message.subject)}
                    </span>
                  </td>
                  <td className="message-preview-cell">
                    <div className="message-preview">
                      {message.message.length > 100 
                        ? `${message.message.substring(0, 100)}...` 
                        : message.message}
                    </div>
                  </td>
                  <td className="date-cell">
                    <div className="date-display">
                      {formatDate(message.createdAt)}
                    </div>
                  </td>
                  <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
                    <div className="action-buttons">
                      {!message.read && (
                        <button 
                          className="action-btn read-btn"
                          onClick={() => markAsRead(message.id)}
                          title="Mark as Read"
                        >
                          <FiEye />
                        </button>
                      )}
                      
                      {!message.responded && (
                        <button 
                          className="action-btn respond-btn"
                          onClick={() => markAsResponded(message.id)}
                          title="Mark as Responded"
                        >
                          <FiCheckCircle />
                        </button>
                      )}
                      
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => deleteMessage(message.id)}
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredMessages.length === 0 && (
            <div className="no-messages">
              <FiMessageSquare />
              <p>No messages found</p>
            </div>
          )}
        </div>
      )}

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="modal-overlay" onClick={() => setSelectedMessage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Message Details</h3>
              <button className="close-btn" onClick={() => setSelectedMessage(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="message-detail">
                <div className="detail-row">
                  <label>From:</label>
                  <span>{selectedMessage.name}</span>
                </div>
                <div className="detail-row">
                  <label>Email:</label>
                  <a href={`mailto:${selectedMessage.email}`}>{selectedMessage.email}</a>
                </div>
                <div className="detail-row">
                  <label>Phone:</label>
                  <a href={`tel:${selectedMessage.phone}`}>{selectedMessage.phone}</a>
                </div>
                <div className="detail-row">
                  <label>Subject:</label>
                  <span className="subject-detail">{getSubjectLabel(selectedMessage.subject)}</span>
                </div>
                <div className="detail-row">
                  <label>Received:</label>
                  <span>{formatDate(selectedMessage.createdAt)}</span>
                </div>
                <div className="detail-row">
                  <label>Status:</label>
                  <div className="status-tags">
                    {!selectedMessage.read && <span className="status-tag unread-tag">Unread</span>}
                    {selectedMessage.read && <span className="status-tag read-tag">Read</span>}
                    {selectedMessage.responded && <span className="status-tag responded-tag">Responded</span>}
                  </div>
                </div>
                <div className="detail-row full-width">
                  <label>Message:</label>
                  <div className="message-content-detail">
                    {selectedMessage.message}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <div className="modal-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => setSelectedMessage(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactReportsBackend;