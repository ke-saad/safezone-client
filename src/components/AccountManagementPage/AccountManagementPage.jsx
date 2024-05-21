// src/components/AccountManagementPage/AccountManagementPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AccountManagementPage.css";
import { validatePassword } from "../utils/passwordValidator";

const AccountManagementPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:3001/user/role", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user:", error);
        setErrorMessage("Failed to fetch user");
      }
    };

    fetchUser();
  }, []);

  const handleUpdateUser = async () => {
    try {
      if (!newUsername && !newPassword) {
        setErrorMessage("Please update at least one field");
        return;
      }

      if (newPassword && newPassword !== retypePassword) {
        setErrorMessage("Passwords do not match");
        return;
      }

      if (newPassword && !validatePassword(newPassword)) {
        setErrorMessage("Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
        return;
      }

      const updatedUser = {
        ...(newUsername && { username: newUsername }),
        ...(newPassword && { password: newPassword }),
      };

      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:3001/users/${user._id}`,
        updatedUser,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );

      setUser(response.data);
      setNewUsername("");
      setNewPassword("");
      setRetypePassword("");
      setErrorMessage("");
      setSuccessMessage("User information updated successfully");
    } catch (error) {
      console.error("Error updating user:", error);
      setErrorMessage("Failed to update user");
      setSuccessMessage("");
    }
  };

  const handleCancel = () => {
    setNewUsername("");
    setNewPassword("");
    setRetypePassword("");
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleDeleteConfirmation = () => {
    setShowConfirmation(true);
  };

  const handleDeleteUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `http://localhost:3001/users/${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      setSuccessMessage(response.data.message);
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Error deleting user:", error);
      setErrorMessage("Failed to delete user");
    }
    setShowConfirmation(false);
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="account-management-container">
      <div className="navbar">
        <a className="nav-link" href="/aboutus">About Us</a>
        <span className="nav-link" onClick={() => navigate("/login")}>Logout</span>
      </div>
      <div className="background-overlay"></div>
      <div className="content">
        {user && (
          <div>
            <h2>Account Management</h2>    
            <div className="input-item">
              <label htmlFor="newUsername">New Username:</label>
              <input
                type="text"
                id="newUsername"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
            </div>
            <div className="input-item">
              <label htmlFor="newPassword">New Password:</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="input-item">
              <label htmlFor="retypePassword">Retype Password:</label>
              <input
                type="password"
                id="retypePassword"
                value={retypePassword}
                onChange={(e) => setRetypePassword(e.target.value)}
              />
            </div>
            <div className="button-group">
              <button className="update-button" onClick={handleUpdateUser}>Update User</button>
              <button className="cancel-button" onClick={handleCancel}>Cancel</button>
              <button className="delete-button" onClick={handleDeleteConfirmation}>Delete Account</button>
            </div>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}
          </div>
        )}
      </div>
      {showConfirmation && (
        <div className="confirmation-modal">
          <div className="confirmation-box">
            <p className="confirmation-message">Are you sure you want to delete your account?</p>
            <div className="confirmation-buttons">
              <button onClick={handleDeleteUser}>Yes</button>
              <button onClick={handleCancelDelete}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountManagementPage;
