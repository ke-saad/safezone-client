import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./ViewAllSafeZones.css";

const ViewAllSafeZones = () => {
  const [safeZones, setSafeZones] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSafeZones = async () => {
      try {
        const response = await axios.get("http://localhost:3001/safezones");
        const sortedSafeZones = response.data.sort((a, b) => a.name.localeCompare(b.name)); // Sort safe zones alphabetically by name
        setSafeZones(sortedSafeZones);
      } catch (error) {
        setError("Failed to fetch safe zones");
      }
    };

    fetchSafeZones();
  }, []);

  return (
    <div className="view-all-safe-zones-container">
      <div className="navbar">
        <Link to="/" className="nav-link">
          Home
        </Link>
        <Link to="/admindashboard" className="nav-link">
          Dashboard
        </Link>
        <Link to="/aboutus" className="nav-link">
          About Us
        </Link>
      </div>
      <h2 className="view-all-safe-zones-title">All Safe Zones</h2>
      {error && <div className="error-message">{error}</div>}
      <div className="table-container">
        <table className="safe-zone-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Location</th>
              <th>Capacity</th>
            </tr>
          </thead>
          <tbody>
            {safeZones.map((safeZone) => (
              <tr key={safeZone._id}>
                <td>{safeZone._id}</td>
                <td>{safeZone.name}</td>
                <td>{safeZone.location}</td>
                <td>{safeZone.capacity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="background-image"></div>
    </div>
  );
};

export default ViewAllSafeZones;
