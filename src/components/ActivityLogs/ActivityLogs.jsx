import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./ActivityLogs.css";

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredLogs, setFilteredLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get("http://localhost:3001/activityLogs");
        setLogs(response.data);
        setFilteredLogs(response.data);
      } catch (error) {
        console.error("Error fetching activity logs:", error);
      }
    };

    fetchLogs();
  }, []);

  useEffect(() => {
    const filtered = logs.filter((log) =>
      log.username ? log.username.toLowerCase().includes(searchQuery.toLowerCase()) : false
    );
    setFilteredLogs(filtered);
  }, [searchQuery, logs]);

  return (
    <div className="activity-logs-container">
      <div className="background-overlay"></div>
      <div className="navbar">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/admindashboard" className="nav-link">Dashboard</Link>
        <Link to="/aboutus" className="nav-link">About Us</Link>
      </div>
      <h1>Activity Logs</h1>
      <input
        type="text"
        className="search-input"
        placeholder="Search by username"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <table className="logs-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Action</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.map((log) => (
            <tr key={log._id}>
              <td>
                <Link to={`/activitylogs/useractivitylog/${log.username}`}>
                  {log.username}
                </Link>
              </td>
              <td>{log.action}</td>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ActivityLogs;
