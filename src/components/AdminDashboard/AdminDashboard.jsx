import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminDashboard.css";
import userIcon from "../Images/userIcon.png";
import securityIcon from "../Images/securityIcon.png";
import dangerIcon from "../Images/dangerIcon.png";
import activityIcon from "../Images/activityIcon.png";
import alertIcon from "../Images/alertIcon.png";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      axios.get("http://localhost:3001/user/role", {
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
    navigate("/");
  };

  const handleManageAccount = () => {
    navigate("/account");
  };

  const handleManageUsers = () => {
    navigate("/admin/users");
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

  const handleRegisterUser = () => {
    navigate("/register");
  };

  return (
    <div className="admin-dashboard-container">
      <div className="navbar">
        <a href="/" className="nav-link">Home</a>
        <div className="dropdown">
          <span className="dropdown-arrow" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            &#9660;
          </span>
          {isDropdownOpen && (
            <div className="dropdown-content">
              <span onClick={handleManageAccount}>Manage Account</span>
              <span onClick={handleLogout}>Logout</span>
            </div>
          )}
        </div>
      </div>
      {isAdmin && (
        <div className="center-content">
          <h1>Admin Dashboard</h1>
          <div className="card-container">
            <div className="card" onClick={handleManageUsers}>
              <img src={userIcon} alt="Manage Users" />
              <p>Manage Users</p>
            </div>
            <div className="card" onClick={handleManageSecurityZones}>
              <img src={securityIcon} alt="Manage Security Zones" />
              <p>Manage Security Zones</p>
            </div>
            <div className="card" onClick={handleManageDangerZones}>
              <img src={dangerIcon} alt="Manage Danger Zones" />
              <p>Manage Danger Zones</p>
            </div>
            <div className="card" onClick={handleManageActivityLogs}>
              <img src={activityIcon} alt="Manage Activity Logs" />
              <p>Manage Activity Logs</p>
            </div>
            <div className="card" onClick={handleManageAlerts}>
              <img src={alertIcon} alt="Manage Alerts" />
              <p>Manage Alerts</p>
            </div>
            <div className="card" onClick={handleRegisterUser}>
              <img src={userIcon} alt="Register User" /> {/* Assuming using userIcon for register */}
              <p>Register User</p>
            </div>
          </div>
        </div>
      )}
      <div className="background-image"></div>
    </div>
  );
};

export default AdminDashboard;
