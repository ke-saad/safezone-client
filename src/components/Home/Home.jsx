import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css'; 

function Home() {
  return (
    <div className="home-container">
      <div className="navbar">
        <Link to="/login" className="nav-link">Login</Link>
        <Link to="/aboutus" className="nav-link">About Us</Link>
      </div>
      <h2 className="welcome-title">Welcome to SafeZone</h2>
      <marquee className="marquee" behavior="scroll" direction="left" scrollamount="10">
        Your safety matters the most
      </marquee>
      <div className="background-overlay"></div>
    </div>
  );
}

export default Home;
