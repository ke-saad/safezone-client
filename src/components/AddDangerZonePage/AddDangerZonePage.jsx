import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./AddDangerZonePage.css";

const AddDangerZonePage = () => {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [description, setDescription] = useState("");
  const [markers, setMarkers] = useState([]);
  const [message, setMessage] = useState("");

  const addMarker = () => {
    if (!latitude || !longitude || !description) {
      setMessage("Latitude, longitude, and description are required.");
      return;
    }

    const newMarker = {
      coordinates: [parseFloat(longitude), parseFloat(latitude)],
      description: description
    };

    setMarkers([...markers, newMarker]);
    setLatitude("");
    setLongitude("");
    setDescription("");
    setMessage(`Marker added successfully. Total markers: ${markers.length + 1}`);
  };

  const removeMarker = (index) => {
    const updatedMarkers = [...markers];
    updatedMarkers.splice(index, 1);
    setMarkers(updatedMarkers);
    setMessage(`Marker removed. Total markers: ${updatedMarkers.length}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (markers.length !== 10) {
      setMessage("Exactly 10 markers are required to create a danger zone.");
      return;
    }

    try {
      await axios.post("http://localhost:3001/dangerzones/add", { markers });
      setMessage("Danger zone added successfully.");
      setMarkers([]);
    } catch (error) {
      setMessage("Failed to add danger zone.");
      console.error("Error:", error);
    }
  };

  return (
    <div className="add-danger-zone-container">
      <div className="navbar">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/aboutus" className="nav-link">About Us</Link>
      </div>
      <div className="background-overlay"></div>
      <div className="content">
        <h2>Add Danger Zone</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-item">
            <label>Latitude:</label>
            <input
              type="text"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
            />
          </div>
          <div className="input-item">
            <label>Longitude:</label>
            <input
              type="text"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
            />
          </div>
          <div className="input-item">
            <label>Description:</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="button-group">
            <button type="button" className="add-button" onClick={addMarker}>Add Marker</button>
            <button type="submit" className="submit-button">Create Danger Zone</button>
          </div>
        </form>
        {message && <div className="message">{message}</div>}
        <div className="markers-list">
          <h3>Markers ({markers.length}/10)</h3>
          <ul>
            {markers.map((marker, index) => (
              <li key={index}>
                Latitude: {marker.coordinates[1]}, Longitude: {marker.coordinates[0]}, Description: {marker.description}
                <button type="button" className="remove-button" onClick={() => removeMarker(index)}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddDangerZonePage;
