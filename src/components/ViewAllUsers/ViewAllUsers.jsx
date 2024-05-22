import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaUserPlus, FaEdit, FaTrashAlt, FaSearch } from 'react-icons/fa';
import DeleteConfirmationDialog from '../Modals/DeleteConfirmationDialog';
import SuccessDialog from '../Modals/SuccessDialog';

const ViewAllUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);
  const usersPerPage = 5;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:3001/users");
        const sortedUsers = response.data.sort((a, b) =>
          a.username.localeCompare(b.username)
        ); // Sort users alphabetically by username
        setUsers(sortedUsers);
        setFilteredUsers(sortedUsers);
      } catch (error) {
        setError("Failed to fetch users");
      }
    };

    fetchUsers();
  }, []);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleEdit = (username) => {
    navigate(`/userinformation/${username}`);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:3001/users/${userIdToDelete}`);
      setUsers(users.filter(user => user._id !== userIdToDelete));
      setFilteredUsers(filteredUsers.filter(user => user._id !== userIdToDelete));
      setIsDeleteDialogOpen(false);
      setIsSuccessDialogOpen(true);
      setUserIdToDelete(null);
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = users.filter(user => user.username.toLowerCase().includes(query));
    setFilteredUsers(filtered);
  };

  const openDeleteDialog = (userId) => {
    setUserIdToDelete(userId);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-5 relative text-gray-800">
      <div className="absolute top-0 left-0 w-full h-full bg-cover bg-center z-[-1]" style={{ backgroundImage: "url('/Map.png')" }}></div>
      <div className="navbar flex justify-between w-full p-4 bg-black shadow-md">
        <Link to="/login" className="text-white py-2 px-4 w-1/2 text-center rounded hover:text-black hover:bg-gray-300 transition">
          Logout
        </Link>
        <Link to="/admindashboard" className="text-white py-2 px-4 w-1/2 text-center rounded hover:text-black hover:bg-gray-300 transition">
          Dashboard
        </Link>
      </div>
      <h2 className="text-4xl font-bold mt-12 mb-6 text-gray-900 shadow-lg px-4 py-2 rounded bg-white bg-opacity-80">
        Users Management
      </h2>
      <div className="w-3/5 bg-white rounded-lg shadow-lg mt-2">
        <div className="flex justify-between items-center p-4 bg-gray-800 rounded-t-lg">
          <div className="flex space-x-2">
            <button
              className="bg-red-500 text-white py-2 px-4 rounded shadow-md hover:bg-red-700 transition flex items-center"
              onClick={() => navigate('/register')}
            >
              <FaUserPlus className="mr-2" /> Add User
            </button>
          </div>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search by username"
              onChange={handleSearch}
            />
          </div>
        </div>
        {error && <div className="text-red-600 mb-4 px-4">{error}</div>}
        <div className="overflow-auto w-full bg-white bg-opacity-80 rounded-b-lg shadow-lg">
          <table className="min-w-full border-collapse table-fixed">
            <thead>
              <tr>
                <th className="border px-4 py-2 bg-gray-100 text-gray-700">ID</th>
                <th className="border px-4 py-2 bg-gray-100 text-gray-700">Username</th>
                <th className="border px-4 py-2 bg-gray-100 text-gray-700">Admin</th>
                <th className="border px-4 py-2 bg-gray-100 text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-100 transition duration-200">
                  <td className="border px-4 py-2" style={{ width: '25%' }}>{user._id}</td>
                  <td className="border px-4 py-2" style={{ width: '25%' }}>{user.username}</td>
                  <td className="border px-4 py-2" style={{ width: '20%' }}>
                    <span className={`inline-block px-2 py-1 text-sm font-semibold rounded-full ${user.isAdmin ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                      {user.isAdmin ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="border px-4 py-2" style={{ width: '10%' }}>
                    <div className="flex justify-center items-center space-x-2">
                      <button onClick={() => handleEdit(user.username)} className="text-blue-500 hover:text-blue-700 transition">
                        <FaEdit />
                      </button>
                      <button onClick={() => openDeleteDialog(user._id)} className="text-red-500 hover:text-red-700 transition">
                        <FaTrashAlt />
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
              {Array.from({ length: Math.ceil(filteredUsers.length / usersPerPage) }, (_, i) => (
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
                  onClick={() => paginate(currentPage < Math.ceil(filteredUsers.length / usersPerPage) ? currentPage + 1 : currentPage)}
                  disabled={currentPage === Math.ceil(filteredUsers.length / usersPerPage)}
                >
                  <span className="sr-only">Next</span>&#8594;
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
      />
      <SuccessDialog
        isOpen={isSuccessDialogOpen}
        onClose={() => setIsSuccessDialogOpen(false)}
        successMessage="User deleted successfully!"
      />
    </div>
  );
};

export default ViewAllUsers;
