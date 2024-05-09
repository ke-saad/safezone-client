import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./ViewUpdateSafeZone.css";

const ViewUpdateSafeZone = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [safeZone, setSafeZone] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [message, setMessage] = useState("");

  const fetchSafeZone = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/safezones/${id}`);
      const zone = response.data;
      setSafeZone(zone);
      setMarkers(zone.markers || []);
    } catch (error) {
      setMessage("Failed to fetch safe zone details.");
      console.error("Error:", error);
    }
  };

  const updateSafeZone = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`http://localhost:3001/safezones/${id}`, {
        markers
      });
      setMessage("Safe zone updated successfully.");
      navigate("/viewallsafezones");
    } catch (error) {
      setMessage("Failed to update safe zone.");
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
    if (lat && lng) {
      setMarkers([...markers, { coordinates: [parseFloat(lng), parseFloat(lat)] }]);
    }
  };

  useEffect(() => {
    fetchSafeZone();
  }, [id]);

  return (
    <div className="view-update-safe-zone-container">
      <div className="navbar">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/admindashboard" className="nav-link">Dashboard</Link>
        <Link to="/aboutus" class="nav-link">About Us</Link>
      </div>
      <div className="background-overlay"></div>
      <div className="content">
        <h2 className="title">View / Update Safe Zone</h2>
        {message && <div className="message">{message}</div>}
        {safeZone ? (
          <form onSubmit={updateSafeZone} className="update-safe-zone-form">
            <h3>Markers:</h3>
            <div className="table-container">
              <table className="markers-table">
                <thead>
                  <tr>
                    <th>Latitude</th>
                    <th>Longitude</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {markers.map((marker, index) => (
                    <tr key={index}>
                      <td>{marker.coordinates[1]}</td>
                      <td>{marker.coordinates[0]}</td>
                      <td>
                        <button type="button" className="remove-button" onClick={() => removeMarker(index)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="button-group">
              <button type="button" className="add-button" onClick={addMarker}>Add Marker</button>
              <button type="submit" className="update-button">Update Safe Zone</button>
            </div>
          </form>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
};

export default ViewUpdateSafeZone;
