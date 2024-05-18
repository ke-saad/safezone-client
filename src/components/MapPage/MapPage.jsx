import React, { useState, useEffect, useRef } from "react";
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

// Import marker icons
import blueMarker from "../Images/blue_marker.png";
import greenMarker from "../Images/green_marker.png";
import redMarker from "../Images/red_marker.png";
import yellowMarker from "../Images/yellow_marker.png"; // Import yellow marker

// Import control icons
import startItineraryIcon from "../Images/new_itinerary_icon.png";
import addSafeIcon from "../Images/safe_location_icon.png";
import addDangerousIcon from "../Images/danger_location_icon.png";
import calculateItineraryIcon from "../Images/calculate_itinerary_icon.png";

// Define Popup content component
const PopupContent = ({ title, description, position, onDelete, locationName }) => (
  <div>
    <h3>{title}</h3>
    {title === "Danger" ? (
      <p>{`Danger: ${description}`}</p>
    ) : (
      <p>{description}</p>
    )}
    <p>{locationName ? locationName : `(${position[1]}, ${position[0]})`}</p>
    <Link to={`/location/${position[1]}/${position[0]}`}>View full location information</Link>
    <button onClick={onDelete}>Delete</button>
  </div>
);

// Custom confirmation dialog component
const ConfirmationDialog = ({ message, onConfirm, onCancel }) => (
  <div className="confirmation-dialog">
    <p>{message}</p>
    <button onClick={() => onConfirm("marker")}>The Marker Only</button>
    <button onClick={() => onConfirm("zone")}>The Whole Zone</button>
    <button onClick={onCancel}>Cancel</button>
  </div>
);

// Main MapPage component
const MapPage = () => {
  // State variables
  const [safeMarkers, setSafeMarkers] = useState([]);
  const [dangerousMarkers, setDangerousMarkers] = useState([]);
  const [itineraryMarkers, setItineraryMarkers] = useState([]);
  const [message, setMessage] = useState("");
  const [activeAction, setActiveAction] = useState(null);
  const [safeGeoJsonLayers, setSafeGeoJsonLayers] = useState([]);
  const [dangerousGeoJsonLayers, setDangerousGeoJsonLayers] = useState([]);
  const [dangerousDescriptions, setDangerousDescriptions] = useState({});
  const [deleteButtonClicked, setDeleteButtonClicked] = useState(false);
  const [confirmationDialog, setConfirmationDialog] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("location");
  const [yellowMarkerPosition, setYellowMarkerPosition] = useState(null);
  const [map, setMap] = useState(null);
  const hoverTimeout = useRef(null); // To handle hover delay
  const [hoveredMarker, setHoveredMarker] = useState(null); // To handle the popup

  // Function to add marker to the database
  const addMarkerToDatabase = async (marker, zoneType) => {
    const endpoint = zoneType === "dangerous"
      ? "http://localhost:3001/dangermarkers/add"
      : "http://localhost:3001/safetymarkers/add";
    
    const payload = {
      coordinates: marker.position,
      description: marker.description || "",
      timestamp: new Date().toISOString(),
      ...(zoneType === "dangerous" && { exception: marker.exception || "" }) // Include exception attribute for danger markers
    };

    try {
      const response = await axios.post(endpoint, payload);
      return response.data; // return the newly created marker data
    } catch (error) {
      console.error(`Error adding ${zoneType} marker to the database:`, error);
      return null;
    }
  };

  // Function to update GeoJSON layers
  const updateGeoJsonLayer = async (markers, setLayerFunc, zoneType) => {
    if (markers.length >= 10 && markers.length % 10 === 0) {
      // Extract the last 10 markers
      const lastTenMarkers = markers.slice(-10);

      // Check timestamp difference
      const firstTimestamp = new Date(lastTenMarkers[0].timestamp).getTime();
      const lastTimestamp = new Date(lastTenMarkers[lastTenMarkers.length - 1].timestamp).getTime();
      const timeDifference = (lastTimestamp - firstTimestamp) / 1000; // in seconds

      if (timeDifference > 90) {
        console.error("Markers were not added within 90 seconds. Zone creation failed.");
        return;
      }

      // Calculate the convex hull (if needed)
      const points = lastTenMarkers.map(marker => turf.point([marker.position[1], marker.position[0]]));
      const featureCollection = turf.featureCollection(points);
      const hull = turf.convex(featureCollection);

      if (hull) {
        setLayerFunc(layers => [...layers, hull]);
      }

      // Determine endpoint
      const endpoint =
        zoneType === "dangerous"
          ? "http://localhost:3001/dangerzones/add"
          : "http://localhost:3001/safezones/add";

      // Format payload according to the zone type
      const payload = {
        markers: lastTenMarkers.map(marker => ({
          coordinates: marker.position,
          description: marker.description || "",
          timestamp: marker.timestamp,
          ...(zoneType === "dangerous" && { exception: marker.exception || "" }) // Include exception attribute for danger markers
        }))
      };

      // Make the Axios POST request
      try {
        const response = await axios.post(endpoint, payload);
        // Ensure markers get the zone ID
        const zoneId = response.data._id;
        lastTenMarkers.forEach(marker => marker.zone = zoneId);
        console.log(`${zoneType} zones added to the database:`, response.data);
      } catch (error) {
        console.error(`Error adding ${zoneType} zones to the database:`, error);
      }
    }
  };

  // Function to fetch safe zones from the server
  const fetchSafeZones = async () => {
    try {
      const response = await axios.get("http://localhost:3001/safezones");
      const safeZones = response.data;

      // Extract markers directly without reversing coordinates
      const safeMarkersFromZones = safeZones.reduce((acc, zone) => {
        return acc.concat(zone.markers.map(marker => ({
          position: marker.coordinates,
          _id: marker._id,
          zone: zone._id, // Store the parent zone ID in the marker
          timestamp: marker.timestamp
        })));
      }, []);
      setSafeMarkers(existingMarkers => [...existingMarkers, ...safeMarkersFromZones]);

      // Process fetched zones to GeoJSON layers
      const safeGeoJsonData = safeZones.map(zone => {
        const points = zone.markers.map(marker => turf.point([marker.coordinates[1], marker.coordinates[0]]));
        const featureCollection = turf.featureCollection(points);
        return turf.convex(featureCollection); // Calculate the convex hull
      }).filter(Boolean); // Filter out any undefined results

      // Set GeoJSON layers
      setSafeGeoJsonLayers(safeGeoJsonData);
    } catch (error) {
      console.error("Error fetching safe zones:", error);
    }
  };

  // Function to fetch dangerous zones from the server
  const fetchDangerousZones = async () => {
    try {
      const response = await axios.get("http://localhost:3001/dangerzones");
      const dangerousZones = response.data;

      // Extract markers directly without reversing coordinates
      const dangerousMarkersFromZones = dangerousZones.reduce((acc, zone) => {
        return acc.concat(zone.markers.map(marker => ({
          position: marker.coordinates,
          description: marker.description || "No description provided",
          _id: marker._id,
          zone: zone._id, // Store the parent zone ID in the marker
          timestamp: marker.timestamp,
          exception: marker.exception || "" // Store the exception attribute for danger markers
        })));
      }, []);
      setDangerousMarkers(existingMarkers => [...existingMarkers, ...dangerousMarkersFromZones]);

      // Populate dangerousDescriptions object
      const descriptionsMap = {};
      dangerousMarkersFromZones.forEach(marker => {
        const key = `${marker.position[0]},${marker.position[1]}`;
        descriptionsMap[key] = marker.description;
      });
      setDangerousDescriptions(descriptionsMap);

      // Process fetched zones to GeoJSON layers
      const dangerousGeoJsonData = dangerousZones.map(zone => {
        const points = zone.markers.map(marker => turf.point([marker.coordinates[1], marker.coordinates[0]]));
        const featureCollection = turf.featureCollection(points);
        return turf.convex(featureCollection); // Calculate the convex hull
      }).filter(Boolean); // Filter out any undefined results

      // Set GeoJSON layers
      setDangerousGeoJsonLayers(dangerousGeoJsonData);
    } catch (error) {
      console.error("Error fetching dangerous zones:", error);
    }
  };

  // useEffect to fetch zones on component mount
  useEffect(() => {
    fetchSafeZones();
    fetchDangerousZones();
  }, []);

  // Function to refresh zones after deletion
  const refreshZones = async () => {
    setSafeMarkers([]);
    setDangerousMarkers([]);
    setSafeGeoJsonLayers([]);
    setDangerousGeoJsonLayers([]);
    await fetchSafeZones();
    await fetchDangerousZones();
  };

  // Function to handle marker deletion
  const handleMarkerDelete = async (index, type, choice) => {
    setDeleteButtonClicked(true);
    let updatedMarkers = [];
    let markerId;
    let zoneId;

    if (type === "safe") {
      updatedMarkers = [...safeMarkers];
      markerId = updatedMarkers[index]._id;
      zoneId = updatedMarkers[index].zone;

      if (choice === "zone") {
        // Delete whole zone
        try {
          await axios.delete(`http://localhost:3001/safezones/${zoneId}`);
        } catch (error) {
          console.error(`Error deleting safe zone: ${error}`);
        }
        setSafeMarkers([]);
        await refreshZones();
      } else if (choice === "marker") {
        // Delete marker
        try {
          await axios.delete(`http://localhost:3001/safetymarkers/${markerId}`);
        } catch (error) {
          console.error(`Error deleting safe marker: ${error}`);
        }
        updatedMarkers.splice(index, 1);
        setSafeMarkers(updatedMarkers);
        await refreshZones();
      }

    } else if (type === "dangerous") {
      updatedMarkers = [...dangerousMarkers];
      markerId = updatedMarkers[index]._id;
      zoneId = updatedMarkers[index].zone;

      if (choice === "zone") {
        // Delete whole zone
        try {
          await axios.delete(`http://localhost:3001/dangerzones/${zoneId}`);
        } catch (error) {
          console.error(`Error deleting dangerous zone: ${error}`);
        }
        setDangerousMarkers([]);
        await refreshZones();
      } else if (choice === "marker") {
        // Delete marker
        try {
          await axios.delete(`http://localhost:3001/dangermarkers/${markerId}`);
        } catch (error) {
          console.error(`Error deleting dangerous marker: ${error}`);
        }
        updatedMarkers.splice(index, 1);
        setDangerousMarkers(updatedMarkers);
        await refreshZones();
      }

    } else if (type === "itinerary") {
      updatedMarkers = [...itineraryMarkers];
      updatedMarkers.splice(index, 1);
      setItineraryMarkers(updatedMarkers);
    }

    setDeleteButtonClicked(false);
  };

  // Function to calculate and set itinerary
  const calculateAndSetItinerary = async () => {
    if (itineraryMarkers.length === 2) {
      const [start, end] = itineraryMarkers;
      const itinerary = await calculateItinerary(start.position, end.position);
      // Process and display the itinerary
    } else {
      setMessage("Please select start and end points first.");
    }
  };

  // Function to perform search based on the selected search type
  const performSearch = async () => {
    try {
      let response;
      if (searchType === "location") {
        response = await axios.get('http://localhost:3001/mapbox/forward', {
          params: {
            q: searchQuery,
            limit: 1,
            access_token: process.env.MAPBOX_ACCESS_TOKEN,
          },
        });
      } else {
        const [longitude, latitude] = searchQuery.split(",");
        response = await axios.get('http://localhost:3001/mapbox/reverse', {
          params: {
            longitude: longitude.trim(),
            latitude: latitude.trim(),
            limit: 1,
            access_token: process.env.MAPBOX_ACCESS_TOKEN,
          },
        });
      }

      const result = response.data.features[0];
      const [longitude, latitude] = result.center;
      setYellowMarkerPosition([latitude, longitude]);
      map.flyTo([latitude, longitude], 13);
    } catch (error) {
      console.error("Error performing search:", error);
    }
  };

  // Function to handle mouseover event with delay
  const handleMouseover = (e, marker) => {
    hoverTimeout.current = setTimeout(async () => {
      try {
        const response = await axios.get('http://localhost:3001/mapbox/reverse-geocode', {
          params: {
            longitude: marker.position[1],
            latitude: marker.position[0],
          },
        });
        const locationName = response.data.features[0]?.place_name || "Unknown location";
        setHoveredMarker({
          position: marker.position,
          locationName,
        });
        L.popup()
          .setLatLng(marker.position)
          .setContent(locationName)
          .openOn(e.target._map);
      } catch (error) {
        console.error("Error fetching location name:", error);
      }
    }, 2000); // 2 seconds delay
  };

  // Function to handle mouseout event
  const handleMouseout = () => {
    clearTimeout(hoverTimeout.current);
    if (hoveredMarker) {
      setHoveredMarker(null);
      map.closePopup();
    }
  };

  // MapEvents component to handle map events
  const MapEvents = () => {
    useMapEvents({
      async click(e) {
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

              // Add marker to the database
              const addedMarker = await addMarkerToDatabase(newMarker, zoneType);
              if (addedMarker) {
                newMarker._id = addedMarker._id; // Assign the ID from the database to the marker
                newMarker.timestamp = addedMarker.timestamp; // Assign the timestamp from the database to the marker
                if (zoneType === "dangerous") newMarker.exception = addedMarker.exception; // Assign the exception attribute for danger markers

                const updatedMarkerList = [...markerList, newMarker];
                setMarkers(updatedMarkerList);
                updateGeoJsonLayer(updatedMarkerList, zoneType === "safe" ? setSafeGeoJsonLayers : setDangerousGeoJsonLayers, zoneType);
              }
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

  // Create marker icons
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

  const yellowIcon = new L.Icon({
    iconUrl: yellowMarker,
    iconSize: [25, 25],
    iconAnchor: [12, 25],
    popupAnchor: [1, -34],
  });

  // Function to show confirmation dialog
  const showConfirmationDialog = (index, type) => {
    setConfirmationDialog(
      <ConfirmationDialog
        message="Which component do you want to delete?"
        onConfirm={choice => {
          handleMarkerDelete(index, type, choice);
          setConfirmationDialog(null);
        }}
        onCancel={() => setConfirmationDialog(null)}
      />
    );
  };

  return (
    <div className="map-container">
      <div className="navbar" style={{ backgroundColor: "#378CE7" }}>
        <Link to="/" className="nav-link">
          Home
        </Link>
        <Link to="/aboutus" className="nav-link">
          About Us
        </Link>
        <div className="search-container">
          <input
            type="text"
            placeholder={
              searchType === "location" ? "Enter location name..." : "Enter coordinates (lng, lat)..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
            <option value="location">Search By Location Name</option>
            <option value="coordinates">Search By Coordinates</option>
          </select>
          <button onClick={performSearch}>Search</button>
        </div>
      </div>
      <div className="map-area">
        <MapContainer
          center={[31.54764361241541, -8.756375278549186]}
          zoom={8}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
          whenCreated={setMap}
        >
          <ZoomControl position="topright" />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            detectRetina={true}
          />
          <MapEvents />
          {/* Render safe markers */}
          {safeMarkers.map((marker, index) => (
            <Marker
              key={`safe-${index}`}
              position={marker.position}
              icon={greenIcon}
              eventHandlers={{
                mouseover: (e) => handleMouseover(e, marker),
                mouseout: handleMouseout,
              }}
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
                  onDelete={() => showConfirmationDialog(index, "safe")}
                />
              </Popup>
            </Marker>
          ))}
          {/* Render dangerous markers */}
          {dangerousMarkers.map((marker, index) => (
            <Marker
              key={`dangerous-${index}`}
              position={marker.position}
              icon={redIcon}
              eventHandlers={{
                mouseover: (e) => handleMouseover(e, marker),
                mouseout: handleMouseout,
              }}
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
                  onDelete={() => showConfirmationDialog(index, "dangerous")}
                />
              </Popup>
            </Marker>
          ))}
          {/* Render itinerary markers */}
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
                  onDelete={() => showConfirmationDialog(index, "itinerary")}
                />
              </Popup>
            </Marker>
          ))}
          {/* Render yellow marker for search results */}
          {yellowMarkerPosition && (
            <Marker
              position={yellowMarkerPosition}
              icon={yellowIcon}
            >
              <Popup>
                Search Result
              </Popup>
            </Marker>
          )}
          {/* Render safe GeoJSON layers */}
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
          {/* Render dangerous GeoJSON layers */}
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
        {/* Render message if any */}
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
        {/* Control buttons */}
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
      {confirmationDialog}
    </div>
  );
};

export default MapPage;