import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Signup.css';

const Signup = ({ resetLoginForm }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const errorTimeout = useRef(null);
  const successTimeout = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Clear previous messages and timeouts
    clearTimeout(errorTimeout.current);
    clearTimeout(successTimeout.current);
    setError('');
    setSuccessMessage('');
  
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:3001/register', { username, password, isAdmin });
  
      if (response.status === 201) {
        setUsername('');
        setPassword('');
        setIsAdmin(false);
        setSuccessMessage(response.data.message);
  
        // Clear any previous error messages
        setError('');
  
        // Set a new timeout for the success message
        successTimeout.current = setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }
    } catch (error) {
      // Clear any previous success messages
      setSuccessMessage('');
  
      if (!error.response) {
        setError('Network error, please try again later.');
      } else if (error.response.status === 400) {
        setError(error.response.data.message);
      } else {
        setError('Internal server error');
      }
  
      // Set a new timeout for the error message
      errorTimeout.current = setTimeout(() => {
        setError('');
      }, 3000);
    }
  };
  
  

  return (
    <div className="signup-container">
      <div className="navbar">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/login" className="nav-link">Login</Link>
        <Link to="/aboutus" className="nav-link">About Us</Link>
      </div>
      <h2 className="signup-title">Sign Up</h2>
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      <form onSubmit={handleSubmit}>
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
        <div className="checkbox-container">
          <label>
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            Show Password
          </label><br/>
          <input
            type="checkbox"
            id="isAdmin"
            checked={isAdmin}
            onChange={(e) => setIsAdmin(e.target.checked)}
          />
          <label htmlFor="isAdmin">Admin?</label>
        </div>
        <button type="submit" className="signup-button">Sign Up</button>
      </form>
      <div className="background-image"></div>
    </div>
  );
};

export default Signup;
