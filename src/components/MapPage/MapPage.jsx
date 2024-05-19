import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
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
const PopupContent = ({ title, description, locationName, onDelete, position }) => (
  <div>
    <h3>{title}</h3>
    {title === "Danger" ? (
      <>
        <p>Location Name: {locationName}</p>
        <p>Danger Description: {description}</p>
      </>
    ) : (
      <p>Location Name: {locationName}</p>
    )}
    <button className="view-button">
      <Link to={`/location/${position[1]}/${position[0]}`}>View</Link>
    </button>
    <button className="delete-button" onClick={onDelete}>Delete</button>
  </div>
);

// Custom confirmation dialog component
const ConfirmationDialog = ({ message, onConfirm, onCancel }) => (
  <div className="confirmation-dialog">
    <p>{message}</p>
    <button onClick={() => onConfirm("view")}>View</button>
    <button onClick={() => onConfirm("delete")}>Delete</button>
    <button onClick={onCancel}>Cancel</button>
  </div>
);

// Main MapPage component
const MapPage = () => {
  const navigate = useNavigate(); // To navigate to different pages
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
  const [searchType, setSearchType] = useState("forward"); // State for search type
  const [longitude, setLongitude] = useState(""); // State for longitude
  const [latitude, setLatitude] = useState(""); // State for latitude
  const [yellowMarkerPosition, setYellowMarkerPosition] = useState(null);
  const [yellowMarkerInfo, setYellowMarkerInfo] = useState(null);
  const [map, setMap] = useState(null);
  const hoverTimeout = useRef(null); // To handle hover delay
  const [hoveredMarker, setHoveredMarker] = useState(null); // To handle the popup
  const [selectedLayer, setSelectedLayer] = useState(null); // To handle selected GeoJSON layer

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
          timestamp: marker.timestamp,
          locationName: zone.locationName // Store the location name
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
          locationName: zone.locationName, // Store the location name
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
  const handleMarkerDelete = async (index, type) => {
    setDeleteButtonClicked(true);
    let updatedMarkers = [];
    let markerId;
    let zoneId;

    if (type === "safe") {
      updatedMarkers = [...safeMarkers];
      markerId = updatedMarkers[index]._id;
      zoneId = updatedMarkers[index].zone;

      // Delete marker
      try {
        await axios.delete(`http://localhost:3001/safetymarkers/${markerId}`);
      } catch (error) {
        console.error(`Error deleting safe marker: ${error}`);
      }
      updatedMarkers.splice(index, 1);
      setSafeMarkers(updatedMarkers);
      await refreshZones();

    } else if (type === "dangerous") {
      updatedMarkers = [...dangerousMarkers];
      markerId = updatedMarkers[index]._id;
      zoneId = updatedMarkers[index].zone;

      // Delete marker
      try {
        await axios.delete(`http://localhost:3001/dangermarkers/${markerId}`);
      } catch (error) {
        console.error(`Error deleting dangerous marker: ${error}`);
      }
      updatedMarkers.splice(index, 1);
      setDangerousMarkers(updatedMarkers);
      await refreshZones();

    } else if (type === "itinerary") {
      updatedMarkers = [...itineraryMarkers];
      markerId = updatedMarkers[index]._id;
      zoneId = updatedMarkers[index].zone;

      // Delete marker
      try {
        await axios.delete(`http://localhost:3001/itinerarymarkers/${markerId}`);
      } catch (error) {
        console.error(`Error deleting itinerary marker: ${error}`);
      }
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

  // Function to perform search
  const performSearch = async () => {
    try {
      const endpoint =
        searchType === "forward"
          ? "http://localhost:3001/mapbox/forward"
          : "http://localhost:3001/mapbox/reverse-geocode";

      const params = searchType === "forward"
        ? { q: searchQuery, limit: 1 }
        : { longitude: longitude, latitude: latitude };

      const response = await axios.get(endpoint, { params });

      if (response.data.features.length === 0) {
        setMessage("No results found");
        return;
      }

      const result = response.data.features[0];
      const [longitudeResult, latitudeResult] = result.geometry.coordinates;

      // Remove previous yellow marker
      setYellowMarkerPosition(null);

      // Set new yellow marker
      setYellowMarkerPosition([latitudeResult, longitudeResult]);

      // Fetch the location name
      try {
        const response = await axios.get('http://localhost:3001/mapbox/reverse-geocode', {
          params: {
            longitude: longitudeResult,
            latitude: latitudeResult,
          },
        });
        const locationName = response.data.features[0]?.place_name || "Unknown location";
        setYellowMarkerInfo({ locationName });

        // Check if map is defined before using flyTo
        if (map) {
          map.flyTo([latitudeResult, longitudeResult], 13);
        }
      } catch (error) {
        console.error("Error fetching location name:", error);
      }
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

  // Function to handle GeoJSON layer mouseover event
  const handleLayerMouseover = (e, layer) => {
    e.target.setStyle({
      color: layer.feature.properties.zoneType === "safe" ? "#006400" : "#8B0000",
    });
  };

  // Function to handle GeoJSON layer mouseout event
  const handleLayerMouseout = (e, layer) => {
    e.target.setStyle({
      color: layer.feature.properties.zoneType === "safe" ? "#00FF00" : "#FF0000",
    });
  };

  // Function to handle GeoJSON layer click event
  const handleLayerClick = (e, layer) => {
    const zoneId = layer.feature.properties.zoneId;
    const zoneType = layer.feature.properties.zoneType;
    setSelectedLayer({ zoneId, zoneType, latlng: e.latlng });
  };

  // Function to show GeoJSON layer confirmation dialog
  const showLayerConfirmationDialog = () => {
    const { zoneId, zoneType, latlng } = selectedLayer;
    return (
      <ConfirmationDialog
        message={`What would you like to do with this ${zoneType} zone?`}
        onConfirm={(choice) => {
          if (choice === "delete") {
            // Delete the whole zone
            axios.delete(`http://localhost:3001/${zoneType}zones/${zoneId}`).then(() => {
              refreshZones();
            });
          } else if (choice === "view") {
            // Navigate to the appropriate page
            const viewPage = zoneType === "safe" ? "viewupdatesafezone" : "viewupdatedangerzone";
            navigate(`/${viewPage}/${zoneId}`);
          }
          setSelectedLayer(null);
        }}
        onCancel={() => setSelectedLayer(null)}
      />
    );
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

                // Fetch the location name
                try {
                  const response = await axios.get('http://localhost:3001/mapbox/reverse-geocode', {
                    params: {
                      longitude: lng,
                      latitude: lat,
                    },
                  });
                  const locationName = response.data.features[0]?.place_name || "Unknown location";
                  newMarker.locationName = locationName;

                  setMarkers(updatedMarkerList);
                  updateGeoJsonLayer(updatedMarkerList, zoneType === "safe" ? setSafeGeoJsonLayers : setDangerousGeoJsonLayers, zoneType);
                } catch (error) {
                  console.error("Error fetching location name:", error);
                }
              }
            }
          } else if (activeAction === "startItinerary") {
            if (itineraryMarkers.length < 2) {
              const { lat, lng } = e.latlng;
              const newMarker = { position: [lat, lng] };

              // Fetch the location name
              try {
                const response = await axios.get('http://localhost:3001/mapbox/reverse-geocode', {
                  params: {
                    longitude: lng,
                    latitude: lat,
                  },
                });
                const locationName = response.data.features[0]?.place_name || "Unknown location";
                newMarker.locationName = locationName;

                setItineraryMarkers(prev => [...prev, newMarker]);
              } catch (error) {
                console.error("Error fetching location name:", error);
              }
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
        message="What would you like to do with this marker?"
        onConfirm={choice => {
          if (choice === "delete") {
            handleMarkerDelete(index, type);
          } else if (choice === "view") {
            const viewPage = type === "safe" ? "viewupdatesafezone" : "viewupdatedangerzone";
            navigate(`/${viewPage}/${index}`);
          }
          setConfirmationDialog(null);
        }}
        onCancel={() => setConfirmationDialog(null)}
      />
    );
  };

  return (
    <div className="map-container">
      <div className="navbar">
        <div className="search-container">
          <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
            <option value="forward">Forward Search</option>
            <option value="reverse">Reverse Search</option>
          </select>
          {searchType === "forward" ? (
            <input
              type="text"
              placeholder="Enter location name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          ) : (
            <>
              <input
                type="text"
                placeholder="Enter longitude..."
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
              />
              <input
                type="text"
                placeholder="Enter latitude..."
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
              />
            </>
          )}
          <button onClick={performSearch}>Search</button>
        </div>
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
                  locationName={marker.locationName}
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
                  locationName={marker.locationName}
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
                  description=""
                  locationName={marker.locationName}
                  position={marker.position}
                  onDelete={() => handleMarkerDelete(index, "itinerary")}
                />
              </Popup>
            </Marker>
          ))}
          {/* Render yellow marker for search results */}
          {yellowMarkerPosition && (
            <Marker
              position={yellowMarkerPosition}
              icon={yellowIcon}
              eventHandlers={{
                mouseover: (e) => handleMouseover(e, { position: yellowMarkerPosition }),
                mouseout: handleMouseout,
              }}
            >
              <Popup
                onClose={() => setDeleteButtonClicked(false)}
                onOpen={() => setDeleteButtonClicked(false)}
              >
                <PopupContent
                  title="Search Result"
                  description=""
                  locationName={yellowMarkerInfo?.locationName || "Unknown location"}
                  position={yellowMarkerPosition}
                  onDelete={() => setYellowMarkerPosition(null)}
                />
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
              eventHandlers={{
                mouseover: (e) => handleLayerMouseover(e, { feature: { properties: { zoneType: 'safe' } } }),
                mouseout: (e) => handleLayerMouseout(e, { feature: { properties: { zoneType: 'safe' } } }),
                click: (e) => handleLayerClick(e, { feature: { properties: { zoneId: layer._id, zoneType: 'safe' } } })
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
              eventHandlers={{
                mouseover: (e) => handleLayerMouseover(e, { feature: { properties: { zoneType: 'dangerous' } } }),
                mouseout: (e) => handleLayerMouseout(e, { feature: { properties: { zoneType: 'dangerous' } } }),
                click: (e) => handleLayerClick(e, { feature: { properties: { zoneId: layer._id, zoneType: 'dangerous' } } })
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
      {selectedLayer && showLayerConfirmationDialog()}
    </div>
  );
};

export default MapPage;