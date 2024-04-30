/* UserInformation.jsx */
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "./UserInformation.css";

const UserInformation = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
      const updatedUser = {
        username: newUsername,
        password: newPassword,
        isAdmin: isAdmin,
      };

      const response = await axios.put(`http://localhost:3001/users/${user._id}`, updatedUser);

      setUser(response.data);
      setNewUsername("");
      setNewPassword("");
      setErrorMessage("");
    } catch (error) {
      console.error("Error updating user:", error);
      setErrorMessage("Failed to update user");
    }
  };

  const handleCancel = () => {
    setNewUsername("");
    setNewPassword("");
    setErrorMessage("");
  };

  return (
    <div className="user-information">
      <div className="navbar">
        <Link to="/aboutus">About Us</Link>
        <Link to="/">Logout</Link>
      </div>
      <div className="background-image"></div>
      {user && (
        <div>
          <h2>User Information</h2>
          <p>Username: {user.username}</p>
          <p>Is Admin: {user.isAdmin ? "Yes" : "No"}</p>
          <div>
            <label htmlFor="newUsername">New Username:</label>
            <input
              type="text"
              id="newUsername"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="newPassword">New Password:</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="isAdmin">Is Admin:</label>
            <input
              type="checkbox"
              id="isAdmin"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
            />
          </div>
          <button onClick={handleUpdateUser}>Update User</button>
          <button onClick={handleCancel}>Cancel</button>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
      )}
    </div>
  );
};

export default UserInformation;
