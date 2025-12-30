import React, { useState, useEffect } from "react";
import {
  FiUser, FiMail, FiCalendar, FiBriefcase, FiSave, FiX,
  FiLock, FiEye, FiEyeOff
} from "react-icons/fi";
import "./Dashboard.css";

const UserProfile = ({ onClose, onUpdate }) => {

  /** ================= LOCAL STORAGE LOAD ================= */
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};

  const [editableUser, setEditableUser] = useState({
    fullName: "",
    age: "",
    gender: "",
    profession: "",
    email: ""
  });

  /** =============== PASSWORD STATES =============== */
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  /** =============== LOAD FROM LOCAL STORAGE =============== */
  useEffect(() => {
    setEditableUser({
      fullName: storedUser.name || "",
      age: storedUser.age || "",
      gender: storedUser.gender || "",
      profession: storedUser.profession || "",
      email: storedUser.emailId || storedUser.email || ""
    });
  }, []);

  /** =============== SAVE PROFILE ================= */
  const handleSave = async () => {
    alert("Nothing to update. Profile information is read-only.");
  };

  /** =============== CHANGE PASSWORD (CORRECTED) =============== */
  const handleChangePassword = async () => {
    setPasswordError("");

    if (!newPassword || !confirmPassword) {
      setPasswordError("Fill all fields");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be 6+ chars");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }

    try {
      const updateRes = await fetch(
        `/users/${editableUser.email}/reset-normal`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: newPassword })
        }
      );

      if (!updateRes.ok) {
        setPasswordError("Password update failed");
        return;
      }

      alert("Password updated!");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordSection(false);

    } catch (err) {
      setPasswordError("Server error");
    }
  };

  /** =============== UI ================= */
  return (
    <div className="user-profile-overlay">
      <div className="user-profile-modal">

        <div className="profile-header">
          <h2>User Profile</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        <div className="profile-content">

          <div className="profile-field">
            <label><FiMail /> Email</label>
            <input type="email" value={editableUser.email} readOnly className="readonly-field" />
          </div>

          <div className="profile-field">
            <label><FiUser /> Full Name</label>
            <input type="text" value={editableUser.fullName} readOnly className="readonly-field" />
          </div>

          <div className="profile-row">
            <div className="profile-field">
              <label><FiCalendar /> Age</label>
              <input type="number" value={editableUser.age} readOnly className="readonly-field" />
            </div>
            <div className="profile-field">
              <label><FiUser /> Gender</label>
              <input type="text" value={editableUser.gender} readOnly className="readonly-field" />
            </div>
          </div>

          <div className="profile-field">
            <label><FiBriefcase /> Profession</label>
            <input type="text" value={editableUser.profession} readOnly className="readonly-field" />
          </div>

          <div className="password-section">
            <button
              type="button"
              className="change-password-toggle"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
            >
              <FiLock size={16} />
              {showPasswordSection ? "Cancel" : "Change Password"}
            </button>

            {showPasswordSection && (
              <div className="password-fields">

                <div className="profile-field">
                  <label><FiLock /> New Password</label>
                  <div className="password-input-container">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="editable-field"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div className="profile-field">
                  <label><FiLock /> Confirm Password</label>
                  <div className="password-input-container">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="editable-field"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                {passwordError && <div className="password-error">{passwordError}</div>}

                <button
                  type="button"
                  className="update-password-btn"
                  onClick={handleChangePassword}
                >
                  Update Password
                </button>

              </div>
            )}
          </div>

        </div>

        

      </div>
    </div>
  );
};

export default UserProfile;
