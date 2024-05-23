import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaSearch } from 'react-icons/fa';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 5;

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

  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-5 relative text-gray-800">
      <div className="fixed  top-0 left-0 w-full h-full bg-cover bg-center z-[-1]" style={{ backgroundImage: "url('/Map.png')" }}></div>
      <div className="navbar flex justify-between w-full p-4 bg-black shadow-md">

          <Link to="/admindashboard" className="text-white py-2 px-4 w-1/2 text-center rounded hover:text-black hover:bg-gray-300 transition">
            Dashboard
          </Link>
          <Link to="/viewallusers" className="text-white py-2 px-4 w-1/2 text-center rounded hover:text-black hover:bg-gray-300 transition">
            Users Management
          </Link>

        </div>

      <h2 className="text-4xl font-bold mt-36 mb-6 text-gray-900 shadow-lg px-4 py-2 rounded bg-white bg-opacity-80 border-b-4 b">
        Activity Logs
      </h2>
      <div className="w-3/5 bg-white rounded-lg shadow-lg mt-2">
        <div className="flex justify-between items-center p-4 bg-gray-800 rounded-t-lg">
          <div className="relative w-full">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="pl-10 pr-4 py-2 rounded-lg border  border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 "
              placeholder="Search by username"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-auto w-full bg-white bg-opacity-80 rounded-b-lg shadow-lg">
          <table className="min-w-full border-collapse table-fixed">
            <thead>
              <tr>
                <th className="border px-4 py-2 bg-gray-100 text-gray-700">Username</th>
                <th className="border px-4 py-2 bg-gray-100 text-gray-700">Action</th>
                <th className="border px-4 py-2 bg-gray-100 text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {currentLogs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-100 transition duration-200">
                  <td className="border px-4 py-2" style={{ width: '25%' }}>
                    <Link to={`/activitylogs/useractivitylog/${log.username}`} className="text-blue-500 hover:underline">
                      {log.username}
                    </Link>
                  </td>
                  <td className="border px-4 py-2" style={{ width: '50%' }}>{log.action}</td>
                  <td className="border px-4 py-2" style={{ width: '25%' }}>{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <nav aria-label="Page navigation" className="p-4 flex justify-center">
            <ul className="inline-flex items-center -space-x-px">
              <li>
                <button
                  className="py-2 px-3 ml-0 leading-tight text-black bg-white rounded-l-lg border border-gray-400 hover:bg-blue-500 hover:text-white"
                  onClick={() => paginate(currentPage > 1 ? currentPage - 1 : currentPage)}
                  disabled={currentPage === 1}
                >
                  <span className="sr-only">Previous</span>&#8592;
                </button>
              </li>
              {Array.from({ length: Math.ceil(filteredLogs.length / logsPerPage) }, (_, i) => (
                <li key={i}>
                  <button
                    onClick={() => paginate(i + 1)}
                    className={`py-2 px-3 leading-tight text-black bg-white border border-gray-400 ${currentPage === i + 1 ? "bg-blue-600 text-black" : "hover:bg-blue-500 hover:text-white"}`}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
              <li>
                <button
                  className="py-2 px-3 leading-tight text-black bg-white rounded-r-lg border border-gray-400 hover:bg-blue-500 hover:text-white"
                  onClick={() => paginate(currentPage < Math.ceil(filteredLogs.length / logsPerPage) ? currentPage + 1 : currentPage)}
                  disabled={currentPage === Math.ceil(filteredLogs.length / logsPerPage)}
                >
                  <span className="sr-only">Next</span>&#8594;
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;
