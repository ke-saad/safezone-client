import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./ViewAllSafeZones.css";

const ViewAllSafeZones = () => {
  const [safeZones, setSafeZones] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchSafeZones = async () => {
    try {
      const response = await axios.get("http://localhost:3001/safezones");
      setSafeZones(response.data);
    } catch (error) {
      setError("Failed to fetch safe zones.");
    }
  };

  const deleteSafeZone = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/safezones/${id}`);
      fetchSafeZones(); // Refresh after deletion
    } catch (error) {
      setError("Failed to delete safe zone.");
    }
  };

  const handleEdit = (id) => {
    navigate(`/viewupdatesafezone/${id}`);
  };

  useEffect(() => {
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
              <th>Zone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {safeZones.map((safeZone, index) => (
              <tr key={safeZone._id}>
                <td>Zone {index + 1}</td>
                <td>
                  <button onClick={() => handleEdit(safeZone._id)}>
                    Show complete safe zone information
                  </button>
                  <button onClick={() => handleEdit(safeZone._id)}>Edit</button>
                  <button onClick={() => deleteSafeZone(safeZone._id)}>Delete</button>
                </td>
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
      
