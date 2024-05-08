import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  useMapEvents,
  Marker,
  Popup,
  ZoomControl,
  GeoJSON,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapPage.css";
import calculateItinerary from "./itineraryService";
import * as turf from "@turf/turf";

import blueMarker from "../Images/blue_marker.png";
import greenMarker from "../Images/green_marker.png";
import redMarker from "../Images/red_marker.png";

import startItineraryIcon from "../Images/new_itinerary_icon.png";
import addSafeIcon from "../Images/safe_location_icon.png";
import addDangerousIcon from "../Images/danger_location_icon.png";
import calculateItineraryIcon from "../Images/calculate_itinerary_icon.png";

const PopupContent = ({ title, description, position, onDelete }) => (
  <div>
    <h3>{title}</h3>
    {title === "Danger" ? (
      <p>{`Danger: ${description}`}</p>
    ) : (
      <p>{description}</p>
    )}
    <p>
      ({position[1]}, {position[0]})
    </p>
    <button onClick={onDelete}>Delete</button>
  </div>
);

const MapPage = () => {
  const [safeMarkers, setSafeMarkers] = useState([]);
  const [dangerousMarkers, setDangerousMarkers] = useState([]);
  const [itineraryMarkers, setItineraryMarkers] = useState([]);
  const [message, setMessage] = useState("");
  const [activeAction, setActiveAction] = useState(null);
  const [safeGeoJsonLayers, setSafeGeoJsonLayers] = useState([]);
  const [dangerousGeoJsonLayers, setDangerousGeoJsonLayers] = useState([]);
  const [dangerousDescriptions, setDangerousDescriptions] = useState({});
  const [deleteButtonClicked, setDeleteButtonClicked] = useState(false);

  const updateGeoJsonLayer = async (markers, setLayerFunc, zoneType) => {
    if (markers.length >= 10) { // Ensure there are at least 10 markers
        // Extract the last 10 markers
        const lastTenMarkers = markers.slice(-10);
        
        // Calculate the convex hull (if needed)
        const points = lastTenMarkers.map(marker => turf.point([marker.position[1], marker.position[0]]));
        const featureCollection = turf.featureCollection(points);
        const hull = turf.convex(featureCollection);
        setLayerFunc(layers => [...layers, hull]);

        // Determine endpoint
        const endpoint = zoneType === "dangerous" ? 
            "http://localhost:3001/dangerzones/add" : 
            "http://localhost:3001/safezones/add";

        // Format payload according to the zone type
        const payload = {
          markers: lastTenMarkers.map(marker => {
            if (zoneType === "dangerous") {
              const key = `${marker.position[1]},${marker.position[0]}`;
              return {
                coordinates: [marker.position[1], marker.position[0]], // Assuming your backend expects [lng, lat]
                description: dangerousDescriptions[key] || marker.description || "No description"
              };
            } else {
              return {
                coordinates: [marker.position[1], marker.position[0]]
              };
            }
          })
        };
        

        // Make the Axios POST request
        try {
            const response = await axios.post(endpoint, payload);
            console.log(`${zoneType} zones added to the database:`, response.data);
        } catch (error) {
            console.error(`Error adding ${zoneType} zones to the database:`, error);
        }
    }
};


  const handleMarkerDelete = (index, type) => {
    setDeleteButtonClicked(true);
    if (type === "safe") {
      setSafeMarkers((prevMarkers) => {
        const updatedMarkers = prevMarkers.filter((_, i) => i !== index);
        updateGeoJsonLayer(updatedMarkers, setSafeGeoJsonLayers, "safe");
        return updatedMarkers;
      });
    } else if (type === "dangerous") {
      setDangerousMarkers((prevMarkers) => {
        const updatedMarkers = prevMarkers.filter((_, i) => i !== index);
        updateGeoJsonLayer(updatedMarkers, setDangerousGeoJsonLayers, "dangerous");
        return updatedMarkers;
      });
    } else if (type === "itinerary") {
      setItineraryMarkers((prevMarkers) =>
        prevMarkers.filter((_, i) => i !== index)
      );
    }
  };

  const calculateAndSetItinerary = async () => {
    if (itineraryMarkers.length === 2) {
      const [start, end] = itineraryMarkers;
      const itinerary = await calculateItinerary(start.position, end.position);
      // Process and display the itinerary
    } else {
      setMessage("Please select start and end points first.");
    }
  };

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        if (!deleteButtonClicked) {
          let zoneType;
          if (activeAction === "addSafe") {
            zoneType = "safe";
          } else if (activeAction === "addDangerous") {
            zoneType = "dangerous";
          }
  
          if (activeAction === "addSafe" || activeAction === "addDangerous") {
            const { lat, lng } = e.latlng;
            const newMarker = { position: [lat, lng] };
            const markerList =
              activeAction === "addSafe" ? safeMarkers : dangerousMarkers;
            const setMarkers =
              activeAction === "addSafe" ? setSafeMarkers : setDangerousMarkers;
  
            if (!markerList.some(marker => marker.position[0] === lat && marker.position[1] === lng)) {
              if (activeAction === "addDangerous") {
                const description = prompt("Enter description for the dangerous location:");
                if (description === null || description.trim() === "") {
                  return; // Exit if no description is provided or cancelled
                }
                setDangerousDescriptions(prev => ({
                  ...prev,
                  [`${lat},${lng}`]: description
                }));
                newMarker.description = description; // Store description directly in the marker if needed immediately
              }
  
              const updatedMarkerList = [...markerList, newMarker];
              setMarkers(updatedMarkerList);
              updateGeoJsonLayer(updatedMarkerList, zoneType === "safe" ? setSafeGeoJsonLayers : setDangerousGeoJsonLayers, zoneType);
            }
          } else if (activeAction === "startItinerary") {
            if (itineraryMarkers.length < 2) {
              const { lat, lng } = e.latlng;
              setItineraryMarkers(prev => [...prev, { position: [lat, lng] }]);
            }
          }
        }
        setDeleteButtonClicked(false);
      },
    });
    return null;
  };
  
  

  const blueIcon = new L.Icon({
    iconUrl: blueMarker,
    iconSize: [25, 25],
    iconAnchor: [12, 25],
    popupAnchor: [1, -34],
  });

  const greenIcon = new L.Icon({
    iconUrl: greenMarker,
    iconSize: [25, 25],
    iconAnchor: [12, 25],
    popupAnchor: [1, -34],
  });

  const redIcon = new L.Icon({
    iconUrl: redMarker,
    iconSize: [25, 25],
    iconAnchor: [12, 25],
    popupAnchor: [1, -34],
  });

  return (
    <div className="map-container">
      <div className="navbar" style={{ backgroundColor: "#378CE7" }}>
        <Link to="/" className="nav-link">
          Home
        </Link>
        <Link to="/aboutus" className="nav-link">
          About Us
        </Link>
      </div>
      <div className="map-area">
        <MapContainer
          center={[31.54764361241541, -8.756375278549186]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <ZoomControl position="topright" />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            detectRetina={true}
          />
          <MapEvents />
          {safeMarkers.map((marker, index) => (
            <Marker
              key={`safe-${index}`}
              position={marker.position}
              icon={greenIcon}
            >
              <Popup
                onClose={() => setDeleteButtonClicked(false)}
                onOpen={() => setDeleteButtonClicked(false)}
              >
                <PopupContent
                  title="Safe location"
                  description=""
                  backgroundColor="#E1F7F5"
                  position={marker.position}
                  onDelete={() => handleMarkerDelete(index, "safe")}
                />
              </Popup>
            </Marker>
          ))}
          {dangerousMarkers.map((marker, index) => (
            <Marker
              key={`dangerous-${index}`}
              position={marker.position}
              icon={redIcon}
            >
              <Popup
                onClose={() => setDeleteButtonClicked(false)}
                onOpen={() => setDeleteButtonClicked(false)}
              >
                <PopupContent
                  title="Danger"
                  backgroundColor="#E1F7F5"
                  description={
                    dangerousDescriptions[
                      `${marker.position[0]},${marker.position[1]}`
                    ] || "No description provided"
                  }
                  position={marker.position}
                  onDelete={() => handleMarkerDelete(index, "dangerous")}
                />
              </Popup>
            </Marker>
          ))}
          {itineraryMarkers.map((marker, index) => (
            <Marker
              key={`itinerary-${index}`}
              position={marker.position}
              icon={blueIcon}
            >
              <Popup
                onClose={() => setDeleteButtonClicked(false)}
                onOpen={() => setDeleteButtonClicked(false)}
              >
                <PopupContent
                  title="Itinerary point"
                  backgroundColor="#E1F7F5"
                  description=""
                  position={marker.position}
                  onDelete={() => handleMarkerDelete(index, "itinerary")}
                />
              </Popup>
            </Marker>
          ))}
          {safeGeoJsonLayers.map((layer, index) => (
            <GeoJSON
              key={`safe-layer-${index}`}
              data={layer}
              style={{
                color: "#00FF00",
                weight: 2,
                opacity: 0.35,
                fillOpacity: 0.5,
              }}
            />
          ))}
          {dangerousGeoJsonLayers.map((layer, index) => (
            <GeoJSON
              key={`dangerous-layer-${index}`}
              data={layer}
              style={{
                color: "#FF0000",
                weight: 2,
                opacity: 0.35,
                fillOpacity: 0.5,
              }}
            />
          ))}
        </MapContainer>
        {message && (
          <div
            className="message"
            style={{
              position: "absolute",
              top: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              padding: "10px",
              backgroundColor: "#f8f8f8",
              border: "1px solid #ccc",
              borderRadius: "5px",
            }}
          >
            {message}
          </div>
        )}
        <div className="control-buttons">
          <button
            className="control-button"
            data-action="startItinerary"
            onClick={() => setActiveAction("startItinerary")}
            title="Start New Itinerary"
          >
            <img src={startItineraryIcon} alt="Start Itinerary" />
          </button>
          <button
            className="control-button"
            data-action="addSafe"
            onClick={() => setActiveAction("addSafe")}
            title="Add Safe Location"
          >
            <img src={addSafeIcon} alt="Add Safe Location" />
          </button>
          <button
            className="control-button"
            data-action="addDangerous"
            onClick={() => setActiveAction("addDangerous")}
            title="Add Dangerous Location"
          >
            <img src={addDangerousIcon} alt="Add Dangerous Location" />
          </button>
          <button
            className="control-button"
            data-action="calculateItinerary"
            onClick={calculateAndSetItinerary}
            title="Calculate Itinerary"
          >
            <img src={calculateItineraryIcon} alt="Calculate Itinerary" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapPage;