import React from "react";
import { Link } from "react-router-dom";
import "./NotFound.css"; // Import the NotFound styles

function NotFound() {
  return (
    <div className="not-found-container">
      {" "}
      {/* Add the container class */}
      {/* Navbar */}
      <div className="navbar">
        <Link to="/" className="nav-link">
          Home
        </Link>
        <Link to="/login" className="nav-link">
          Login
        </Link>
        <Link to="/aboutus" className="nav-link">
          About Us
        </Link>
      </div>
      {/* End Navbar */}
      <div className="center-content">
        {" "}
        {/* Center the content */}
        <h1>404 - Page Not Found</h1>
        <p>The page you are looking for does not exist.</p>
      </div>
    </div>
  );
}

export default NotFound;
