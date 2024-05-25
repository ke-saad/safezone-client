import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import userIcon from "../Images/userIcon.png";
import securityIcon from "../Images/securityIcon.png";
import dangerIcon from "../Images/dangerIcon.png";
import activityIcon from "../Images/activityIcon.png";
import alertIcon from "../Images/alertIcon.png";
import mapIcon from "../Images/mapIcon.png";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState("");

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
          const { role, username } = response.data;
          if (role === "admin") {
            setIsAdmin(true);
            setUsername(username);
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

  const handleManageUsers = () => {
    navigate("/viewAllusers");
  };

  const handleManageSecurityZones = () => {
    navigate("/viewAllsafezones");
  };

  const handleManageDangerZones = () => {
    navigate("/viewalldangerzones");
  };

  const handleManageActivityLogs = () => {
    navigate("/activitylogs");
  };

  const handleManageAlerts = () => {
    navigate("/alertspage");
  };

  const handleViewMap = () => {
    navigate("/map");
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full p-5 text-gray-800">
      <div
        className="fixed top-0 left-0 w-full h-full bg-cover bg-center "
        style={{ backgroundImage: "url('/Map.png')" }}
      ></div>
      <div className="navbar flex justify-between w-full p-4 bg-black shadow-md">
        <span
          className="text-white py-2 px-4  rounded hover:text-black hover:bg-gray-300 transition cursor-pointer flex-1 text-center"
          onClick={handleLogout}
        >
          Logout
        </span>
      </div>

      {isAdmin && (
        <div className="flex flex-col items-center justify-center w-full p-5">
          <h1 className="mb-8 text-4xl font-bold  text-white shadow-lg px-4 py-2 rounded">
            Admin Dashboard
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div
              className="w-64 h-64 p-5 bg-white bg-opacity-80 rounded-lg cursor-pointer flex flex-col items-center shadow-lg transition-transform transform hover:bg-opacity-100 hover:scale-105"
              onClick={handleManageUsers}
            >
              <img src={userIcon} alt="Manage Users" className="w-24              h-24 mb-3" />
              <p className="text-lg text-center text-gray-800">Manage Users</p>
            </div>
            <div
              className="w-64 h-64 p-5 bg-white bg-opacity-80 rounded-lg cursor-pointer flex flex-col items-center shadow-lg transition-transform transform hover:bg-opacity-100 hover:scale-105"
              onClick={handleManageSecurityZones}
            >
              <img src={securityIcon} alt="Manage Security Zones" className="w-24 h-24 mb-3" />
              <p className="text-lg text-center text-gray-800">Safe Zones</p>
            </div>
            <div
              className="w-64 h-64 p-5 bg-white bg-opacity-80 rounded-lg cursor-pointer flex flex-col items-center shadow-lg transition-transform transform hover:bg-opacity-100 hover:scale-105"
              onClick={handleManageDangerZones}
            >
              <img src={dangerIcon} alt="Manage Danger Zones" className="w-24 h-24 mb-3" />
              <p className="text-lg text-center text-gray-800">Danger Zones</p>
            </div>
            <div
              className="w-64 h-64 p-5 bg-white bg-opacity-80 rounded-lg cursor-pointer flex flex-col items-center shadow-lg transition-transform transform hover:bg-opacity-100 hover:scale-105"
              onClick={handleManageActivityLogs}
            >
              <img src={activityIcon} alt="Manage Activity Logs" className="w-24 h-24 mb-3" />
              <p className="text-lg text-center text-gray-800">Activity Logs</p>
            </div>
            <div
              className="w-64 h-64 p-5 bg-white bg-opacity-80 rounded-lg cursor-pointer flex flex-col items-center shadow-lg transition-transform transform hover:bg-opacity-100 hover:scale-105"
              onClick={handleManageAlerts}
            >
              <img src={alertIcon} alt="Manage Alerts" className="w-24 h-24 mb-3" />
              <p className="text-lg text-center text-gray-800">Alerts</p>
            </div>
            <div
              className="w-64 h-64 p-5 bg-white bg-opacity-80 rounded-lg cursor-pointer flex flex-col items-center shadow-lg transition-transform transform hover:bg-opacity-100 hover:scale-105"
              onClick={handleViewMap}
            >
              <img src={mapIcon} alt="View Map" className="w-24 h-24 mb-3" />
              <p className="text-lg text-center text-gray-800">Map</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

