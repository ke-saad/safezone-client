import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTimes, FaMapMarkerAlt, FaTrashAlt, FaMap, FaPlus, FaEdit } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const ViewUpdateDangerZoneModal = ({ isOpen, onClose, zoneId, onSave }) => {
  const [dangerZone, setDangerZone] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [message, setMessage] = useState("");
  const [showAddMarkerDialog, setShowAddMarkerDialog] = useState(false);
  const [addMarkerBy, setAddMarkerBy] = useState("locationName");
  const [locationName, setLocationName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDangerZone = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/dangerzones/${zoneId}`);
        const zone = response.data;
        setDangerZone(zone);
        setMarkers(zone.markers || []);
      } catch (error) {
        setMessage("Failed to fetch danger zone details.");
        console.error("Error:", error);
      }
    };

    if (zoneId && isOpen) {
      fetchDangerZone();
    }
  }, [zoneId, isOpen]);

  const updateDangerZone = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`http://localhost:3001/dangerzones/${zoneId}`, { markers });
      setMessage("Danger zone updated successfully.");
      setTimeout(() => {
        onClose();
        onSave();
      }, 1500);
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
        short_code,
        description // Add description here
      }]);
      setMessage("Marker added successfully.");
      setTimeout(() => setMessage(""), 1500);
    } catch (error) {
      setMessage("Failed to add marker.");
      setTimeout(() => setMessage(""), 1500);
    } finally {
      setShowAddMarkerDialog(false);
      setLocationName("");
      setLatitude("");
      setLongitude("");
      setDescription(""); // Clear the description field
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50 pt-32">
      <div className="w-full max-w-4xl bg-white bg-opacity-90 rounded-lg shadow-lg p-6 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-red-500">
          <FaTimes size={20} />
        </button>
        <h2 className="text-4xl font-bold mb-6 text-gray-900 text-center">Danger Zone Informations</h2>
        {message && <div className="text-center mb-4 text-green-500">{message}</div>}
        {dangerZone ? (
          <form onSubmit={updateDangerZone}>
            <div className="mb-4">
              <h3 className="text-xl font-bold mb-3 text-center">Markers:</h3>
              <div className="max-h-64 overflow-y-auto border border-gray-300 rounded shadow-sm mb-4">
                <table className="w-full border-collapse table-auto">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 p-2 bg-gray-200">Location</th>
                      <th className="border border-gray-300 p-2 bg-gray-200">Description</th>
                      <th className="border border-gray-300 p-2 bg-gray-200">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {markers.map((marker, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 p-2">{marker.place_name || "Unknown location"}</td>
                        <td className="border border-gray-300 p-2">{marker.description}</td>
                        <td className="border border-gray-300 p-2 flex space-x-2 justify-center">
                          <button
                            type="button"
                            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 transition transform hover:scale-105 flex items-center"
                            onClick={() => navigate(`/marker/${marker.coordinates[1]},${marker.coordinates[0]}`)}
                          >
                            <FaMapMarkerAlt className="mr-2" /> View
                          </button>
                          <button
                            type="button"
                            className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700 transition transform hover:scale-105 flex items-center"
                            onClick={() => removeMarker(index)}
                          >
                            <FaTrashAlt className="mr-2" /> Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <button
                type="button"
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 transition transform hover:scale-105 flex items-center"
                onClick={() => setShowAddMarkerDialog(true)}
              >
                <FaPlus className="mr-2" /> Add Marker
              </button>
              <button
                type="submit"
                className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700 transition transform hover:scale-105 flex items-center"
              >
                <FaEdit className="mr-2" /> Update Danger Zone
              </button>
              <button
                type="button"
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 transition transform hover:scale-105 flex items-center"
                onClick={() => navigate(`/map?zoneType=danger&id=${zoneId}`, '_blank')}
              >
                <FaMap className="mr-2" /> View on Map
              </button>
            </div>
          </form>
        ) : (
          <p>Loading...</p>
        )}
        <button
          onClick={onClose}
          className="mt-4 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700 transition transform hover:scale-105 flex items-center"
        >
          <FaTimes className="mr-2" /> Close
        </button>
      </div>
      {showAddMarkerDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h3 className="text-xl mb-3">Add Marker</h3>
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="locationName"
                  checked={addMarkerBy === "locationName"}
                  onChange={() => setAddMarkerBy("locationName")}
                  className="mr-2"
                />
                Add by Location Name
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="coordinates"
                  checked={addMarkerBy === "coordinates"}
                  onChange={() => setAddMarkerBy("coordinates")}
                  className="mr-2"
                />
                Add by Coordinates
              </label>
            </div>
            {addMarkerBy === "locationName" && (
              <div className="input-item mb-4">
                <label className="block mb-1">Location Name:</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            )}
            {addMarkerBy === "coordinates" && (
              <>
                <div className="input-item mb-4">
                  <label className="block mb-1">Latitude:</label>
                  <input
                    type="text"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div className="input-item mb-4">
                  <label className="block mb-1">Longitude:</label>
                  <input
                    type="text"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              </>
            )}
            <div className="input-item mb-4">
              <label className="block mb-1">Description:</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 transition transform hover:scale-105"
                onClick={handleAddMarker}
              >
                <FaPlus className="mr-2" /> Submit
              </button>
              <button
                type="button"
                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700 transition transform hover:scale-105"
                onClick={() => setShowAddMarkerDialog(false)}
              >
                <FaTimes className="mr-2" /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ViewUpdateDangerZoneModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  zoneId: PropTypes.string.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default ViewUpdateDangerZoneModal;
