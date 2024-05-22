import React, { useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { FaPlus, FaCheck, FaTimes, FaTrash } from 'react-icons/fa';

const AddSafeZoneModal = ({ isOpen, onClose, onSave }) => {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [markers, setMarkers] = useState([]);
  const [message, setMessage] = useState("");

  const addMarker = async () => {
    if (!latitude || !longitude) {
      setMessage("Latitude and longitude are required.");
      return;
    }

    try {
      const response = await axios.get("http://localhost:3001/mapbox/reverse-geocode", {
        params: {
          longitude: longitude,
          latitude: latitude
        }
      });
      const placeName = response.data.features[0]?.place_name || "Unknown location";
      const context = response.data.features[0]?.context || [];

      const newMarker = {
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
        place_name: placeName,
        context: context,
        timestamp: new Date().toISOString()
      };

      setMarkers([...markers, newMarker]);
      setLatitude("");
      setLongitude("");
      setMessage(`Marker added successfully. Total markers: ${markers.length + 1}`);
    } catch (error) {
      setMessage("Failed to fetch location details.");
      console.error("Error:", error);
    }
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
      setMessage("Exactly 10 markers are required to create a safe zone.");
      return;
    }

    try {
      await axios.post("http://localhost:3001/safezones/add", { markers });
      setMessage("Safe zone added successfully.");
      setMarkers([]);
      onSave();
    } catch (error) {
      setMessage("Failed to add safe zone.");
      console.error("Error:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50 pt-32"> {/* Remplace mt-16 par pt-16 */}
      <div className="w-full max-w-xl bg-white bg-opacity-90 rounded-lg shadow-lg p-6">
        <h2 className="text-4xl font-bold mb-6 text-gray-900 text-center">Add Safe Zone</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Latitude:</label>
            <input
              type="text"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Longitude:</label>
            <input
              type="text"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex justify-between mt-4">
            <button type="button" onClick={addMarker} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 transition transform hover:scale-105 flex items-center">
              <FaPlus className="mr-2" /> Add Marker
            </button>
            <button type="submit" className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700 transition transform hover:scale-105 flex items-center">
              <FaCheck className="mr-2" /> Create Safe Zone
            </button>
          </div>
        </form>
        {message && <div className="text-center mt-4 text-green-500">{message}</div>}
        <div className="mt-6 max-h-32 overflow-y-auto"> {/* max-h-24 pour limiter la hauteur à 6rem */}
          <h3 className="text-center font-bold text-gray-700 mb-4">Markers ({markers.length}/10)</h3>
          <ul className="list-none p-0">
            {markers.map((marker, index) => (
              <li key={index} className="mb-4 p-4 border border-gray-300 rounded flex justify-between items-center bg-white bg-opacity-80 shadow-sm">
                <span>Latitude: {marker.coordinates[1]}, Longitude: {marker.coordinates[0]}, Place Name: {marker.place_name}</span>
                <button type="button" onClick={() => removeMarker(index)} className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700 transition transform hover:scale-105 flex items-center">
                  <FaTrash className="mr-2" /> Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
        <button onClick={onClose} className="mt-4 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700 transition transform hover:scale-105 flex items-center">
          <FaTimes className="mr-2" /> Close
        </button>
      </div>
    </div>
  );
};

AddSafeZoneModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default AddSafeZoneModal;
