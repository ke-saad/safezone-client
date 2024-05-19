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
      await axios.put(`http://localhost:3001/dangerzones/${id}`, { markers });
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

  const addMarker = async () => {
    const lat = prompt("Enter Latitude:");
    const lng = prompt("Enter Longitude:");
    const description = prompt("Enter Description:");
    if (lat && lng && description) {
      try {
        const response = await axios.get('http://localhost:3001/mapbox/reverse-geocode', {
          params: {
            longitude: lng,
            latitude: lat,
          },
        });
        const placeName = response.data.features[0]?.place_name || "Unknown location";
        setMarkers([...markers, { coordinates: [parseFloat(lng), parseFloat(lat)], description, place_name: placeName }]);
      } catch (error) {
        console.error("Error fetching location name:", error);
      }
    }
  };

  useEffect(() => {
    fetchDangerZone();
  }, [id]);

  return (
    <div className="view-update-danger-zone-container">
      <div className="navbar">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/admindashboard" className="nav-link">Dashboard</Link>
        <Link to="/aboutus" className="nav-link">About Us</Link>
      </div>
      <div className="background-overlay"></div>
      <div className="content">
        <h2 className="title">View / Update Danger Zone</h2>
        {message && <div className="message">{message}</div>}
        {dangerZone ? (
          <form onSubmit={updateDangerZone} className="update-danger-zone-form">
            <h3>Markers:</h3>
            <div className="table-container">
              <table className="markers-table">
                <thead>
                  <tr>
                    <th>Latitude</th>
                    <th>Longitude</th>
                    <th>Description</th>
                    <th>Location</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {markers.map((marker, index) => (
                    <tr key={index}>
                      <td>{marker.coordinates[1]}</td>
                      <td>{marker.coordinates[0]}</td>
                      <td>{marker.description}</td>
                      <td>{marker.place_name || "Unknown location"}</td>
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
              <button type="submit" className="update-button">Update Danger Zone</button>
            </div>
          </form>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
};

export default ViewUpdateDangerZone;