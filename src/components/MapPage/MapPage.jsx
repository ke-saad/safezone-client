
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
  Polyline 
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapPage.css";
import * as turf from "@turf/turf";
import polyline from '@mapbox/polyline';  

import blueMarker from "../Images/blue_marker.png";
import greenMarker from "../Images/green_marker.png";
import redMarker from "../Images/red_marker.png";
import yellowMarker from "../Images/yellow_marker.png"; 

import startItineraryIcon from "../Images/new_itinerary_icon.png";
import addSafeIcon from "../Images/safe_location_icon.png";
import addDangerousIcon from "../Images/danger_location_icon.png";
import calculateItineraryIcon from "../Images/calculate_itinerary_icon.png";

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
        
      </button>
      <button className="delete-button" onClick={onDelete}>Delete</button>
    </div>
  );
};

const ConfirmationDialog = ({ message, onConfirm, onCancel }) => (
  <div className="confirmation-dialog">
    <p>{message}</p>
    <button onClick={() => onConfirm("delete")}>Delete</button>
    <button onClick={onCancel}>Cancel</button>
  </div>
);

const MapPage = () => {
  const navigate = useNavigate(); 
  const location = useLocation(); 
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
  const [searchType, setSearchType] = useState("forward");
  const [longitude, setLongitude] = useState(""); 
  const [latitude, setLatitude] = useState(""); 
  const [yellowMarkerPosition, setYellowMarkerPosition] = useState(null);
  const [yellowMarkerInfo, setYellowMarkerInfo] = useState(null);
  const [map, setMap] = useState(null);
  const hoverTimeout = useRef(null); 
  const [hoveredMarker, setHoveredMarker] = useState(null); 
  const [selectedLayer, setSelectedLayer] = useState(null); 
  const [zones, setZones] = useState([]); 
  const [completedZones, setCompletedZones] = useState([]); 
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [itineraryOptions, setItineraryOptions] = useState({
    profile: "driving",
    alternatives: "false",
    annotations: "",
    steps: "true",
    banner_instructions: "true",
    voice_instructions: "false"
  });
  const [showDropdown, setShowDropdown] = useState(false); 
  const [itineraryInfo, setItineraryInfo] = useState(null); 

  const queryParams = new URLSearchParams(location.search);
  const zoneType = queryParams.get("zoneType");
  const zoneId = queryParams.get("id");

  const addMarkerToDatabase = async (marker, zoneType) => {
    const endpoint = zoneType === "danger"
      ? "http://localhost:3001/dangermarkers/add"
      : "http://localhost:3001/safetymarkers/add";
  
    const geocodeResponse = await axios.get("http://localhost:3001/mapbox/forward", {
      params: { q: `${marker.position[1]},${marker.position[0]}`, limit: 1 },
    });
  
    const geocodeData = geocodeResponse.data.features[0] || {};
  
    const payload = {
      coordinates: marker.position,
      description: marker.description || "",
      timestamp: new Date().toISOString(),
      place_name: geocodeData.place_name || "Unknown location",
      context: geocodeData.context || [], 
      ...(zoneType === "danger" && { exception: marker.exception || "" }), 
    };
  
    console.log("Sending payload:", JSON.stringify(payload, null, 2)); 
  
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data; 
    } catch (error) {
      console.error(`Error adding ${zoneType} marker to the database:`, error);
      return null;
    }
  };



  const updateGeoJsonLayer = async (markers, setLayerFunc, zoneType) => {
    if (markers.length >= 10 && markers.length % 10 === 0) {
      const lastTenMarkers = markers.slice(-10);
  
      const points = lastTenMarkers.map((marker) =>
        turf.point([marker.position[1], marker.position[0]])
      );
      const featureCollection = turf.featureCollection(points);
      const hull = turf.convex(featureCollection);
  
      const updatedMarkers = await Promise.all(
        lastTenMarkers.map(async (marker) => {
          const geocodeResponse = await axios.get("http://localhost:3001/mapbox/forward", {
            params: { q: `${marker.position[1]},${marker.position[0]}`, limit: 1 },
          });
  
          const geocodeData = geocodeResponse.data.features[0] || {};
          return {
            ...marker,
            place_name: geocodeData.place_name || "Unknown location",
            context: geocodeData.context || [],
          };
        })
      );
  
      const endpoint = zoneType === "danger"
        ? "http://localhost:3001/dangerzones/add"
        : "http://localhost:3001/safezones/add";
  
      const payload = {
        markers: updatedMarkers.map(marker => ({
          coordinates: marker.position,
          description: marker.description,
          timestamp: marker.timestamp,
          place_name: marker.place_name,
          context: marker.context,
          ...(zoneType === "danger" && { exception: marker.exception || "" }),
        })),
      };
  
      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(endpoint, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        const createdZone = response.data.data.zone;
  
        if (hull && createdZone._id) {
          hull.properties = { zoneType, zoneId: createdZone._id };
          setLayerFunc(layers => [...layers, hull]);
          setCompletedZones(prev => [...prev, createdZone._id]);
        } else {
          console.error("Hull or created zone ID is missing.");
        }
      } catch (error) {
        console.error(`Error adding ${zoneType} zones to the database:`, error);
      }
    }
  };
  

  
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
        zone: { _id: zone._id }, 
        timestamp: marker.timestamp,
        locationName: zone.locationName, 
        ...(zoneType === "danger" && { exception: marker.exception || "" }), 
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
        hull.properties = { zoneType, zoneId: zone._id }; 
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

  
  const fetchSafeZones = async () => {
    try {
      const response = await axios.get("http://localhost:3001/safezones");
      const safeZones = response.data;

      
      setZones((prevZones) => [...prevZones, ...safeZones]);

      
      const safeMarkersFromZones = safeZones.reduce((acc, zone) => {
        return acc.concat(
          zone.markers
            .map((marker) => {
              
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
                  zone: { _id: zone._id }, 
                  timestamp: marker.timestamp,
                  locationName: zone.locationName, 
                };
              }
              return null;
            })
            .filter((marker) => marker !== null) 
        );
      }, []);
      setSafeMarkers((existingMarkers) => [
        ...existingMarkers,
        ...safeMarkersFromZones,
      ]);

      
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
            .filter((point) => point !== null); 
          const featureCollection = turf.featureCollection(points);
          const hull = turf.convex(featureCollection);
          if (hull) {
            hull.properties = { zoneType: "safe", zoneId: zone._id }; 
          }
          return hull ? hull : null; 
        })
        .filter(Boolean); 

      
      setSafeGeoJsonLayers(safeGeoJsonData);
    } catch (error) {
      console.error("Error fetching safe zones:", error);
    }
  };

  
  const fetchDangerousZones = async () => {
    try {
      const response = await axios.get("http://localhost:3001/dangerzones");
      const dangerousZones = response.data;

      
      setZones((prevZones) => [...prevZones, ...dangerousZones]);

      
      const dangerousMarkersFromZones = dangerousZones.reduce((acc, zone) => {
        return acc.concat(
          zone.markers
            .map((marker) => {
              
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
                  zone: { _id: zone._id }, 
                  timestamp: marker.timestamp,
                  locationName: zone.locationName, 
                  exception: marker.exception || "", 
                };
              }
              return null;
            })
            .filter((marker) => marker !== null) 
        );
      }, []);
      setDangerousMarkers((existingMarkers) => [
        ...existingMarkers,
        ...dangerousMarkersFromZones,
      ]);

      
      const descriptionsMap = {};
      dangerousMarkersFromZones.forEach((marker) => {
        const key = `${marker.position[0]},${marker.position[1]}`;
        descriptionsMap[key] = marker.description;
      });
      setDangerousDescriptions(descriptionsMap);

      
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
            .filter((point) => point !== null); 
          const featureCollection = turf.featureCollection(points);
          const hull = turf.convex(featureCollection);
          if (hull) {
            hull.properties = { zoneType: "danger", zoneId: zone._id }; 
          }
          return hull ? hull : null; 
        })
        .filter((layer) => layer !== null); 

      
      setDangerousGeoJsonLayers(dangerousGeoJsonData);
    } catch (error) {
      console.error("Error fetching dangerous zones:", error);
    }
  };

  
  useEffect(() => {
    if (zoneType && zoneId) {
      fetchZoneById(zoneType, zoneId);
    } else {
      fetchSafeZones();
      fetchDangerousZones();
    }
  }, [zoneType, zoneId]);

  const refreshZones = async () => {
    setSafeMarkers([]);
    setDangerousMarkers([]);
    setSafeGeoJsonLayers([]);
    setDangerousGeoJsonLayers([]);
    await fetchSafeZones();
    await fetchDangerousZones();
  };

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
      setItineraryMarkers([]);
    }
    setDeleteButtonClicked(false);
  };

  

  const handleZoneDelete = async (zoneId, zoneType) => {
    try {
      const token = localStorage.getItem("token");
      const endpoint = zoneType === "safe"
        ? `http://localhost:3001/safezones/${zoneId}`
        : `http://localhost:3001/dangerzones/${zoneId}`;
  
      
      const response = await axios.delete(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.data.success) {
        
        setCompletedZones((prev) => prev.filter((id) => id !== zoneId));
  
        
        await refreshZones();
      } else {
        console.error(`Error deleting ${zoneType} zone:`, response.data.message);
      }
    } catch (error) {
      console.error(`Error deleting ${zoneType} zone:`, error);
    }
  };
  
  
  const calculateAndSetItinerary = async () => {
    if (itineraryMarkers.length === 2) {
      const [start, end] = itineraryMarkers;
      try {
        const response = await axios.post('http://localhost:3001/calculate-itinerary', {
          startCoordinates: start.position,
          endCoordinates: end.position,
          profile: itineraryOptions.profile
        });
  
        const itinerary = response.data.itinerary;
  
        if (itinerary && itinerary.routes && itinerary.routes.length > 0) {
          
          const routeCoordinates = polyline.decode(itinerary.routes[0].geometry);
          const routeLatLngs = routeCoordinates.map(coord => ({ lat: coord[0], lng: coord[1] }));
  
          
          setRouteCoordinates(routeLatLngs);
  
          
          console.log('Itinerary calculated:', itinerary);
  
          
          setItineraryInfo({
            profile: itineraryOptions.profile,
            distance: itinerary.routes[0].legs[0].distance,
            duration: itinerary.routes[0].legs[0].duration,
            startName: start.locationName,
            endName: end.locationName,
            summary: itinerary.routes[0].legs[0].summary
          });
  
          
          if (map) map.setView([start.position[0], start.position[1]], 13);
  
          
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

      
      setYellowMarkerPosition(null);

      
      setYellowMarkerPosition([latitudeResult, longitudeResult]);

      
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

        
        if (map) map.setView([latitudeResult, longitudeResult], 13);
       
      } catch (error) {
        console.error("Error fetching location name:", error);
      }
    } catch (error) {
      console.error("Error performing search:", error);
    }
  };

  
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
    }, 2000); 
  };

  
  const handleMouseout = () => {
    clearTimeout(hoverTimeout.current);
    if (hoveredMarker) {
      setHoveredMarker(null);
      map.closePopup();
    }
  };

  
  const handleLayerMouseover = (e, layer) => {
    e.target.setStyle({
      color: layer.feature.properties.zoneType === "safe" ? "#006400" : "#8B0000",
    });
  };

  
  const handleLayerMouseout = (e, layer) => {
    e.target.setStyle({
      color: layer.feature.properties.zoneType === "safe" ? "#00FF00" : "#FF0000",
    });
  };

 
 const handleLayerClick = (e, layer) => {
  const zoneId = layer.feature.properties.zoneId; 
  const zoneType = layer.feature.properties.zoneType;
  setSelectedLayer({ zoneId, zoneType, latlng: e.latlng });
};

const showLayerConfirmationDialog = () => {
  const { zoneId, zoneType } = selectedLayer;
  return (
    <ConfirmationDialog
      message={`What would you like to do with this ${zoneType} zone?`}
      onConfirm={async (choice) => {
        if (choice === "delete") {
          
          await handleZoneDelete(zoneId, zoneType);
        } else if (choice === "view") {
          
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
              
              const currentZoneId = zones.find(zone => zone.markers.some(marker => marker.coordinates[0] === lat && marker.coordinates[1] === lng))?._id;
              if (currentZoneId && completedZones.includes(currentZoneId)) {
                console.error("Cannot add marker to a completed zone.");
                return; 
              }

              if (activeAction === "addDangerous") {
                const description = prompt("Enter description for the dangerous location:");
                if (description === null || description.trim() === "") {
                  return; 
                }
                setDangerousDescriptions((prev) => ({
                  ...prev,
                  [`${lat},${lng}`]: description,
                }));
                newMarker.description = description; 
              }

              
              const addedMarker = await addMarkerToDatabase(newMarker, zoneType);
              if (addedMarker) {
                newMarker._id = addedMarker._id; 
                newMarker.timestamp = addedMarker.timestamp; 
                if (zoneType === "danger") newMarker.exception = addedMarker.exception; 

                const updatedMarkerList = [...markerList, newMarker];

                
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
                  setActiveAction(null); 
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
        <Link to="/admindashboard" className="text-white text-center w-1/2 py-2 px-4 rounded hover:text-black hover:bg-gray-300 transition">
            Dashboard
          </Link>
      
      </div>
      <div className="map-area">
        <MapContainer
          center={[31.638479, -8.009901]}
          zoom={13}
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
          
          {routeCoordinates.length > 0 && (
            <Polyline positions={routeCoordinates} color="#2A629A" />
          )}
          
          
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
          
          {safeGeoJsonLayers.map((layer, index) => (
            <GeoJSON
              key={`safe-layer-${index}`}
              data={layer}
              style={{
                color: "#00FF00",
                weight: 2,
                opacity: 0.8, 
                fillOpacity: 0.4, 
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
                opacity: 0.8, 
                fillOpacity: 0.4, 
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
