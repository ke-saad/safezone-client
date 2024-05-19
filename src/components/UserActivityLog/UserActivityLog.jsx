import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import "./UserActivityLog.css";

const UserActivityLog = () => {
  const { username } = useParams();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchUserLogs = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/activityLogs/user/${username}`);
        setLogs(response.data);
      } catch (error) {
        console.error("Error fetching user activity logs:", error);
      }
    };

    fetchUserLogs();
  }, [username]);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text(`User Activity Log: ${username}`, 10, 10);
    logs.forEach((log, index) => {
      doc.text(`${index + 1}. ${log.action} - ${new Date(log.timestamp).toLocaleString()}`, 10, 20 + index * 10);
    });
    doc.save(`activity_log_${username}.pdf`);
  };

  return (
    <div className="user-activity-log-container">
      <div className="background-overlay"></div>
      <div className="navbar">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/admindashboard" className="nav-link">Dashboard</Link>
        <Link to="/aboutus" className="nav-link">About Us</Link>
      </div>
      <h1>User Activity Log: {username}</h1>
      <button className="download-button" onClick={generatePDF}>Download User Activity Log</button>
      <table className="logs-table">
        <thead>
          <tr>
            <th>Action</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log._id}>
              <td>{log.action}</td>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserActivityLog;
