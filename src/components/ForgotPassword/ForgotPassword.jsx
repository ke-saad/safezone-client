import React from 'react';
import { Link } from 'react-router-dom';
import './ForgotPassword.css'; 

function ForgotPassword() {
  return (
    <div className="forgot-password-container">
      <div className="navbar">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/login" className="nav-link">Login</Link>
      </div>
      <h2>Forgot Password</h2>
      <p>Enter your email to reset your password.</p>
      <form>
        <input type="email" placeholder="Email" />
        <button type="submit">Reset Password</button>
      </form>
      <div className="background-image"></div>
    </div>
  );
}

export default ForgotPassword;
