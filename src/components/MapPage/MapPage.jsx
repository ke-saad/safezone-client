import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Map, Marker } from 'pigeon-maps'; 
import './MapPage.css'; 

const MapPage = () => {
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupContent, setPopupContent] = useState('');
  const [popupAnchor, setPopupAnchor] = useState(null);
  const [redMarkerPosition, setRedMarkerPosition] = useState(null);

  const handleMarkerMouseOver = (markerProps) => {
    setPopupVisible(true);
    setPopupContent(markerProps.payload.content);
    setPopupAnchor(markerProps.anchor);
  };

  const handleMarkerMouseOut = () => {
    setPopupVisible(false);
  };

  const handleAddRedMarker = (e) => {
    // Check if right-clicked
    if (e.originalEvent.button === 2) {
      // Get the position from the event
      const position = [e.latlng.lat, e.latlng.lng];
      setRedMarkerPosition(position);
    }
  };

  return (
    <div>
      <div className="navbar">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/login" className="nav-link">Login</Link>
        <Link to="/aboutus" className="nav-link">About Us</Link>
      </div>
      <h2 className="map-title">World Map</h2>
      <div id="map" className="pigeon-map">
        <Map center={[31.54764361241541, -8.756375278549186]} zoom={13} height={window.innerHeight} onContextMenu={handleAddRedMarker}>
          {/* Existing marker */}
          <Marker
            anchor={[31.54764361241541, -8.756375278549186]}
            payload={{ content: 'Popup Content' }}
            onMouseOver={handleMarkerMouseOver}
            onMouseOut={handleMarkerMouseOut}
          />
          {/* Red marker */}
          {redMarkerPosition && (
            <Marker anchor={redMarkerPosition} color="red" />
          )}
          {popupVisible && (
            <div className="popup" style={{ left: popupAnchor[0], top: popupAnchor[1] }}>
              {popupContent}
            </div>
          )}
        </Map>
      </div>
    </div>
  );
};

export default MapPage;
