import React from "react";
import { Link } from "react-router-dom";
import "./AcessDenied.css"; // Import the AcessDenied styles

function AcessDenied() {
  return (
    <div className="access-denied-container">
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
        <h1>403 Forbidden</h1>
      <p>You do not have permission to access this page.</p>
      <p>
        Please <Link to="/login">login</Link> with appropriate credentials or
        contact the administrator for access.
      </p>
      </div>
      <div className="background-image"></div>
    </div>
  );
}

export default AcessDenied;
