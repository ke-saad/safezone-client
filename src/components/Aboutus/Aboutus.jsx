import React from 'react';
import { Link } from 'react-router-dom';
import './Aboutus.css'; // Import Aboutus CSS file

function Aboutus() {
  return (
    <div className="aboutus-container">
      <div className="navbar">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/login" className="nav-link">Login</Link>
      </div>
      <div className="aboutus-box">
        <h2 className="aboutus-title">About Us</h2>
        <p className="aboutus-description">
          SafeZone is a dedicated platform focused on ensuring the safety and security of individuals in various environments. Our mission is to provide comprehensive solutions and resources to help people navigate potentially risky situations with confidence and peace of mind.
        </p>
      </div>
      <div className="background-overlay"></div>
    </div>
  );
}

export default Aboutus;
