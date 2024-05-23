import React, { useState } from "react";
import axios from "axios";
import { FaTimes, FaPlus, FaTrashAlt, FaSave } from 'react-icons/fa';
import PropTypes from "prop-types";
import ErrorModal from '../Modals/ErrorModal';  // Assurez-vous que le chemin est correct
import SuccessDialog from '../Modals/SuccessDialog';  // Assurez-vous que le chemin est correct

const AddDangerZoneModal = ({ isOpen, onClose, onSave }) => {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [description, setDescription] = useState("");
  const [markers, setMarkers] = useState([]);
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (!isOpen) return null;

  const addMarker = async () => {
    if (!latitude || !longitude || !description) {
      setErrorMessage("Latitude, longitude, and description are required.");
      setIsErrorOpen(true);
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
        description: description,
        place_name: placeName,
        context: context,
        timestamp: new Date().toISOString()
      };

      setMarkers([...markers, newMarker]);
      setLatitude("");
      setLongitude("");
      setDescription("");
      setSuccessMessage(`Marker added successfully. Total markers: ${markers.length + 1}`);
      setIsSuccessOpen(true);
    } catch (error) {
      setErrorMessage("Failed to fetch location details.");
      setIsErrorOpen(true);
      console.error("Error:", error);
    }
  };

  const removeMarker = (index) => {
    const updatedMarkers = [...markers];
    updatedMarkers.splice(index, 1);
    setMarkers(updatedMarkers);
    setSuccessMessage(`Marker removed. Total markers: ${updatedMarkers.length}`);
    setIsSuccessOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (markers.length !== 10) {
      setErrorMessage("Exactly 10 markers are required to create a danger zone.");
      setIsErrorOpen(true);
      return;
    }

    try {
      await axios.post("http://localhost:3001/dangerzones/add", { markers });
      setSuccessMessage("Danger zone added successfully.");
      setMarkers([]);
      setIsSuccessOpen(true);
      onSave(); // Refresh the list of danger zones
    } catch (error) {
      setErrorMessage("Failed to add danger zone.");
      setIsErrorOpen(true);
      console.error("Error:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-smoke-light flex">
      <div className="relative p-8 bg-white w-full max-w-md m-auto flex-col flex rounded-lg shadow-lg">
        <button onClick={onClose} className="absolute top-2 right-2 text-red-500">
          <FaTimes size={20} />
        </button>
        <h2 className="text-2xl text-center font-bold mb-4">Add Danger Zone</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-item mb-2">
            <label>Latitude:</label>
            <input
              type="text"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="w-full px-2 py-1 border rounded"
            />
          </div>
          <div className="input-item mb-2">
            <label>Longitude:</label>
            <input
              type="text"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="w-full px-2 py-1 border rounded"
            />
          </div>
          <div className="input-item mb-2">
            <label>Description:</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-2 py-1 border rounded"
            />
          </div>
          <div className="button-group mb-4 flex justify-between">
            <button
              type="button"
              className="bg-green-500 text-white py-2 px-4 rounded flex items-center"
              onClick={addMarker}
            >
              <FaPlus className="mr-2" /> Add Marker
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded flex items-center"
            >
              <FaSave className="mr-2" /> Create Danger Zone
            </button>
          </div>
        </form>
        <div className="markers-list max-h-48 overflow-y-auto">
          <h3>Markers ({markers.length}/10)</h3>
          <ul className="list-disc pl-5">
            {markers.map((marker, index) => (
              <li key={index} className="mb-1 flex items-center justify-between">
                <span>
                  Latitude: {marker.coordinates[1]}, Longitude: {marker.coordinates[0]}, Description: {marker.description}, Place Name: {marker.place_name}
                </span>
                <button
                  type="button"
                  className="bg-red-500 text-white py-1 px-2 rounded ml-2 flex items-center"
                  onClick={() => removeMarker(index)}
                >
                  <FaTrashAlt className="mr-1" /> Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
        <ErrorModal
          isOpen={isErrorOpen}
          onClose={() => setIsErrorOpen(false)}
          errorMessage={errorMessage}
        />
        <SuccessDialog
          isOpen={isSuccessOpen}
          onClose={() => setIsSuccessOpen(false)}
          successMessage={successMessage}
        />
      </div>
    </div>
  );
};

AddDangerZoneModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
};

export default AddDangerZoneModal;
