import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminDashboard.css";
import userIcon from "../Images/userIcon.png";
import securityIcon from "../Images/securityIcon.png";
import dangerIcon from "../Images/dangerIcon.png";
import activityIcon from "../Images/activityIcon.png";
import alertIcon from "../Images/alertIcon.png";
import mapIcon from "../Images/mapIcon.png";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      axios
        .get("http://localhost:3001/user/role", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          const { role } = response.data;
          if (role === "admin") {
            setIsAdmin(true);
          } else {
            navigate("/accessdenied");
          }
        })
        .catch((error) => {
          console.error("Error fetching user role:", error);
          navigate("/login");
        });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleManageAccount = () => {
    navigate("/account");
  };

  const handleManageUsers = () => {
    navigate("/users-managing");
  };

  const handleManageSecurityZones = () => {
    navigate("/admin/securityzones");
  };

  const handleManageDangerZones = () => {
    navigate("/admin/dangerzones");
  };

  const handleManageActivityLogs = () => {
    navigate("/admin/activitylogs");
  };

  const handleManageAlerts = () => {
    navigate("/admin/alerts");
  };

  const handleViewMap = () => {
    navigate("/map");
  };

  return (
    <div className="admin-dashboard-container">
      <div className="navbar">
        <a href="/aboutus" className="nav-link">
          About Us
        </a>
        <span className="nav-link" onClick={handleManageAccount}>
          Manage Account
        </span>
        <span className="nav-link" onClick={handleLogout}>
          Logout
        </span>
      </div>
      {isAdmin && (
        <div className="center-content">
          <h1>Admin Dashboard</h1>
          <div className="background-wrapper">
            <div className="card-container">
              <div className="card" onClick={handleManageUsers}>
                <img src={userIcon} alt="Manage Users" />
                <p>Users</p>
              </div>
              <div className="card" onClick={handleManageSecurityZones}>
                <img src={securityIcon} alt="Manage Security Zones" />
                <p>Safe Zones</p>
              </div>
              <div className="card" onClick={handleManageDangerZones}>
                <img src={dangerIcon} alt="Manage Danger Zones" />
                <p>Danger Zones</p>
              </div>
              <div className="card" onClick={handleManageActivityLogs}>
                <img src={activityIcon} alt="Manage Activity Logs" />
                <p>Activity Logs</p>
              </div>
              <div className="card" onClick={handleManageAlerts}>
                <img src={alertIcon} alt="Manage Alerts" />
                <p>Alerts</p>
              </div>
              <div className="card" onClick={handleViewMap}>
                <img src={mapIcon} alt="View Map" />
                <p>Map</p>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="background-image"></div>
    </div>
  );
};

export default AdminDashboard;
