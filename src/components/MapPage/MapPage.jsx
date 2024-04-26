// MapPage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer ,useMapEvents, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapPage.css';
import calculateItinerary from './itineraryService'; // Import the itinerary calculation function
import * as turf from '@turf/turf';
import { GeoJSON } from 'react-leaflet';

// Import marker icon images
import blueMarker from '../Images/blue_marker.png';
import greenMarker from '../Images/green_marker.png';
import redMarker from '../Images/red_marker.png';
// Import icon images
import startItineraryIcon from '../Images/new_itinerary_icon.png';
import addSafeIcon from '../Images/safe_location_icon.png';
import addDangerousIcon from '../Images/danger_location_icon.png';
import calculateItineraryIcon from '../Images/calculate_itinerary_icon.png';

const MapPage = () => {
  const [markers, setMarkers] = useState([]);
  const [message, setMessage] = useState('');
  const [activeAction, setActiveAction] = useState(null);
  const [itineraryResponse, setItineraryResponse] = useState(null);
  const [itineraryMarkers, setItineraryMarkers] = useState([]);
  const [geoJsonLayer, setGeoJsonLayer] = useState(null);

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        const newMarker = { position: [lat, lng], color: activeAction === 'addSafe' ? 'green' : (activeAction === 'addDangerous' ? 'red' : 'blue') };
    
        // Check if the clicked position is already occupied by any marker
        if (!markers.some(marker => marker.position[0] === lat && marker.position[1] === lng)) {
          if (activeAction === 'startItinerary') {
            // Count only blue markers
            const blueMarkersCount = markers.filter(marker => marker.color === 'blue').length;
    
            // Add blue marker only if there are fewer than two blue markers
            if (blueMarkersCount < 2) {
              setMarkers(prev => [...prev, newMarker]);
            }
          } else if (activeAction === 'addSafe' || activeAction === 'addDangerous') {
            // Add red or green markers for 'addSafe' or 'addDangerous' actions
            setMarkers(prev => {
              const updatedMarkers = [...prev, newMarker];
              const colorMarkers = updatedMarkers.filter(m => m.color === activeAction.slice(3).toLowerCase());
              updateGeoJsonLayer(colorMarkers);
              return updatedMarkers;
            });
          }
        }
      }
    });
    
    return null;
  };

  const updateGeoJsonLayer = (colorMarkers) => {
    if (colorMarkers.length >= 10) {
      const points = colorMarkers.map(marker => turf.point([marker.position[1], marker.position[0]]));
      console.log('Points Array:', points);
      const hull = turf.convex(turf.featureCollection(points));
      if (hull) {
        hull.properties = { fillColor: colorMarkers[0].color }; 
        setGeoJsonLayer(hull);
      } else {
        setGeoJsonLayer(null);
      }
    } else {
      setGeoJsonLayer(null);
    }
  };
  
  

  const calculateAndSetItinerary = async () => {
    if (markers.length === 2) {
      const itineraryData = await calculateItinerary(markers[0].position, markers[1].position);
      if (itineraryData) {
        console.log('Itinerary Data:', itineraryData);
        setItineraryResponse(itineraryData);
        setItineraryMarkers([]);
        setItineraryMarkers([itineraryData.routes[0].legs[0].start_point, itineraryData.routes[0].legs[0].end_point]);
        setMessage('Itinerary calculated successfully!');
      } else {
        console.error('Failed to calculate itinerary');
        setMessage('Failed to calculate itinerary');
      }
    } else {
      setMessage('Please select start and end points first.');
    }
  };

  const handleActionClick = (action) => {
    setActiveAction(action);
    setMessage('');
  };

  const handleMarkerDelete = (index) => {
    const updatedMarkers = [...markers];
    updatedMarkers.splice(index, 1);
    setMarkers(updatedMarkers);
  };

  // Define custom icons using the imported images
  const blueIcon = new L.Icon({
    iconUrl: blueMarker,
    iconSize: [25, 25],
    iconAnchor: [12, 25],
    popupAnchor: [1, -34]
  });

  const greenIcon = new L.Icon({
    iconUrl: greenMarker,
    iconSize: [25, 25],
    iconAnchor: [12, 25],
    popupAnchor: [1, -34]
  });

  const redIcon = new L.Icon({
    iconUrl: redMarker,
    iconSize: [25, 25],
    iconAnchor: [12, 25],
    popupAnchor: [1, -34]
  });

  return (
    <div className="map-container">
      <div className="navbar" style={{ backgroundColor: '#378CE7' }}>
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/login" className="nav-link">Login</Link>
        <Link to="/aboutus" className="nav-link">About Us</Link>
      </div>
      <div className="map-area">
        <MapContainer center={[31.54764361241541, -8.756375278549186]} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <ZoomControl position="topright" />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            detectRetina={true}
          />

      {markers.map((marker, index) => (
        <Marker key={index} position={marker.position} icon={marker.color === 'blue' ? blueIcon : (marker.color === 'green' ? greenIcon : redIcon)}>
          <Popup>
            {marker.color} location <br/>
            <button onClick={(e) => {
              e.stopPropagation();  // This stops the click event from propagating to the map
              handleMarkerDelete(index);
            }}>Delete</button>
          </Popup>
        </Marker>
      ))}


          {itineraryMarkers.map((marker, index) => (
            <Marker key={index} position={marker} icon={blueIcon}>
              <Popup>Itinerary marker</Popup>
            </Marker>
          ))}

{geoJsonLayer && (
          <GeoJSON
            data={geoJsonLayer}
            style={() => ({
              color: geoJsonLayer.properties.fillColor,
              weight: 2,
              opacity: 0.65,
              fillOpacity: 0.7
            })}
          />
        )}

          <MapEvents />
        </MapContainer>
        {message && (
          <div className="message" style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', padding: '10px', backgroundColor: '#f8f8f8', border: '1px solid #ccc', borderRadius: '5px' }}>
            {message}
          </div>
        )}
        <div className="control-buttons">
          <button className="control-button" onClick={() => handleActionClick('startItinerary')} title="Start New Itinerary">
            <img src={startItineraryIcon} alt="Start Itinerary" />
          </button>
          <button className="control-button" onClick={() => handleActionClick('addSafe')} title="Add Safe Location">
            <img src={addSafeIcon} alt="Add Safe Location" />
          </button>
          <button className="control-button" onClick={() => handleActionClick('addDangerous')} title="Add Dangerous Location">
            <img src={addDangerousIcon} alt="Add Dangerous Location" />
          </button>
          <button className="control-button" onClick={calculateAndSetItinerary} title="Calculate Itinerary">
            <img src={calculateItineraryIcon} alt="Calculate Itinerary" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
