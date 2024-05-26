import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaTrashAlt, FaInfoCircle, FaPlus } from 'react-icons/fa';
import AddDangerZoneModal from "../Modals/AddDangerZoneModal";
import ViewUpdateDangerZoneModal from "../Modals/ViewUpdateDangerZoneModal";
import DeleteConfirmationDialog from "../Modals/DeleteConfirmationDialog";

const ViewAllDangerZones = () => {
  const [dangerZones, setDangerZones] = useState([]);
  const [filteredDangerZones, setFilteredDangerZones] = useState([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const dangerZonesPerPage = 5;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDangerZones = async () => {
      try {
        const response = await axios.get("http://localhost:3001/dangerzones");
        setDangerZones(response.data);
        setFilteredDangerZones(response.data);
      } catch (error) {
        setError("Failed to fetch danger zones.");
      }
    };

    fetchDangerZones();
  }, []);

  const indexOfLastDangerZone = currentPage * dangerZonesPerPage;
  const indexOfFirstDangerZone = indexOfLastDangerZone - dangerZonesPerPage;
  const currentDangerZones = filteredDangerZones.slice(indexOfFirstDangerZone, indexOfLastDangerZone);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDelete = (id) => {
    setSelectedZoneId(id);
    setIsConfirmationModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:3001/dangerzones/${selectedZoneId}`);
      setDangerZones(dangerZones.filter(dangerZone => dangerZone._id !== selectedZoneId));
      setFilteredDangerZones(filteredDangerZones.filter(dangerZone => dangerZone._id !== selectedZoneId));
      setIsConfirmationModalOpen(false);
    } catch (error) {
      setError("Failed to delete danger zone.");
    }
  };

  const handleEdit = (id) => {
    setSelectedZoneId(id);
    setIsUpdateModalOpen(true);
  };

  const handleAdd = () => {
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false);
  };

  const closeConfirmationModal = () => {
    setIsConfirmationModalOpen(false);
  };

  const handleSave = () => {
    setIsAddModalOpen(false);
    setIsUpdateModalOpen(false);
    axios.get("http://localhost:3001/dangerzones").then(response => {
      setDangerZones(response.data);
      setFilteredDangerZones(response.data);
    }).catch(error => {
      setError("Failed to fetch danger zones.");
    });
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-5 relative text-gray-800">
      <div className="fixed top-0 left-0 w-full h-full bg-cover bg-center z-[-1]" style={{ backgroundImage: "url('/Map.png')" }}></div>
      <div className="navbar flex justify-between w-full p-4 bg-black shadow-md">
        <Link to="/map" className="text-white py-2 px-4 w-1/3 text-center rounded hover:text-black hover:bg-gray-300 transition">Map</Link>
        <Link to="/admindashboard" className="text-white py-2 px-4 w-1/3 text-center rounded hover:text-black hover:bg-gray-300 transition">Dashboard</Link>
        <Link to="/viewallsafezones" className="text-white py-2 px-4 w-1/3 text-center rounded hover:text-black hover:bg-gray-300 transition">Safe Zones Management</Link>
      </div>
      <h2 className="text-4xl font-bold mt-36 mb-6 text-gray-900 shadow-lg px-4 py-2 rounded bg-white bg-opacity-80"> Danger Zones Management</h2>
      <div className="w-2/5 bg-white rounded-lg shadow-lg mt-2">
        <div className="flex justify-between items-center p-4 bg-gray-800 rounded-t-lg">
          <button
            className="bg-green-500 text-white py-2 px-4 rounded shadow-md hover:bg-green-700 transition flex items-center"
            onClick={handleAdd}
          >
            <FaPlus className="mr-2" /> Add Danger Zone
          </button>
        </div>
        {error && <div className="text-red-600 mb-4 px-4">{error}</div>}
        <div className="overflow-auto w-full bg-white bg-opacity-80 rounded-b-lg shadow-lg">
          <table className="min-w-full border-collapse table-fixed">
            <thead>
              <tr>
                <th className="border px-4 py-2 bg-gray-100 text-gray-700">Zone</th>
                <th className="border px-4 py-2 bg-gray-100 text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentDangerZones.map((dangerZone, index) => (
                <tr key={dangerZone._id} className="hover:bg-gray-100 transition duration-200">
                  <td className="border px-4 py-2 text-center font-bold">Zone {index + 1}</td>
                  <td className="border px-4 py-2">
                    <div className="flex justify-center items-center space-x-2">
                      <button onClick={() => handleEdit(dangerZone._id)} className="bg-blue-500 text-white py-2 px-4 rounded shadow-md hover:bg-blue-700 transition flex items-center">
                        <FaInfoCircle className="mr-2" /> Edit
                      </button>
                      <button onClick={() => handleDelete(dangerZone._id)} className="bg-red-500 text-white py-2 px-4 rounded shadow-md hover:bg-red-700 transition flex items-center">
                        <FaTrashAlt className="mr-2" /> Delete
                      </button>
                    </div>
                  </td>
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
              {Array.from({ length: Math.ceil(filteredDangerZones.length / dangerZonesPerPage) }, (_, i) => (
                <li key={i}>
                  <button
                    onClick={() => paginate(i + 1)}
                    className={`py-2 px-3 leading-tight text-white bg-black border border-gray-400 ${currentPage === i + 1 ? "bg-blue-600 text-white" : "hover:bg-blue-500 hover:text-white"}`}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
              <li>
                <button
                  className="py-2 px-3 leading-tight text-black bg-white rounded-r-lg border border-gray-400 hover:bg-blue-500 hover:text-white"
                  onClick={() => paginate(currentPage < Math.ceil(filteredDangerZones.length / dangerZonesPerPage) ? currentPage + 1 : currentPage)}
                  disabled={currentPage === Math.ceil(filteredDangerZones.length / dangerZonesPerPage)}
                >
                  <span className="sr-only">Next</span>&#8594;
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <AddDangerZoneModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        onSave={handleSave}
      />
      <ViewUpdateDangerZoneModal
        isOpen={isUpdateModalOpen}
        onClose={closeUpdateModal}
        zoneId={selectedZoneId}
        onSave={handleSave}
      />
      <DeleteConfirmationDialog
        isOpen={isConfirmationModalOpen}
        onClose={closeConfirmationModal}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default ViewAllDangerZones;
