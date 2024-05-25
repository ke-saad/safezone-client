import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await axios.get('http://localhost:3001/alerts', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAlerts(response.data);
    } catch (error) {
      setMessage('Failed to fetch alerts.');
      console.error('Error:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-3xl p-6 bg-white shadow-md rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">All Alerts</h2>
          <div className="space-x-4">
            <Link to="/" className="text-blue-500 hover:underline">Home</Link>
            <Link to="/admindashboard" className="text-blue-500 hover:underline">Dashboard</Link>
            <Link to="/aboutus" className="text-blue-500 hover:underline">About Us</Link>
          </div>
        </div>
        {message && <div className="mb-4 text-red-500">{message}</div>}
        <table className="w-full mb-4 table-auto border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Type</th>
              <th className="border px-4 py-2">Message</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert) => (
              <tr key={alert._id}>
                <td className="border px-4 py-2">{alert._id}</td>
                <td className="border px-4 py-2">{alert.type}</td>
                <td className="border px-4 py-2">{alert.message}</td>
                <td className="border px-4 py-2">
                  <Link to={`/alert/${alert._id}`} className="text-blue-500 hover:underline">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AlertsPage;
