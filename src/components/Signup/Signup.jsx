import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Signup.css';

const Signup = ({ resetLoginForm }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!username || !password) {
        setError('Username and password are required');
        return;
      }

      await axios.post('http://localhost:3001', { username, password, isAdmin });
      setUsername('');
      setPassword('');
      setError('');
      resetLoginForm();
    } catch (error) {
      setError('Username already exists');
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
      <div className="error-message">{error}</div>
      <form onSubmit={handleSubmit}>
        <input type="text" className="signup-input" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
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
          </label><br></br>
          <input type="checkbox" id="isAdmin" onChange={(e) => setIsAdmin(e.target.checked)} />
          <label htmlFor="isAdmin">Admin?</label>
        </div>
        <button type="submit" className="signup-button">Sign Up</button>
      </form>
      <div className="background-image"></div>
    </div>
  );
};

export default Signup;
