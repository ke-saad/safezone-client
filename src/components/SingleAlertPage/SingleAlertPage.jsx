import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';

const SingleAlertPage = () => {
  const { alertId } = useParams();
  const navigate = useNavigate();
  const [alert, setAlert] = useState(null);
  const [pendingZone, setPendingZone] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAlert();
    fetchPendingZone();
  }, [alertId]);

  const fetchAlert = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/alerts/${alertId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAlert(response.data);
    } catch (error) {
      setMessage('Failed to fetch alert details.');
      console.error('Error:', error);
    }
  };

  const fetchPendingZone = async () => {
    try {
      const url = alert?.zoneType === 'danger'
        ? `http://localhost:3001/pending-dangerzone/${alertId}`
        : `http://localhost:3001/pending-safezone/${alertId}`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPendingZone(response.data);
    } catch (error) {
      setMessage('Failed to fetch pending zone details.');
      console.error('Error:', error);
    }
  };

  const handleApproval = async (action) => {
    const url = alert?.zoneType === 'danger'
      ? `http://localhost:3001/dangerzones/${action}/${pendingZone._id}`
      : `http://localhost:3001/safezones/${action}/${pendingZone._id}`;
    try {
      await axios.put(url, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMessage(`Zone ${action}d successfully.`);
      setTimeout(() => navigate('/alerts'), 1500);
    } catch (error) {
      setMessage(`Failed to ${action} zone.`);
      console.error('Error:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-3xl p-6 bg-white shadow-md rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Alert Details</h2>
          <div className="space-x-4">
            <Link to="/" className="text-blue-500 hover:underline">Home</Link>
            <Link to="/admindashboard" className="text-blue-500 hover:underline">Dashboard</Link>
            <Link to="/aboutus" className="text-blue-500 hover:underline">About Us</Link>
          </div>
        </div>
        {message && <div className="mb-4 text-red-500">{message}</div>}
        {alert ? (
          <div className="mb-4">
            <p><strong>ID:</strong> {alert._id}</p>
            <p><strong>Type:</strong> {alert.type}</p>
            <p><strong>Message:</strong> {alert.message}</p>
          </div>
        ) : (
          <p>Loading alert details...</p>
        )}
        {pendingZone ? (
          <div>
            <h3 className="text-xl font-semibold mb-2">Pending {alert.zoneType === 'danger' ? 'Danger' : 'Safe'} Zone Details:</h3>
            <table className="w-full mb-4 table-auto border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-4 py-2">Location</th>
                  <th className="border px-4 py-2">Coordinates</th>
                </tr>
              </thead>
              <tbody>
                {pendingZone.markers.map((marker, index) => (
                  <tr key={index}>
                    <td className="border px-4 py-2">{marker.place_name || 'Unknown location'}</td>
                    <td className="border px-4 py-2">{marker.coordinates.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end space-x-4">
              <button className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700" onClick={() => handleApproval('approve')}>Approve</button>
              <button className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700" onClick={() => handleApproval('disapprove')}>Disapprove</button>
            </div>
          </div>
        ) : (
          <p>Loading pending zone details...</p>
        )}
      </div>
    </div>
  );
};

export default SingleAlertPage;
