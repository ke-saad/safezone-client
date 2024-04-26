// itineraryService.jsx

import axios from 'axios';

const calculateItinerary = async (start, end) => {
  const options = {
    method: 'GET',
    url: 'https://trueway-directions2.p.rapidapi.com/FindDrivingRoute',
    params: {
      stops: `${start.lat},${start.lng};${end.lat},${end.lng}`,
    },
    headers: {
      'X-RapidAPI-Key': '550efd89f7msh39adebcaa98c6a6p1c9e7ajsnb49589b7185c',
      'X-RapidAPI-Host': 'trueway-directions2.p.rapidapi.com',
    },
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default calculateItinerary;
