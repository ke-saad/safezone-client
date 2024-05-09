import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./ViewUpdateDangerZonePage.css";

const ViewUpdateDangerZone = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dangerZone, setDangerZone] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [message, setMessage] = useState("");

  const fetchDangerZone = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/dangerzones/${id}`);
      const zone = response.data;
      setDangerZone(zone);
      setMarkers(zone.markers || []);
    } catch (error) {
      setMessage("Failed to fetch danger zone details.");
      console.error("Error:", error);
    }
  };

  const updateDangerZone = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`http://localhost:3001/dangerzones/${id}`, {
        markers
      });
      setMessage("Danger zone updated successfully.");
      navigate("/viewalldangerzones");
    } catch (error) {
      setMessage("Failed to update danger zone.");
      console.error("Error:", error);
    }
  };

  const removeMarker = (index) => {
    const updatedMarkers = [...markers];
    updatedMarkers.splice(index, 1);
    setMarkers(updatedMarkers);
  };

  const addMarker = () => {
    const lat = prompt("Enter Latitude:");
    const lng = prompt("Enter Longitude:");
    const description = prompt("Enter Description:"); // Prompt for description
    if (lat && lng && description) {
      setMarkers([...markers, { coordinates: [parseFloat(lng), parseFloat(lat)], description }]);
    }
  };

  useEffect(() => {
    fetchDangerZone();
  }, [id]);

  return (
    <div className="view-update-danger-zone-container">
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
      <h2 className="title">View / Update Danger Zone</h2>
      {message && <div className="message">{message}</div>}
      {dangerZone ? (
        <form onSubmit={updateDangerZone} className="update-danger-zone-form">
          <h3>Markers:</h3>
          <ul>
            {markers.map((marker, index) => (
              <li key={index}>
                Latitude: {marker.coordinates[1]}, Longitude: {marker.coordinates[0]}{" "}
                Description: {marker.description} {/* Display description */}
                <button type="button" onClick={() => removeMarker(index)}>Remove</button>
              </li>
            ))}
          </ul>
          <button type="button" onClick={addMarker}>Add Marker</button>
          <button type="submit">Update Danger Zone</button>
        </form>
      ) : (
        <p>Loading...</p>
      )}
      <div className="background-image"></div>
    </div>
  );
};

export default ViewUpdateDangerZone;
