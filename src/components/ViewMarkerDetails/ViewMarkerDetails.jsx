import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import "./ViewMarkerDetails.css";

const ViewMarkerDetails = () => {
  const { coordinates } = useParams(); // Get coordinates from URL
  const [marker, setMarker] = useState(null);
  const [message, setMessage] = useState("");

  const fetchMarkerDetails = async () => {
    try {
      const [longitude, latitude] = coordinates.split(",");
      const response = await axios.get("http://localhost:3001/mapbox/reverse-geocode", {
        params: { longitude, latitude },
      });
      if (response.data) {
        setMarker(response.data);
      } else {
        setMessage("Failed to fetch marker details.");
      }
    } catch (error) {
      setMessage("Failed to fetch marker details.");
      console.error("Error fetching marker details:", error);
    }
  };

  useEffect(() => {
    fetchMarkerDetails();
  }, [coordinates]);

  return (
    <div className="view-marker-details-container">
      <div className="navbar">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/admindashboard" className="nav-link">Dashboard</Link>
        <Link to="/login" className="nav-link">Log Out</Link>
        <Link to="/map" className="nav-link">Map</Link>
      </div>
      <div className="background-overlay"></div>
      <div className="content">
        {message && <div className="message">{message}</div>}
        {marker ? (
          <div className="marker-details">
            <h3>Location Details:</h3>
            <div className="marker-info">
              <p><strong>Latitude:</strong> {marker.features[0].geometry.coordinates[1]}</p>
              <p><strong>Longitude:</strong> {marker.features[0].geometry.coordinates[0]}</p>
              <p><strong>Description:</strong> {marker.features[0].place_name}</p>
              <p><strong>Context:</strong></p>
              <ul>
                {marker.features[0].context.map((item, index) => (
                  <li key={index}>{item.text} ({item.wikidata || item.id})</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="loading">Loading...</p>
        )}
      </div>
    </div>
  );
};

export default ViewMarkerDetails;
