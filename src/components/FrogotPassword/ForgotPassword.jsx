import React from 'react';
import { Link } from 'react-router-dom';
import './ForgotPassword.css'; // Import ForgotPassword CSS file

function ForgotPassword() {
  return (
    <div className="forgot-password-container">
      <h2>Forgot Password</h2>
      <p>Enter your email to reset your password.</p>
      <form>
        <input type="email" placeholder="Email" />
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
}

export default ForgotPassword;
