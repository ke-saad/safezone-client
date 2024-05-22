import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import { FaDownload } from 'react-icons/fa';

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
    <div className="flex flex-col items-center justify-center w-full h-full p-5 relative text-gray-800">
      <div className="absolute top-0 left-0 w-full h-full bg-cover bg-center z-[-1]" style={{ backgroundImage: "url('/Map.png')" }}></div>
      <div className="navbar flex justify-between w-full p-4 bg-black shadow-md">
        <Link to="/activitylogs" className="text-white py-2 px-4 w-1/3 text-center rounded hover:text-black hover:bg-gray-300 transition">
          Activity Logs
        </Link>
        <Link to="/admindashboard" className="text-white py-2 px-4 w-1/3 text-center rounded hover:text-black hover:bg-gray-300 transition">
          Dashboard
        </Link>
        <Link to="/login" className="text-white py-2 px-4 w-1/3 text-center rounded hover:text-black hover:bg-gray-300 transition">
          Logout
        </Link>
      </div>

      <h2 className="text-4xl font-bold mt-12 mb-6 text-gray-900 shadow-lg px-4 py-2 rounded bg-white bg-opacity-80 border-b-4 b">
        User Activity Log: {username}
      </h2>
      <div className="w-3/5 bg-white rounded-lg shadow-lg mt-2">
        <div className="flex justify-end items-center p-4 bg-gray-800 rounded-t-lg">
          <button
            className="text-white py-2 px-4 rounded bg-red-500 hover:bg-red-700 transition flex items-center"
            onClick={generatePDF}
          >
            <FaDownload className="mr-2" /> Download User Activity Log
          </button>
        </div>
        <div className="overflow-auto w-full bg-white bg-opacity-80 rounded-b-lg shadow-lg">
          <table className="min-w-full border-collapse table-fixed">
            <thead>
              <tr>
                <th className="border px-4 py-2 bg-gray-100 text-gray-700">Action</th>
                <th className="border px-4 py-2 bg-gray-100 text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-100 transition duration-200">
                  <td className="border px-4 py-2" style={{ width: '75%' }}>{log.action}</td>
                  <td className="border px-4 py-2" style={{ width: '25%' }}>{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserActivityLog;
