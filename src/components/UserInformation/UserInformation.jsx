import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./UserInformation.css";

const UserInformation = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/users/username/${userId}`);
        setUser(response.data);
        setIsAdmin(response.data.isAdmin);
      } catch (error) {
        console.error("Error fetching user:", error);
        setErrorMessage("Failed to fetch user");
      }
    };

    fetchUser();
  }, [userId]);

  const handleUpdateUser = async () => {
    try {
      if (!newUsername && !newPassword && isAdmin === user.isAdmin) {
        setErrorMessage("Please update at least one field");
        return;
      }

      const updatedUser = {
        ...(newUsername && { username: newUsername }),
        ...(newPassword && { password: newPassword }),
        ...(isAdmin !== user.isAdmin && { isAdmin }),
      };

      const response = await axios.put(`http://localhost:3001/users/${user._id}`, updatedUser);

      setUser(response.data);
      setNewUsername("");
      setNewPassword("");
      setErrorMessage("");
      setSuccessMessage("User information updated successfully");
    } catch (error) {
      console.error("Error updating user:", error);
      setErrorMessage("Failed to update user");
      setSuccessMessage("");
    }
  };

  const handleCancel = () => {
    setNewUsername(user.username);
    setNewPassword("");
    setIsAdmin(user.isAdmin);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleDeleteConfirmation = () => {
    setShowConfirmation(true);
  };

  const handleDeleteUser = async () => {
    try {
      const response = await axios.delete(`http://localhost:3001/users/${user._id}`);
      setSuccessMessage(response.data.message);
      setUser(null);
      navigate("/users-managing");
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
    <div className="user-information-container">
      <div className="navbar">
        <Link className="nav-link" to="/aboutus">About Us</Link>
        <Link className="nav-link" to="/">Logout</Link>
      </div>
      <div className="background-overlay"></div>
      <div className="content">
        {user && (
          <div>
            <h2>User Information</h2>
            <div className="info-item">
              <label>Username:</label>
              <span>{user.username}</span>
            </div>
            <div className="info-item">
              <label>Administrative Privileges:</label>
              <span>{user.isAdmin ? "Yes" : "No"}</span>
            </div>
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
              <label htmlFor="isAdmin">Administrative Privileges:</label>
              <input
                type="checkbox"
                id="isAdmin"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
              />
            </div>
            <div className="button-group">
              <button className="update-button" onClick={handleUpdateUser}>Update User</button>
              <button className="cancel-button" onClick={handleCancel}>Cancel</button>
              <button className="delete-button" onClick={handleDeleteConfirmation}>Delete User</button>
            </div>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}
          </div>
        )}
      </div>
      {showConfirmation && (
        <div className="confirmation-modal">
          <div className="confirmation-box">
            <p className="confirmation-message">Are you sure you want to delete this user?</p>
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

export default UserInformation;