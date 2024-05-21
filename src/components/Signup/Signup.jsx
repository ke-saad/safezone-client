import React, { useState, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { validatePassword } from "../utils/passwordValidator"; // Import the password validator
import "./Signup.css";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const errorTimeout = useRef(null);
  const successTimeout = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous messages and timeouts
    clearTimeout(errorTimeout.current);
    clearTimeout(successTimeout.current);
    setError("");
    setSuccessMessage("");

    if (!username || !password || !confirmPassword) {
      setError("Username, password, and confirm password are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!validatePassword(password)) {
      setError(
        "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      );
      return;
    }

    try {
      const response = await axios.post("http://localhost:3001/register", {
        username,
        password,
        isAdmin,
      });

      if (response.status === 201) {
        setUsername("");
        setPassword("");
        setConfirmPassword("");
        setIsAdmin(false);
        setSuccessMessage(response.data.message);

        // Clear any previous error messages
        setError("");

        // Set a new timeout for the success message
        successTimeout.current = setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      }
    } catch (error) {
      // Clear any previous success messages
      setSuccessMessage("");

      if (!error.response) {
        setError("Network error, please try again later.");
      } else if (error.response.status === 400) {
        setError(error.response.data.message);
      } else {
        setError("Internal server error");
      }

      // Set a new timeout for the error message
      errorTimeout.current = setTimeout(() => {
        setError("");
      }, 3000);
    }
  };

  return (
    <div className="signup-container">
      <div className="navbar">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/admindashboard" className="nav-link">Dashboard</Link>
        <Link to="/aboutus" className="nav-link">About Us</Link>
      </div>
      <h2 className="signup-title">Add a New User</h2>
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      <form onSubmit={handleSubmit} className="signup-form">
        <input
          type="text"
          className="signup-input"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type={showPassword ? "text" : "password"}
          className="signup-input"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type={showPassword ? "text" : "password"}
          className="signup-input"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <div className="checkbox-container">
          <label>
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            Show Password
          </label>
          <br />
          <input
            type="checkbox"
            id="isAdmin"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
          />
          <label htmlFor="isAdmin">Admin?</label>
        </div>
        <button type="submit" className="signup-button">Add User</button>
      </form>
      <div className="background-overlay"></div>
    </div>
  );
};

export default Signup;
