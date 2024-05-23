import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./AlertsPage.css";

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [message, setMessage] = useState("");

  const fetchAlerts = async () => {
    try {
      const response = await axios.get("http://localhost:3001/alerts");
      setAlerts(response.data);
    } catch (error) {
      setMessage("Failed to fetch alerts.");
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  return (
    <div className="alerts-page-container">
      <div className="navbar">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/admindashboard" className="nav-link">Dashboard</Link>
        <Link to="/aboutus" className="nav-link">About Us</Link>
      </div>
      <div className="background-overlay"></div>
      <div className="content">
        <h2 className="title">Alerts</h2>
        {message && <div className="message">{message}</div>}
        <div className="alerts-table-container">
          <table className="alerts-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Message</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr key={alert._id}>
                  <td>{alert.type}</td>
                  <td>{alert.message}</td>
                  <td>{alert.status}</td>
                  <td>
                    <Link to={`/alerts/${alert._id}`} className="view-button">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AlertsPage;
