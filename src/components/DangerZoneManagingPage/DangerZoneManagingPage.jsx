import React from "react";
import { Link } from "react-router-dom";
import "./DangerZoneManagingPage.css";

const DangerZoneManagingPage = () => {
  return (
    <div className="danger-zone-managing-page">
      <div className="navbar">
        <Link to="/aboutus" className="nav-link">
          About Us
        </Link>
        <Link to="/" className="nav-link">
          Logout
        </Link>
      </div>
      <h2>Manage Danger Zones</h2>
      <div className="action-buttons">
        <Link to="/adddangerzone " className="action-button">
          Add a Danger Zone
        </Link>
        <Link to="/viewalldangerzones" className="action-button">
          View All Danger Zones
        </Link>
        <Link to="/viewupdatedangerzone" className="action-button">
          View / Update a Danger Zone
        </Link>
        {/* Add more action buttons as needed */}
      </div>
      <div className="background-image"></div>
    </div>
  );
};

export default DangerZoneManagingPage;
