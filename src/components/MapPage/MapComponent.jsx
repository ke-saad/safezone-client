import React, { useState } from 'react';
import { Map, Marker } from 'pigeon-maps'; 
import './MapComponent.css';

const MapComponent = () => {
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [popoverContent, setPopoverContent] = useState('');
  const [anchor, setAnchor] = useState(null);
  const [redMarkerPosition, setRedMarkerPosition] = useState(null);

  const handleMarkerMouseOver = (marker, event) => {
    setPopoverVisible(true);
    setPopoverContent(marker.text);
    setAnchor({ left: event.pageX, top: event.pageY });
  };

  const handleMarkerMouseOut = () => {
    setPopoverVisible(false);
  };

  const handleAddRedMarker = (event) => {
    // Check if right-clicked
    if (event.nativeEvent.which === 3) {
      // Get the position from the event
      const position = [event.latlng.lat, event.latlng.lng];
      setRedMarkerPosition(position);
    }
  };

  const markers = [
    {
      position: [51.505, -0.09],
      text: 'Marker 1',
    },
    {
      position: [51.51, -0.1],
      text: 'Marker 2',
    },
    {
      position: [51.515, -0.1],
      text: 'Marker 3',
    },
  ];

  return (
    <Map center={[51.505, -0.09]} zoom={13} height={400} onContextMenu={(event) => handleAddRedMarker(event)}>
      {markers.map((marker, index) => (
        <Marker
          key={index}
          anchor={marker.position}
          onMouseOver={(event) => handleMarkerMouseOver(marker, event)}
          onMouseOut={handleMarkerMouseOut}
        />
      ))}
      {redMarkerPosition && (
        <Marker anchor={redMarkerPosition} color="red" />
      )}
      {popoverVisible && (
        <div
          className="popover"
          style={{
            left: anchor.left,
            top: anchor.top,
          }}
        >
          {popoverContent}
        </div>
      )}
    </Map>
  );
};

export default MapComponent;
