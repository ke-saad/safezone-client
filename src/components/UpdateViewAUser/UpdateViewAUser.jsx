import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./UpdateViewAUser.css";

const UpdateViewAUser = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/users/search?query=${searchQuery}`
        );
        setSearchResults(response.data);
      } catch (error) {
        setError("Failed to fetch users");
      }
    };

    // Fetch users only if searchQuery is not empty
    if (searchQuery !== "") {
      fetchUsers();
    } else {
      // Clear search results if searchQuery is empty
      setSearchResults([]);
      setError("");
    }
  }, [searchQuery]);

  return (
    <div>
      <div className="background-overlay"></div>
      <div className="update-view-user-container">
        <div className="navbar">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/admindashboard" className="nav-link">Dashboard</Link>
          <Link to="/aboutus" className="nav-link">About Us</Link>
        </div>
        <h2 className="search-title">Search User</h2>
        <input
          type="text"
          className="search-input"
          placeholder="Search users by username"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <ul className="user-suggestions">
          {error ? (
            <li className="error-message">{error}</li>
          ) : (
            searchResults.map((user) => (
              <li key={user._id}>
                <Link to={`/userinformation/${user.username}`}>{user.username}</Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default UpdateViewAUser;
