import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import "./ViewMarkerDetails.css";

const ViewMarkerDetails = () => {
  const { id } = useParams();
  const [marker, setMarker] = useState(null);
  const [message, setMessage] = useState("");

  const fetchMarkerDetails = async () => {
    try {
      const [longitude, latitude] = id.split(',');
      const response = await axios.get(`http://localhost:3001/mapbox/reverse-geocode`, {
        params: { longitude, latitude }
      });
      const data = response.data.features[0];
      if (data) {
        const markerDetails = {
          coordinates: data.geometry.coordinates,
          description: "Retrieved from reverse geocoding",
          place_name: data.place_name,
          timestamp: new Date().toISOString(),
          context: data.context || []
        };
        setMarker(markerDetails);
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
  }, [id]);

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
              <p><strong>Latitude:</strong> {marker.coordinates[1]}</p><br />
              <p><strong>Longitude:</strong> {marker.coordinates[0]}</p><br />
              <p><strong>Description:</strong> {marker.description}</p><br />
              <p><strong>Place Name:</strong> {marker.place_name}</p><br />
              <p><strong>Pinning Date:</strong> {new Date(marker.timestamp).toLocaleString()}</p>
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
