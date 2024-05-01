import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const AddSafeZonePage = () => {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [message, setMessage] = useState("");
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!latitude || !longitude) {
      setMessage("Latitude and longitude are required.");
      return;
    }
    
    try {
      await axios.post("/api/securityzones", {
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      });
      setMessage("Safe zone added successfully.");
      setLatitude("");
      setLongitude("");
    } catch (error) {
      setMessage("Failed to add safe zone.");
      console.error("Error:", error);
    }
  };

  return (
    <div className="add-safe-zone-container">
      <div className="navbar">
        <Link to="/" className="nav-link">
          Home
        </Link>
        <Link to="/aboutus" className="nav-link">
          About Us
        </Link>
      </div>
      <h2>Add Safe Zone</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Latitude:
          <input
            type="text"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
          />
        </label>
        <label>
          Longitude:
          <input
            type="text"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
          />
        </label>
        <button type="submit">Add Safe Zone</button>
      </form>
      {message && <div className="message">{message}</div>}
    </div>
  );
};

export default AddSafeZonePage;
