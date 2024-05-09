import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./ViewAllDangerZones.css";

const ViewAllDangerZones = () => {
  const [dangerZones, setDangerZones] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchDangerZones = async () => {
    try {
      const response = await axios.get("http://localhost:3001/dangerzones");
      setDangerZones(response.data);
    } catch (error) {
      setError("Failed to fetch danger zones.");
    }
  };

  const deleteDangerZone = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/dangerzones/${id}`);
      fetchDangerZones(); // Refresh after deletion
    } catch (error) {
      setError("Failed to delete danger zone.");
    }
  };

  const handleEdit = (id) => {
    navigate(`/viewupdatedangerzone/${id}`);
  };

  useEffect(() => {
    fetchDangerZones();
  }, []);

  return (
    <div className="view-all-danger-zones-container">
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
      <h2 className="view-all-danger-zones-title">All Danger Zones</h2>
      {error && <div className="error-message">{error}</div>}
      <div className="table-container">
        <table className="danger-zone-table">
          <thead>
            <tr>
              <th>Zone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dangerZones.map((dangerZone, index) => (
              <tr key={dangerZone._id}>
                <td>Zone {index + 1}</td>
                <td>
                  <button onClick={() => handleEdit(dangerZone._id)}>
                    Show complete danger zone information
                  </button>
                  <button onClick={() => handleEdit(dangerZone._id)}>Edit</button>
                  <button onClick={() => deleteDangerZone(dangerZone._id)}>Delete</button>
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
      
      export default ViewAllDangerZones;
      
