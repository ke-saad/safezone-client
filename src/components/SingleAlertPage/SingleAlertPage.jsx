import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './SingleAlertPage.css';

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
    <div className="single-alert-page-container">
      <div className="navbar">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/admindashboard" className="nav-link">Dashboard</Link>
        <Link to="/aboutus" className="nav-link">About Us</Link>
      </div>
      <div className="background-overlay"></div>
      <div className="content">
        <h2 className="title">Alert Details</h2>
        {message && <div className="message">{message}</div>}
        {alert ? (
          <div className="alert-details">
            <p><strong>ID:</strong> {alert._id}</p>
            <p><strong>Type:</strong> {alert.type}</p>
            <p><strong>Message:</strong> {alert.message}</p>
          </div>
        ) : (
          <p>Loading alert details...</p>
        )}
        {pendingZone ? (
          <div className="pending-zone-details">
            <h3>Pending {alert.zoneType === 'danger' ? 'Danger' : 'Safe'} Zone Details:</h3>
            <table className="markers-table">
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Coordinates</th>
                </tr>
              </thead>
              <tbody>
                {pendingZone.markers.map((marker, index) => (
                  <tr key={index}>
                    <td>{marker.place_name || 'Unknown location'}</td>
                    <td>{marker.coordinates.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="button-group">
              <button className="approve-button" onClick={() => handleApproval('approve')}>Approve</button>
              <button className="disapprove-button" onClick={() => handleApproval('disapprove')}>Disapprove</button>
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
