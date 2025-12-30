import React, { useState, useEffect } from 'react';
import { 
  FiUsers, FiSearch, FiEdit2, FiTrash2, FiFilter, 
  FiDownload, FiEye, FiRefreshCw, FiMail, 
  FiUserCheck, FiCalendar, FiActivity 
} from 'react-icons/fi';
import './UserManagement.css';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    profession: '',
    gender: '',
    minAge: '',
    maxAge: '',
    emailDomain: ''
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    age: '',
    gender: '',
    profession: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    byProfession: {},
    byGender: {},
    avgAge: 0
  });
  const [showModal, setShowModal] = useState(false);

  // API Base URL
  const API_BASE = 'http://localhost:8080/api/users';

  // Load all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_BASE);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        setFilteredUsers(data);
        calculateStats(data);
      } else {
        // Handle API error
        throw new Error(`Failed to fetch users: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback to localStorage if API fails
      const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
      setUsers(localUsers);
      setFilteredUsers(localUsers);
      calculateStats(localUsers);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (userList) => {
    const total = userList.length;
    
    // Profession distribution
    const byProfession = {};
    const byGender = {
      'Male': 0,
      'Female': 0,
      'Other': 0
    };
    let totalAge = 0;
    let validAgeCount = 0;
    
    userList.forEach(user => {
      // Profession stats
      const profession = user.profession || 'Not Specified';
      byProfession[profession] = (byProfession[profession] || 0) + 1;
      
      // Gender stats
      const gender = user.gender || 'Other';
      if (byGender[gender] !== undefined) {
        byGender[gender]++;
      } else {
        byGender['Other']++;
      }
      
      // Age calculation - only if age is a valid number
      if (user.age && !isNaN(parseInt(user.age))) {
        totalAge += parseInt(user.age);
        validAgeCount++;
      }
    });
    
    setStats({
      total,
      byProfession,
      byGender,
      avgAge: validAgeCount > 0 ? Math.round(totalAge / validAgeCount) : 0
    });
  };

  // Apply filters
  const applyFilters = () => {
    let result = [...users];
    
    // Search by name or email
    if (searchTerm) {
      result = result.filter(user => 
        (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.emailId && user.emailId.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Profession filter
    if (filters.profession) {
      result = result.filter(user => 
        user.profession && 
        user.profession.toLowerCase() === filters.profession.toLowerCase()
      );
    }
    
    // Gender filter
    if (filters.gender) {
      result = result.filter(user => 
        user.gender && 
        user.gender.toLowerCase() === filters.gender.toLowerCase()
      );
    }
    
    // Age range filter
    if (filters.minAge && !isNaN(parseInt(filters.minAge))) {
      result = result.filter(user => 
        user.age && parseInt(user.age) >= parseInt(filters.minAge)
      );
    }
    
    if (filters.maxAge && !isNaN(parseInt(filters.maxAge))) {
      result = result.filter(user => 
        user.age && parseInt(user.age) <= parseInt(filters.maxAge)
      );
    }
    
    // Email domain filter
    if (filters.emailDomain) {
      result = result.filter(user => 
        user.emailId && 
        user.emailId.toLowerCase().includes(`@${filters.emailDomain.toLowerCase()}`)
      );
    }
    
    setFilteredUsers(result);
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Apply filters when filter state changes
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filters, users]);

  // Handle user deletion
  const deleteUser = async (emailId) => {
    if (window.confirm(`Are you sure you want to delete user: ${emailId}?`)) {
      try {
        const response = await fetch(`${API_BASE}/${emailId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          alert('User deleted successfully');
          fetchUsers(); // Refresh the list
        } else {
          const error = await response.text();
          throw new Error(error || 'Failed to delete user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert(`Failed to delete user: ${error.message}`);
      }
    }
  };

  // Handle user update
  const updateUser = async (emailId, updatedData) => {
    try {
      const response = await fetch(`${API_BASE}/${emailId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        alert('User updated successfully');
        fetchUsers(); // Refresh the list
        setEditMode(false);
        return updatedUser;
      } else {
        const error = await response.text();
        throw new Error(error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert(`Failed to update user: ${error.message}`);
      return null;
    }
  };

  // Handle user view
  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  // Reset password (Admin function)
  const resetUserPassword = async (emailId) => {
    const newPassword = prompt(`Enter new password for ${emailId}:`);
    if (newPassword && newPassword.length >= 6) {
      try {
        const response = await fetch(`${API_BASE}/${emailId}/reset-normal`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ password: newPassword })
        });
        
        if (response.ok) {
          alert('Password reset successfully');
        } else {
          const error = await response.text();
          throw new Error(error || 'Failed to reset password');
        }
      } catch (error) {
        console.error('Error resetting password:', error);
        alert(`Failed to reset password: ${error.message}`);
      }
    } else if (newPassword !== null) {
      alert('Password must be at least 6 characters');
    }
  };

  // Export users to CSV
  const exportToCSV = () => {
    if (filteredUsers.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['Name', 'Email', 'Age', 'Gender', 'Profession'];
    const csvData = filteredUsers.map(user => [
      `"${(user.name || '').replace(/"/g, '""')}"`,
      `"${(user.emailId || '').replace(/"/g, '""')}"`,
      user.age || '',
      `"${(user.gender || '').replace(/"/g, '""')}"`,
      `"${(user.profession || '').replace(/"/g, '""')}"`
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      profession: '',
      gender: '',
      minAge: '',
      maxAge: '',
      emailDomain: ''
    });
  };

  // Render user table
  const renderUserTable = () => (
    <div className="users-table-container">
      <table className="users-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Age</th>
            <th>Gender</th>
            <th>Profession</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user, index) => (
            <tr key={user.emailId || index}>
              <td>{index + 1}</td>
              <td>{user.name || 'N/A'}</td>
              <td>{user.emailId || 'N/A'}</td>
              <td>{user.age || 'N/A'}</td>
              <td>
                <span className={`gender-badge gender-${(user.gender || 'other')?.toLowerCase()}`}>
                  {user.gender || 'N/A'}
                </span>
              </td>
              <td>
                <span className="profession-badge">
                  {user.profession || 'N/A'}
                </span>
              </td>
              <td>
                <div className="action-buttons">
                  <button 
                    className="action-btn view-btn"
                    onClick={() => viewUserDetails(user)}
                    title="View Details"
                  >
                    <FiEye />
                  </button>
                  <button 
                    className="action-btn edit-btn"
                    onClick={() => {
                      setSelectedUser(user);
                      setEditForm({
                        name: user.name || '',
                        age: user.age || '',
                        gender: user.gender || '',
                        profession: user.profession || ''
                      });
                      setEditMode(true);
                    }}
                    title="Edit User"
                  >
                    <FiEdit2 />
                  </button>
                  <button 
                    className="action-btn reset-btn"
                    onClick={() => resetUserPassword(user.emailId)}
                    title="Reset Password"
                    disabled={!user.emailId}
                  >
                    <FiRefreshCw />
                  </button>
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => deleteUser(user.emailId)}
                    title="Delete User"
                    disabled={!user.emailId}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {filteredUsers.length === 0 && !loading && (
        <div className="no-data">
          <FiUsers size={48} />
          <p>No users found</p>
          <button className="btn-secondary" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );

  // Render user grid
  const renderUserGrid = () => (
    <div className="users-grid">
      {filteredUsers.map((user) => (
        <div key={user.emailId} className="user-card">
          <div className="user-card-header">
            <div className="user-avatar">
              {(user.name?.charAt(0) || '?').toUpperCase()}
            </div>
            <div className="user-info">
              <h4>{user.name || 'Unknown User'}</h4>
              <p className="user-email">{user.emailId || 'No email'}</p>
            </div>
          </div>
          <div className="user-card-body">
            <div className="user-detail">
              <span className="detail-label">Age:</span>
              <span className="detail-value">{user.age || 'N/A'}</span>
            </div>
            <div className="user-detail">
              <span className="detail-label">Gender:</span>
              <span className={`detail-value gender-${(user.gender || 'other')?.toLowerCase()}`}>
                {user.gender || 'N/A'}
              </span>
            </div>
            <div className="user-detail">
              <span className="detail-label">Profession:</span>
              <span className="detail-value profession">{user.profession || 'N/A'}</span>
            </div>
          </div>
          <div className="user-card-actions">
            <button 
              className="btn-sm view-btn"
              onClick={() => viewUserDetails(user)}
            >
              <FiEye /> View
            </button>
            <button 
              className="btn-sm edit-btn"
              onClick={() => {
                setSelectedUser(user);
                setEditForm({
                  name: user.name || '',
                  age: user.age || '',
                  gender: user.gender || '',
                  profession: user.profession || ''
                });
                setEditMode(true);
              }}
            >
              <FiEdit2 /> Edit
            </button>
            <button 
              className="btn-sm delete-btn"
              onClick={() => deleteUser(user.emailId)}
              disabled={!user.emailId}
            >
              <FiTrash2 /> Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  // Render edit form
  const renderEditForm = () => (
    <div className="edit-form-container">
      <h3>Edit User: {selectedUser?.emailId || 'Unknown User'}</h3>
      <div className="form-group">
        <label>Full Name:</label>
        <input
          type="text"
          value={editForm.name}
          onChange={(e) => setEditForm({...editForm, name: e.target.value})}
          className="form-input"
          placeholder="Enter full name"
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Age:</label>
          <input
            type="number"
            value={editForm.age}
            onChange={(e) => setEditForm({...editForm, age: e.target.value})}
            className="form-input"
            min="1"
            max="120"
            placeholder="Enter age"
          />
        </div>
        <div className="form-group">
          <label>Gender:</label>
          <select
            value={editForm.gender}
            onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
            className="form-select"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Profession:</label>
        <input
          type="text"
          value={editForm.profession}
          onChange={(e) => setEditForm({...editForm, profession: e.target.value})}
          className="form-input"
          placeholder="e.g., Software Engineer"
        />
      </div>
      <div className="form-actions">
        <button 
          className="btn-secondary"
          onClick={() => setEditMode(false)}
        >
          Cancel
        </button>
        <button 
          className="btn-primary"
          onClick={async () => {
            if (selectedUser?.emailId) {
              const updated = await updateUser(selectedUser.emailId, editForm);
              if (updated) {
                setEditMode(false);
                setSelectedUser(null);
              }
            } else {
              alert('Cannot update: User email is missing');
            }
          }}
          disabled={!selectedUser?.emailId}
        >
          Save Changes
        </button>
      </div>
    </div>
  );

  return (
    <div className="user-management-container">
      {/* Header Section */}
      <div className="management-header">
        <h1><FiUsers /> User Management</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={fetchUsers} disabled={loading}>
            <FiRefreshCw /> Refresh
          </button>
          <button className="btn-secondary" onClick={exportToCSV} disabled={filteredUsers.length === 0}>
            <FiDownload /> Export CSV
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon total-users">
            <FiUsers />
          </div>
          <div className="stat-info">
            <h3>Total Users</h3>
            <p className="stat-number">{stats.total}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon avg-age">
            <FiCalendar />
          </div>
          <div className="stat-info">
            <h3>Average Age</h3>
            <p className="stat-number">{stats.avgAge}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon male-users">
            <FiUserCheck />
          </div>
          <div className="stat-info">
            <h3>Male Users</h3>
            <p className="stat-number">{stats.byGender.Male || 0}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon female-users">
            <FiUserCheck />
          </div>
          <div className="stat-info">
            <h3>Female Users</h3>
            <p className="stat-number">{stats.byGender.Female || 0}</p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            disabled={loading}
          />
          {searchTerm && (
            <button 
              className="clear-search"
              onClick={() => setSearchTerm('')}
              disabled={loading}
            >
              ×
            </button>
          )}
        </div>
        
        <div className="filter-controls">
          <div className="filter-group">
            <label><FiFilter /> Profession:</label>
            <select
              value={filters.profession}
              onChange={(e) => setFilters({...filters, profession: e.target.value})}
              className="filter-select"
              disabled={loading}
            >
              <option value="">All Professions</option>
              {Object.keys(stats.byProfession).map(prof => (
                <option key={prof} value={prof}>
                  {prof} ({stats.byProfession[prof]})
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Gender:</label>
            <select
              value={filters.gender}
              onChange={(e) => setFilters({...filters, gender: e.target.value})}
              className="filter-select"
              disabled={loading}
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Age Range:</label>
            <div className="age-range">
              <input
                type="number"
                placeholder="Min"
                value={filters.minAge}
                onChange={(e) => setFilters({...filters, minAge: e.target.value})}
                className="age-input"
                min="1"
                max="120"
                disabled={loading}
              />
              <span>to</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxAge}
                onChange={(e) => setFilters({...filters, maxAge: e.target.value})}
                className="age-input"
                min="1"
                max="120"
                disabled={loading}
              />
            </div>
          </div>
          
          <button 
            className="clear-filters-btn" 
            onClick={clearFilters}
            disabled={loading}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="view-toggle">
        <button 
          className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
          onClick={() => setViewMode('table')}
          disabled={loading || editMode}
        >
          Table View
        </button>
        <button 
          className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
          onClick={() => setViewMode('grid')}
          disabled={loading || editMode}
        >
          Grid View
        </button>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      ) : editMode ? (
        renderEditForm()
      ) : (
        <>
          <div className="results-summary">
            <p>
              Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> users
              {filteredUsers.length !== users.length && ' (filtered)'}
            </p>
          </div>
          
          {viewMode === 'table' ? renderUserTable() : renderUserGrid()}
        </>
      )}

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>User Details</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="user-details">
                <div className="detail-row">
                  <span className="detail-label">Full Name:</span>
                  <span className="detail-value">{selectedUser.name || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{selectedUser.emailId || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Age:</span>
                  <span className="detail-value">{selectedUser.age || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Gender:</span>
                  <span className="detail-value">{selectedUser.gender || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Profession:</span>
                  <span className="detail-value">{selectedUser.profession || 'N/A'}</span>
                </div>
              </div>
              <div className="modal-actions">
                <button 
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
                <button 
                  className="btn-primary"
                  onClick={() => {
                    setShowModal(false);
                    setEditMode(true);
                    setEditForm({
                      name: selectedUser.name || '',
                      age: selectedUser.age || '',
                      gender: selectedUser.gender || '',
                      profession: selectedUser.profession || ''
                    });
                  }}
                >
                  Edit User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;