import React from "react";
import { Link } from "react-router-dom";
import "./SafeZoneManagingPage.css";

const SafeZoneManagingPage = () => {
  return (
    <div className="safe-zone-managing-page">
      <div className="navbar">
        <Link to="/aboutus" className="nav-link">
          About Us
        </Link>
        <Link to="/" className="nav-link">
          Logout
        </Link>
      </div>
      <h2>Manage Safe Zones</h2>
      <div className="action-buttons">
        <Link to="/addsafezone " className="action-button">
          Add a Safe Zone
        </Link>
        <Link to="/viewallsafezones" className="action-button">
          View All Safe Zones
        </Link>
        {/* Add more action buttons as needed */}
      </div>
      <div className="background-image"></div>
    </div>
  );
};

export default SafeZoneManagingPage;
