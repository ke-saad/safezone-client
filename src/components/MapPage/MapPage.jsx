//MapPage.jsx:
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  useMapEvents,
  Marker,
  Popup,
  ZoomControl,
  GeoJSON,
  Polyline // Import Polyline component from react-leaflet
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapPage.css";
import * as turf from "@turf/turf";
import polyline from '@mapbox/polyline';  // Import polyline decoding library

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
const PopupContent = ({ title, description, position, onDelete }) => {
  const [locationName, setLocationName] = useState("Loading...");

  useEffect(() => {
    const fetchLocationName = async () => {
      try {
        const [latitude, longitude] = position;
        const response = await axios.get("http://localhost:3001/mapbox/reverse-geocode", {
          params: { longitude, latitude },
        });
        const data = response.data.features[0];
        setLocationName(data ? data.place_name : "Unknown location");
      } catch (error) {
        console.error("Error fetching location name:", error);
        setLocationName("Unknown location");
      }
    };

    fetchLocationName();
  }, [position]);

  return (
    <div>
      <h3>{title}</h3>
      <p>Location Name: {locationName}</p>
      <p>{description}</p>
      <button className="view-button">
        <Link to={`/marker/${position[1]},${position[0]}`}>View</Link> {/* Ensure order is correct */}
      </button>
      <button className="delete-button" onClick={onDelete}>Delete</button>
    </div>
  );
};

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
  const location = useLocation(); // To access query parameters
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
  const [zones, setZones] = useState([]); // To store all zone information
  const [completedZones, setCompletedZones] = useState([]); // To track completed zones
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [itineraryOptions, setItineraryOptions] = useState({
    profile: "driving",
    alternatives: "false",
    annotations: "",
    steps: "true",
    banner_instructions: "true",
    voice_instructions: "false"
  });
  const [showDropdown, setShowDropdown] = useState(false); // State to control dropdown visibility
  const [itineraryInfo, setItineraryInfo] = useState(null); // State to store itinerary information

  // Extract query parameters from the URL
  const queryParams = new URLSearchParams(location.search);
  const zoneType = queryParams.get("zoneType");
  const zoneId = queryParams.get("id");

  // Function to add marker to the database
  const addMarkerToDatabase = async (marker, zoneType) => {
    const endpoint = zoneType === "danger"
      ? "http://localhost:3001/dangermarkers/add"
      : "http://localhost:3001/safetymarkers/add";

    // Perform forward geocoding to get full information about the marker's location
    const geocodeResponse = await axios.get("http://localhost:3001/mapbox/forward", {
      params: { q: `${marker.position[1]},${marker.position[0]}`, limit: 1 },
    });

    const geocodeData = geocodeResponse.data.features[0] || {};

    const payload = {
      coordinates: marker.position,
      description: marker.description || "",
      timestamp: new Date().toISOString(),
      place_name: geocodeData.place_name || "Unknown location",
      context: geocodeData.context || [], // Store the context array from the geocode response
      ...(zoneType === "danger" && { exception: marker.exception || "" }), // Include exception attribute for danger markers
    };

    console.log("Sending payload:", JSON.stringify(payload, null, 2)); // Log the payload

    try {
      const response = await axios.post(endpoint, payload);
      return response.data; // return the newly created marker data
    } catch (error) {
      console.error(`Error adding ${zoneType} marker to the database:`, error);
      return null;
    }
  };

  // Function to update GeoJSON layers and store zone data with forward geocoding for markers
  const updateGeoJsonLayer = async (markers, setLayerFunc, zoneType) => {
    if (markers.length >= 10 && markers.length % 10 === 0) {
      // Extract the last 10 markers
      const lastTenMarkers = markers.slice(-10);

      // Calculate the convex hull (if needed)
      const points = lastTenMarkers.map((marker) =>
        turf.point([marker.position[1], marker.position[0]])
      );
      const featureCollection = turf.featureCollection(points);
      const hull = turf.convex(featureCollection);

      // Perform forward geocoding for each marker to get full information
      const updatedMarkers = await Promise.all(
        lastTenMarkers.map(async (marker) => {
          const geocodeResponse = await axios.get("http://localhost:3001/mapbox/forward", {
            params: { q: `${marker.position[1]},${marker.position[0]}`, limit: 1 },
          });

          const geocodeData = geocodeResponse.data.features[0] || {};
          return {
            ...marker,
            place_name: geocodeData.place_name || "Unknown location",
            context: geocodeData.context || [], // Store the context array from the geocode response
          };
        })
      );

      // Determine endpoint
      const endpoint =
        zoneType === "danger"
          ? "http://localhost:3001/dangerzones/add"
          : "http://localhost:3001/safezones/add";

      // Format payload according to the zone type
      const payload = {
        markers: updatedMarkers.map((marker) => ({
          coordinates: marker.position,
          description: marker.description || "",
          timestamp: marker.timestamp,
          place_name: marker.place_name,
          context: marker.context,
          ...(zoneType === "danger" && { exception: marker.exception || "" }), // Include exception attribute for danger markers
        })),
      };

      // Make the Axios POST request
      try {
        const response = await axios.post(endpoint, payload);
        const createdZone = response.data.data.zone;

        if (hull && createdZone._id) {
          hull.properties = { zoneType, zoneId: createdZone._id }; // Add properties to the GeoJSON feature
          setLayerFunc((layers) => [...layers, hull]);
          setCompletedZones((prev) => [...prev, createdZone._id]); // Mark the zone as completed
        } else {
          console.error("Hull or created zone ID is missing.");
        }

        console.log(`${zoneType} zones added to the database:`, response.data);
      } catch (error) {
        console.error(`Error adding ${zoneType} zones to the database:`, error);
      }
    }
  };

  // Function to fetch a specific zone from the server
  const fetchZoneById = async (zoneType, id) => {
    try {
      const endpoint =
        zoneType === "safe"
          ? `http://localhost:3001/safezones/${id}`
          : `http://localhost:3001/dangerzones/${id}`;
      const response = await axios.get(endpoint);
      const zone = response.data;

      const markersFromZone = zone.markers.map((marker) => ({
        position: marker.coordinates,
        description: marker.description || "No description provided",
        _id: marker._id,
        zone: { _id: zone._id }, // Store the parent zone ID in the marker
        timestamp: marker.timestamp,
        locationName: zone.locationName, // Store the location name
        ...(zoneType === "danger" && { exception: marker.exception || "" }), // Include exception attribute for danger markers
      }));

      if (zoneType === "safe") {
        setSafeMarkers(markersFromZone);
      } else {
        setDangerousMarkers(markersFromZone);
        const descriptionsMap = {};
        markersFromZone.forEach((marker) => {
          const key = `${marker.position[0]},${marker.position[1]}`;
          descriptionsMap[key] = marker.description;
        });
        setDangerousDescriptions(descriptionsMap);
      }

      const points = zone.markers.map((marker) => turf.point([marker.coordinates[1], marker.coordinates[0]]));
      const featureCollection = turf.featureCollection(points);
      const hull = turf.convex(featureCollection);
      if (hull) {
        hull.properties = { zoneType, zoneId: zone._id }; // Add properties to the GeoJSON feature
      }

      if (zoneType === "safe") {
        setSafeGeoJsonLayers([hull]);
      } else {
        setDangerousGeoJsonLayers([hull]);
      }

      console.log(`${zoneType} zone fetched successfully:`, zone);
    } catch (error) {
      console.error(`Error fetching ${zoneType} zone:`, error);
    }
  };

  // Function to fetch all safe zones from the server
  const fetchSafeZones = async () => {
    try {
      const response = await axios.get("http://localhost:3001/safezones");
      const safeZones = response.data;

      // Store zones information in state
      setZones((prevZones) => [...prevZones, ...safeZones]);

      // Extract markers directly without reversing coordinates
      const safeMarkersFromZones = safeZones.reduce((acc, zone) => {
        return acc.concat(
          zone.markers
            .map((marker) => {
              // Validate coordinates
              if (
                marker.coordinates &&
                marker.coordinates.length === 2 &&
                !isNaN(marker.coordinates[0]) &&
                !isNaN(marker.coordinates[1])
              ) {
                return {
                  position: marker.coordinates,
                  description: marker.description || "No description provided",
                  _id: marker._id,
                  zone: { _id: zone._id }, // Store the parent zone ID in the marker
                  timestamp: marker.timestamp,
                  locationName: zone.locationName, // Store the location name
                };
              }
              return null;
            })
            .filter((marker) => marker !== null) // Filter out invalid markers
        );
      }, []);
      setSafeMarkers((existingMarkers) => [
        ...existingMarkers,
        ...safeMarkersFromZones,
      ]);

      // Process fetched zones to GeoJSON layers
      const safeGeoJsonData = safeZones
        .map((zone) => {
          const points = zone.markers
            .map((marker) => {
              if (
                marker.coordinates &&
                marker.coordinates.length === 2 &&
                !isNaN(marker.coordinates[0]) &&
                !isNaN(marker.coordinates[1])
              ) {
                return turf.point([marker.coordinates[1], marker.coordinates[0]]);
              }
              return null;
            })
            .filter((point) => point !== null); // Filter out invalid points
          const featureCollection = turf.featureCollection(points);
          const hull = turf.convex(featureCollection);
          if (hull) {
            hull.properties = { zoneType: "safe", zoneId: zone._id }; // Add properties to the GeoJSON feature
          }
          return hull ? hull : null; // Return the hull if it exists, otherwise return null
        })
        .filter(Boolean); // Filter out any undefined or null results

      // Set GeoJSON layers
      setSafeGeoJsonLayers(safeGeoJsonData);
    } catch (error) {
      console.error("Error fetching safe zones:", error);
    }
  };

  // Function to fetch all dangerous zones from the server
  const fetchDangerousZones = async () => {
    try {
      const response = await axios.get("http://localhost:3001/dangerzones");
      const dangerousZones = response.data;

      // Store zones information in state
      setZones((prevZones) => [...prevZones, ...dangerousZones]);

      // Extract markers directly without reversing coordinates
      const dangerousMarkersFromZones = dangerousZones.reduce((acc, zone) => {
        return acc.concat(
          zone.markers
            .map((marker) => {
              // Validate coordinates
              if (
                marker.coordinates &&
                marker.coordinates.length === 2 &&
                !isNaN(marker.coordinates[0]) &&
                !isNaN(marker.coordinates[1])
              ) {
                return {
                  position: marker.coordinates,
                  description: marker.description || "No description provided",
                  _id: marker._id,
                  zone: { _id: zone._id }, // Store the parent zone ID in the marker
                  timestamp: marker.timestamp,
                  locationName: zone.locationName, // Store the location name
                  exception: marker.exception || "", // Store the exception attribute for danger markers
                };
              }
              return null;
            })
            .filter((marker) => marker !== null) // Filter out invalid markers
        );
      }, []);
      setDangerousMarkers((existingMarkers) => [
        ...existingMarkers,
        ...dangerousMarkersFromZones,
      ]);

      // Populate dangerousDescriptions object
      const descriptionsMap = {};
      dangerousMarkersFromZones.forEach((marker) => {
        const key = `${marker.position[0]},${marker.position[1]}`;
        descriptionsMap[key] = marker.description;
      });
      setDangerousDescriptions(descriptionsMap);

      // Process fetched zones to GeoJSON layers
      const dangerousGeoJsonData = dangerousZones
        .map((zone) => {
          const points = zone.markers
            .map((marker) => {
              if (
                marker.coordinates &&
                marker.coordinates.length === 2 &&
                !isNaN(marker.coordinates[0]) &&
                !isNaN(marker.coordinates[1])
              ) {
                return turf.point([marker.coordinates[1], marker.coordinates[0]]);
              }
              return null;
            })
            .filter((point) => point !== null); // Filter out invalid points
          const featureCollection = turf.featureCollection(points);
          const hull = turf.convex(featureCollection);
          if (hull) {
            hull.properties = { zoneType: "danger", zoneId: zone._id }; // Add properties to the GeoJSON feature
          }
          return hull ? hull : null; // Return the hull if it exists, otherwise return null
        })
        .filter((layer) => layer !== null); // Filter out any null results

      // Set GeoJSON layers
      setDangerousGeoJsonLayers(dangerousGeoJsonData);
    } catch (error) {
      console.error("Error fetching dangerous zones:", error);
    }
  };

  // useEffect to fetch zones on component mount
  useEffect(() => {
    if (zoneType && zoneId) {
      // Fetch the specific zone by ID
      fetchZoneById(zoneType, zoneId);
    } else {
      // Fetch all zones
      fetchSafeZones();
      fetchDangerousZones();
    }
  }, [zoneType, zoneId]);

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
  const handleMarkerDelete = (index, type) => {
    setDeleteButtonClicked(true);
    let updatedMarkers = [];
    if (type === "safe") {
      updatedMarkers = [...safeMarkers];
      updatedMarkers.splice(index, 1);
      setSafeMarkers(updatedMarkers);
    } else if (type === "dangerous") {
      updatedMarkers = [...dangerousMarkers];
      updatedMarkers.splice(index, 1);
      setDangerousMarkers(updatedMarkers);
    } else if (type === "itinerary") {
      setItineraryMarkers([]);
    }
    setDeleteButtonClicked(false);
  };

  // Function to delete all markers in a zone
  const handleZoneDelete = async (zoneId, zoneType) => {
    try {
      const endpoint =
        zoneType === "safe"
          ? `http://localhost:3001/safezones/${zoneId}`
          : `http://localhost:3001/dangerzones/${zoneId}`;
  
      // Send DELETE request to the appropriate endpoint
      const response = await axios.delete(endpoint);
  
      if (response.data.success) {
        // Remove the zone from completed zones
        setCompletedZones((prev) => prev.filter((id) => id !== zoneId));
  
        // Refresh zones after deletion
        await refreshZones();
      } else {
        console.error(`Error deleting ${zoneType} zone:`, response.data.message);
      }
    } catch (error) {
      console.error(`Error deleting ${zoneType} zone:`, error);
    }
  };
  
  // Function to calculate and set itinerary
  const calculateAndSetItinerary = async () => {
    if (itineraryMarkers.length === 2) {
      const [start, end] = itineraryMarkers;
      try {
        const response = await axios.post('http://localhost:3001/calculate-itinerary', {
          startCoordinates: start.position,
          endCoordinates: end.position,
          profile: itineraryOptions.profile // Use only the profile parameter
        });
  
        const itinerary = response.data.itinerary;
  
        if (itinerary && itinerary.routes && itinerary.routes.length > 0) {
          // Decode the polyline geometry
          const routeCoordinates = polyline.decode(itinerary.routes[0].geometry);
          const routeLatLngs = routeCoordinates.map(coord => ({ lat: coord[0], lng: coord[1] }));
  
          // Set the route coordinates state
          setRouteCoordinates(routeLatLngs);
  
          // Log the itinerary response to the console
          console.log('Itinerary calculated:', itinerary);
  
          // Display message with itinerary details
          setItineraryInfo({
            profile: itineraryOptions.profile,
            distance: itinerary.routes[0].legs[0].distance,
            duration: itinerary.routes[0].legs[0].duration,
            startName: start.locationName,
            endName: end.locationName,
            summary: itinerary.routes[0].legs[0].summary
          });
  
          // Center the map around the starting point of the itinerary
          if (map) map.setView([start.position[0], start.position[1]], 13);
  
          // Close the itinerary calculation modal
          setShowDropdown(false);
        } else {
          setMessage('Itinerary calculation failed.');
          console.log('Itinerary calculation failed:', itinerary);
        }
      } catch (error) {
        console.error('Error calculating itinerary:', error);
        setMessage('Error calculating itinerary.');
      }
    } else {
      setMessage('Please select start and end points first.');
    }
  };

  // Function to perform search
  const performSearch = async () => {
    try {
      const endpoint =
        searchType === "forward"
          ? "http://localhost:3001/mapbox/forward"
          : "http://localhost:3001/mapbox/reverse-geocode";

      const params =
        searchType === "forward"
          ? { q: searchQuery, limit: 1 }
          : { longitude, latitude };

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
        const response = await axios.get("http://localhost:3001/mapbox/reverse-geocode", {
          params: {
            longitude: longitudeResult,
            latitude: latitudeResult,
          },
        });
        const locationName =
          response.data.features[0]?.place_name || "Unknown location";
        setYellowMarkerInfo({ locationName });

        // Check if map is defined before using setView
        if (map) map.setView([latitudeResult, longitudeResult], 13);
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
        const response = await axios.get("http://localhost:3001/mapbox/reverse-geocode", {
          params: {
            longitude: marker.position[1],
            latitude: marker.position[0],
          },
        });
        const locationName =
          response.data.features[0]?.place_name || "Unknown location";
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
  const zoneId = layer.feature.properties.zoneId; // Use zoneId to identify zone
  const zoneType = layer.feature.properties.zoneType;
  setSelectedLayer({ zoneId, zoneType, latlng: e.latlng });
};
// Function to show GeoJSON layer confirmation dialog
const showLayerConfirmationDialog = () => {
  const { zoneId, zoneType } = selectedLayer;
  return (
    <ConfirmationDialog
      message={`What would you like to do with this ${zoneType} zone?`}
      onConfirm={async (choice) => {
        if (choice === "delete") {
          // Delete the zone
          await handleZoneDelete(zoneId, zoneType);
        } else if (choice === "view") {
          // Fetch the zone ID from the database and navigate to the view page
          try {
            const response = await axios.get(`http://localhost:3001/${zoneType}zones/${zoneId}`);
            const zone = response.data;
            const viewPage = zoneType === "safe" ? "viewupdatesafezone" : "viewupdatedangerzone";
            navigate(`/${viewPage}/${zone._id}`);
          } catch (error) {
            console.error(`Error fetching ${zoneType} zone:`, error);
          }
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
            zoneType = "danger";
          }

          if (activeAction === "addSafe" || activeAction === "addDangerous") {
            const { lat, lng } = e.latlng;
            const newMarker = { position: [lat, lng] };
            const markerList =
              activeAction === "addSafe" ? safeMarkers : dangerousMarkers;
            const setMarkers =
              activeAction === "addSafe" ? setSafeMarkers : setDangerousMarkers;

            if (!markerList.some((marker) => marker.position[0] === lat && marker.position[1] === lng)) {
              // Check if this marker can be added to the zone
              const currentZoneId = zones.find(zone => zone.markers.some(marker => marker.coordinates[0] === lat && marker.coordinates[1] === lng))?._id;
              if (currentZoneId && completedZones.includes(currentZoneId)) {
                console.error("Cannot add marker to a completed zone.");
                return; // Exit if trying to add a marker to a completed zone
              }

              if (activeAction === "addDangerous") {
                const description = prompt("Enter description for the dangerous location:");
                if (description === null || description.trim() === "") {
                  return; // Exit if no description is provided or cancelled
                }
                setDangerousDescriptions((prev) => ({
                  ...prev,
                  [`${lat},${lng}`]: description,
                }));
                newMarker.description = description; // Store description directly in the marker if needed immediately
              }

              // Add marker to the database
              const addedMarker = await addMarkerToDatabase(newMarker, zoneType);
              if (addedMarker) {
                newMarker._id = addedMarker._id; // Assign the ID from the database to the marker
                newMarker.timestamp = addedMarker.timestamp; // Assign the timestamp from the database to the marker
                if (zoneType === "danger") newMarker.exception = addedMarker.exception; // Assign the exception attribute for danger markers

                const updatedMarkerList = [...markerList, newMarker];

                // Fetch the location name
                try {
                  const response = await axios.get("http://localhost:3001/mapbox/reverse-geocode", {
                    params: {
                      longitude: lng,
                      latitude: lat,
                    },
                  });
                  const locationName = response.data.features[0]?.place_name || "Unknown location";
                  newMarker.locationName = locationName;

                  setMarkers(updatedMarkerList);
                  updateGeoJsonLayer(
                    updatedMarkerList,
                    zoneType === "safe" ? setSafeGeoJsonLayers : setDangerousGeoJsonLayers,
                    zoneType
                  );
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
                const response = await axios.get("http://localhost:3001/mapbox/reverse-geocode", {
                  params: {
                    longitude: lng,
                    latitude: lat,
                  },
                });
                const locationName = response.data.features[0]?.place_name || "Unknown location";
                newMarker.locationName = locationName;

                setItineraryMarkers((prev) => [...prev, newMarker]);
                if (itineraryMarkers.length === 1) {
                  setActiveAction(null); // Deactivate blue marker pinning after two markers are pinned
                }
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
        onConfirm={(choice) => {
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

  // Function to cancel itinerary calculation
  const cancelItineraryCalculation = () => {
    setItineraryMarkers([]);
    setShowDropdown(false);
  };

  return (
    <div className="map-container">
      <div className="navbar">
        <div className="search-container">
          <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
            <option value="forward">Location Name</option>
            <option value="reverse">Location Coordinates</option>
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
        <Link to="/admindashboard" className="nav-link">
          Dashboard
        </Link>
        <Link to="/login" className="nav-link">
          Log Out
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
                  description={marker.description}
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
          {/* Render the calculated route */}
          {routeCoordinates.length > 0 && (
            <Polyline positions={routeCoordinates} color="#2A629A" />
          )}
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
                opacity: 0.8, // Adjust opacity here
                fillOpacity: 0.4, // Adjust fillOpacity here
              }}
              eventHandlers={{
                mouseover: (e) =>
                  handleLayerMouseover(e, {
                    feature: { properties: { zoneType: "safe" } },
                  }),
                mouseout: (e) =>
                  handleLayerMouseout(e, {
                    feature: { properties: { zoneType: "safe" } },
                  }),
                click: (e) =>
                  handleLayerClick(e, {
                    feature: {
                      properties: { zoneId: layer.properties.zoneId, zoneType: "safe" },
                    },
                  }),
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
                opacity: 0.8, // Adjust opacity here
                fillOpacity: 0.4, // Adjust fillOpacity here
              }}
              eventHandlers={{
                mouseover: (e) =>
                  handleLayerMouseover(e, {
                    feature: { properties: { zoneType: "danger" } },
                  }),
                mouseout: (e) =>
                  handleLayerMouseout(e, {
                    feature: { properties: { zoneType: "danger" } },
                  }),
                click: (e) =>
                  handleLayerClick(e, {
                    feature: {
                      properties: {
                        zoneId: layer.properties.zoneId,
                        zoneType: "danger",
                      },
                    },
                  }),
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
            onClick={() => setMessage("")}
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
            onClick={() => setShowDropdown(!showDropdown)}
            title="Calculate Itinerary"
          >
            <img src={calculateItineraryIcon} alt="Calculate Itinerary" />
          </button>
          {showDropdown && (
            <div className="itinerary-dropdown">
              <label>
                Profile:
                <select
                  value={itineraryOptions.profile}
                  onChange={(e) =>
                    setItineraryOptions({ ...itineraryOptions, profile: e.target.value })
                  }
                >
                  <option value="driving">Driving</option>
                  <option value="walking">Walking</option>
                  <option value="cycling">Cycling</option>
                </select>
              </label>
              <button onClick={calculateAndSetItinerary}>Calculate</button>
              <button onClick={cancelItineraryCalculation}>Cancel</button>
            </div>
          )}
        </div>
        {/* Itinerary options modal */}
        <div className="itinerary-options">
          <h3>Itinerary Options</h3>
          <label>
            Profile:
            <select
              value={itineraryOptions.profile}
              onChange={(e) =>
                setItineraryOptions({ ...itineraryOptions, profile: e.target.value })
              }
            >
              <option value="driving">Driving</option>
              <option value="walking">Walking</option>
              <option value="cycling">Cycling</option>
            </select>
          </label>
          <label>
            Alternatives:
            <select
              value={itineraryOptions.alternatives}
              onChange={(e) =>
                setItineraryOptions({ ...itineraryOptions, alternatives: e.target.value })
              }
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </label>
          <label>
            Annotations:
            <input
              type="text"
              value={itineraryOptions.annotations}
              onChange={(e) =>
                setItineraryOptions({ ...itineraryOptions, annotations: e.target.value })
              }
              placeholder="distance,duration,speed"
            />
          </label>
          <label>
            Steps:
            <select
              value={itineraryOptions.steps}
              onChange={(e) =>
                setItineraryOptions({ ...itineraryOptions, steps: e.target.value })
              }
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </label>
          <label>
            Banner Instructions:
            <select
              value={itineraryOptions.banner_instructions}
              onChange={(e) =>
                setItineraryOptions({
                  ...itineraryOptions,
                  banner_instructions: e.target.value,
                })
              }
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </label>
          <label>
            Voice Instructions:
            <select
              value={itineraryOptions.voice_instructions}
              onChange={(e) =>
                setItineraryOptions({
                  ...itineraryOptions,
                  voice_instructions: e.target.value,
                })
              }
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </label>
        </div>
      </div>
      {confirmationDialog}
      {selectedLayer && showLayerConfirmationDialog()}
      {/* Display itinerary info */}
      {itineraryInfo && (
        <div className="itinerary-info">
          <h4>Itinerary Information</h4>
          <p><strong>Profile:</strong> {itineraryInfo.profile}</p>
          <p><strong>Distance:</strong> {(itineraryInfo.distance / 1000).toFixed(2)} Kilometers</p>
          <p><strong>Duration:</strong> {(itineraryInfo.duration /3600).toFixed(2) } Hours</p>
          <p><strong>Start:</strong> {itineraryInfo.startName}</p>
          <p><strong>End:</strong> {itineraryInfo.endName}</p>
          <button onClick={() => setItineraryInfo(null)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default MapPage;