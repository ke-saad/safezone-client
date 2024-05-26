import React from "react";
import { Link } from "react-router-dom";
import "./NotFound.css"; 

function NotFound() {
  return (
    <div className="not-found-container">
     
      <div className="navbar">
        <Link to="/admindashboard" className="nav-link">Dasboard</Link>
        <Link to="/login" className="nav-link">Login</Link>
      </div>
      
      <div className="center-content">
        <h1>404 - Page Not Found</h1>
        <p>The page you are looking for does not exist.</p>
      </div>
    </div>
  );
}

export default NotFound;
