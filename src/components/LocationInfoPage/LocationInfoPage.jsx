import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const LocationInfoPage = () => {
  const { lng, lat } = useParams();
  const [locationInfo, setLocationInfo] = useState(null);

  useEffect(() => {
    const fetchLocationInfo = async () => {
      try {
        const response = await axios.get('http://localhost:3001/mapbox/reverse-geocode', {
          params: {
            longitude: lng,
            latitude: lat,
          },
        });
        setLocationInfo(response.data.features[0]);
      } catch (error) {
        console.error("Error fetching location info:", error);
      }
    };

    fetchLocationInfo();
  }, [lng, lat]);

  if (!locationInfo) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Location Information</h1>
      <p><strong>Place Name:</strong> {locationInfo.place_name}</p>
      <p><strong>Coordinates:</strong> ({lat}, {lng})</p>
    </div>
  );
};

export default LocationInfoPage;