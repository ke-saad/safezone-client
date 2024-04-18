import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css'; 
import axios from 'axios';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/login', { username, password });
      const token = response.data.token;
      localStorage.setItem('token', token);
      setError('');
    } catch (error) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="login-container"> 
      <div className="navbar">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/register" className="nav-link">Sign Up</Link>
        <Link to="/aboutus" className="nav-link">About Us</Link>
      </div>
      <h2 className='login-title'>Login</h2> 
      {error && <p style={{ color: '#E72929' }}>{error}</p>} {/* Change color for error message */}
      <form onSubmit={handleSubmit} className="login-form"> {/* Add login-form class */}
        <input type="text" className="login-input" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <br /> {/* Add line break to make form vertical */}
        <input type="password" className="login-input" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <br /> {/* Add line break to make form vertical */}
        <button type="submit" className="login-button">Login</button> 
      </form>
      <Link to="/forgot-password" className="forgot-password-link">Forgot you password? Reset it</Link>
      <div className="background-image"></div>
    </div>
  );
};

export default Login;