import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { FaMapMarkerAlt, FaInfoCircle, FaGlobe } from "react-icons/fa";

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
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white font-sans" style={{ backgroundImage: "url('/Map.png')" }}>
      <div className="navbar flex justify-between w-full p-4 bg-black shadow-md">
  <Link to="/admindashboard" className="text-white py-2 px-4 w-1/2 text-center rounded hover:text-black hover:bg-gray-300 transition">
    Dashboard
  </Link>
  <Link to="/map" className="text-white py-2 px-4 w-1/2 text-center rounded hover:text-black hover:bg-gray-300 transition">
    Map
  </Link>
</div>

      <div className="background-overlay fixed top-0 left-0 w-full h-full bg-black opacity-50 z-0"></div>
      <div className="content mt-20 p-6 w-full max-w-2xl bg-white bg-opacity-90 rounded-lg shadow-lg z-10">
        {message && <div className="message text-red-500 text-center mb-4">{message}</div>}
        {marker ? (
          <div className="marker-details p-6 bg-white bg-opacity-90 rounded-lg shadow-lg text-black max-h-96 overflow-y-auto">
            <h3 className="text-2xl font-bold text-center mb-4">Location Details:</h3>
            <div className="marker-info">
              <div className="mb-4 flex items-center space-x-2">
                <FaMapMarkerAlt />
                <p><strong>Latitude:</strong> {marker.features[0].geometry.coordinates[1]}</p>
              </div>
              <div className="mb-4 flex items-center space-x-2">
                <FaMapMarkerAlt />
                <p><strong>Longitude:</strong> {marker.features[0].geometry.coordinates[0]}</p>
              </div>
              <div className="mb-4 flex items-center space-x-2">
                <FaInfoCircle />
                <p><strong>Description:</strong> {marker.features[0].place_name}</p>
              </div>
              <div className="mb-4 flex items-center space-x-2">
                <FaGlobe />
                <p><strong>Context:</strong></p>
              </div>
              <ul className="list-none pl-0">
                {marker.features[0].context.map((item, index) => (
                  <li key={index} className="mb-2 flex items-center space-x-2">
                    <FaInfoCircle />
                    <p>{item.text} ({item.wikidata || item.id})</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="loading text-green-500 text-center text-xl">Loading...</p>
        )}
      </div>
    </div>
  );
};

export default ViewMarkerDetails;
