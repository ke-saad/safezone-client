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
  const [showConfirmation, setShowConfirmation] = useState(false); // State to control deletion confirmation modal

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
      // Check if any fields are changed or filled
      if (!newUsername && !newPassword && isAdmin === user.isAdmin) {
        setErrorMessage("Please update at least one field");
        return;
      }

      const updatedUser = {
        ...(newUsername && { username: newUsername }), // Only add username if it's changed or filled
        ...(newPassword && { password: newPassword }), // Only add password if it's changed or filled
        ...(isAdmin !== user.isAdmin && { isAdmin }), // Only add isAdmin if it's changed
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
    setShowConfirmation(false); // Hide confirmation modal after deletion
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="user-information">
      <div className="navbar">
        <Link className="nav-link" to="/aboutus">About Us</Link>
        <Link className="nav-link" to="/">Logout</Link>
      </div>
      <div className="background-image"></div>
      <div className="content">
        {user && (
          <div>
            <h2>User Information</h2>
            <p><label>Username: </label>{user.username}</p><br/><br/>
            <p><label>Administrative privileges: </label>{user.isAdmin ? "Yes" : "No"}</p><br/><br/>
            <div>
              <label htmlFor="newUsername">New Username:</label>
              <input
                type="text"
                id="newUsername"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              /><br/><br/>
            </div>
            <div>
              <label htmlFor="newPassword">New Password:</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              /><br/><br/>
            </div>
            <div>
              <label htmlFor="isAdmin">Administrative privileges:</label>
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
