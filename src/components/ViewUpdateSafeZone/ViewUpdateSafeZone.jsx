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
  const [showAddMarkerDialog, setShowAddMarkerDialog] = useState(false);
  const [addMarkerBy, setAddMarkerBy] = useState("locationName");
  const [locationName, setLocationName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

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
      await axios.put(`http://localhost:3001/safezones/${id}`, { markers });
      setMessage("Safe zone updated successfully.");
      setTimeout(() => navigate("/viewallsafezones"), 1500);
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

  const handleAddMarker = async () => {
    let lng, lat;

    if (addMarkerBy === "coordinates") {
      lng = parseFloat(longitude);
      lat = parseFloat(latitude);
    } else {
      try {
        const response = await axios.get('http://localhost:3001/mapbox/forward', {
          params: { q: locationName, limit: 1 }
        });
        const location = response.data.features[0];
        lng = location.geometry.coordinates[0];
        lat = location.geometry.coordinates[1];
      } catch (error) {
        setMessage("Invalid location name.");
        setTimeout(() => setMessage(""), 1500);
        return;
      }
    }

    try {
      const response = await axios.get('http://localhost:3001/mapbox/reverse-geocode', {
        params: { longitude: lng, latitude: lat }
      });
      const placeName = response.data.features[0]?.place_name || "Unknown location";
      const context = response.data.features[0]?.context || [];
      const region_id = context.find(c => c.id.startsWith('region'))?.id || '';
      const country_name = context.find(c => c.id.startsWith('country'))?.text || '';
      const short_code = context.find(c => c.id.startsWith('country'))?.short_code || '';
      setMarkers([...markers, {
        coordinates: [lng, lat],
        place_name: placeName,
        context: context,
        timestamp: new Date().toISOString(),
        region_id,
        country_name,
        short_code
      }]);
      setMessage("Marker added successfully.");
      setTimeout(() => setMessage(""), 1500);
    } catch (error) {
      setMessage("Failed to add marker.");
      setTimeout(() => setMessage(""), 1500);
    } finally {
      setShowAddMarkerDialog(false);
    }
  };

  useEffect(() => {
    fetchSafeZone();
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
        <h2 className="title">View / Update Safe Zone</h2>
        {message && <div className="message">{message}</div>}
        {safeZone ? (
          <form onSubmit={updateSafeZone} className="update-danger-zone-form">
            <h3>Markers:</h3>
            <div className="table-container">
              <table className="markers-table">
                <thead>
                  <tr>
                    <th>Location</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {markers.map((marker, index) => (
                    <tr key={index}>
                      <td>{marker.place_name || "Unknown location"}</td>
                      <td>
                        <button type="button" className="view-button" onClick={() => navigate(`/marker/${marker._id}`)}>View</button>
                        <button type="button" className="remove-button" onClick={() => removeMarker(index)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="button-group">
              <button type="button" className="add-button" onClick={() => setShowAddMarkerDialog(true)}>Add Marker</button>
              <button type="submit" className="update-button">Update Safe Zone</button>
            </div>
          </form>
        ) : (
          <p>Loading...</p>
        )}
      </div>
      {showAddMarkerDialog && (
        <div className="add-marker-dialog">
          <div className="dialog-content">
            <h3>Add Marker</h3>
            <div className="dialog-option">
              <label>
                <input
                  type="radio"
                  value="locationName"
                  checked={addMarkerBy === "locationName"}
                  onChange={() => setAddMarkerBy("locationName")}
                />
                Add by Location Name
              </label>
              <label>
                <input
                  type="radio"
                  value="coordinates"
                  checked={addMarkerBy === "coordinates"}
                  onChange={() => setAddMarkerBy("coordinates")}
                />
                Add by Coordinates
              </label>
            </div>
            {addMarkerBy === "locationName" && (
              <div className="input-item">
                <label>Location Name:</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                />
              </div>
            )}
            {addMarkerBy === "coordinates" && (
              <>
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
              </>
            )}
            <div className="button-group">
              <button type="button" className="dialog-button" onClick={handleAddMarker}>Submit</button>
              <button type="button" className="dialog-button" onClick={() => setShowAddMarkerDialog(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewUpdateSafeZone;
