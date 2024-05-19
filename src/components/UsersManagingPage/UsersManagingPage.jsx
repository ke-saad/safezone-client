import React from "react";
import { Link } from "react-router-dom";
import "./UsersManagingPage.css"; // Import your CSS file

const UsersManagingPage = () => {
  return (
    <div className="user-managing-page">
      <div className="navbar">
        <a href="/aboutus" className="nav-link">
          About Us
        </a>
        <a href="/" className="nav-link">
          Logout
        </a>
      </div>
      <h2 className="page-title">Manage Users</h2>
      <div className="action-buttons">
        <Link to="/register" className="action-button">
          Add a User
        </Link>
        <Link to="/viewallusers" className="action-button">
          View All Users
        </Link>
        <Link to="/updateviewauser" className="action-button">
          View / Update a User
        </Link>
      </div>
      <div className="background-overlay"></div>
    </div>
  );
};

export default UsersManagingPage;
