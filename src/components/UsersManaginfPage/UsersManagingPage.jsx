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
      <h2>Manage users</h2>
      <div className="action-buttons">
        <Link to="/admin/users/add" className="action-button">
          Add a user
        </Link>
        <Link to="/admin/users" className="action-button">
          View all users
        </Link>
        <Link to="/admin/users/get" className="action-button">
          View / update a user
        </Link>
        <Link to="/admin/users" className="action-button">
          Delete a user
        </Link>
        {/* Add more action buttons for other user management actions */}
      </div>
      <div className="background-image"></div>
    </div>
  );
};

export default UsersManagingPage;
