import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import SuccessDialog from '../Modals/SuccessDialog';
import ErrorModal from '../Modals/ErrorModal';
import ConfirmationDialog from '../Modals/ConfirmationDialog';

const UserInformation = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/users/username/${userId}`);
        setUser(response.data);
        setNewUsername(response.data.username);
        setIsAdmin(response.data.isAdmin);
      } catch (error) {
        console.error("Error fetching user:", error);
        setErrorMessage("Failed to fetch user");
        setIsErrorModalOpen(true);
      }
    };

    fetchUser();
  }, [userId]);

  const handleUpdateUser = async () => {
    try {
      if (!newUsername && !newPassword && isAdmin === user.isAdmin) {
        setErrorMessage("Please update at least one field");
        setIsErrorModalOpen(true);
        return;
      }

      const updatedUser = {
        ...(newUsername && { username: newUsername }),
        ...(newPassword && { newPassword }), // Send newPassword if provided
        ...(isAdmin !== user.isAdmin && { isAdmin }),
      };

      const token = localStorage.getItem('token'); // Retrieve the token
      const response = await axios.put(`http://localhost:3001/users/${user._id}`, updatedUser, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(response.data);
      setNewUsername("");
      setNewPassword("");
      setErrorMessage("");
      setSuccessMessage("User information updated successfully");
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error("Error updating user:", error);
      setErrorMessage("Failed to update user");
      setIsErrorModalOpen(true);
    }
  };

  const openConfirmationDialog = () => {
    setIsConfirmationDialogOpen(true);
  };

  const closeConfirmationDialog = () => {
    setIsConfirmationDialogOpen(false);
  };

  const confirmUpdateUser = () => {
    closeConfirmationDialog();
    handleUpdateUser();
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative w-full h-screen flex items-center justify-center p-5 text-gray-800">
      <div className="fixed top-0 left-0 w-full h-full bg-cover bg-center z-[-1]" style={{ backgroundImage: "url('/Map.png')" }}></div>
      <div className="navbar flex justify-between w-full p-4 bg-black shadow-md mb-6">
        <Link to="/viewallusers" className="text-white py-2 px-4 w-1/2 text-center rounded hover:text-black hover:bg-gray-300 transition">
          View All Users
        </Link>
        <Link to="/admindashboard" className="text-white py-2 px-4 w-1/2 text-center rounded hover:text-black hover:bg-gray-300 transition">
          Dashboard
        </Link>
      </div>
      <div className="w-full max-w-xl bg-white bg-opacity-90 rounded-lg shadow-lg p-6">
        <h2 className="text-4xl font-bold mb-4 text-gray-900 text-center">User Information</h2>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Username:</label>
          <span>{user.username}</span>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Administrative Privileges:</label>
          <span>{user.isAdmin ? "Yes" : "No"}</span>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="newUsername">New Username:</label>
          <input
            type="text"
            id="newUsername"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="newPassword">New Password:</label>
          <input
            type="password"
            id="newPassword"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="isAdmin">Administrative Privileges:</label>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAdmin"
              className="form-checkbox h-5 w-5 text-blue-600 transition duration-150 ease-in-out"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
            />
            <span className="ml-2 text-gray-700">Admin</span>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
            onClick={openConfirmationDialog}
          >
            Update User
          </button>
        </div>
      </div>
      <SuccessDialog 
        isOpen={isSuccessModalOpen} 
        onClose={() => setIsSuccessModalOpen(false)} 
        successMessage={successMessage}
      />
      <ErrorModal 
        isOpen={isErrorModalOpen} 
        onClose={() => setIsErrorModalOpen(false)} 
        errorMessage={errorMessage}
      />
      <ConfirmationDialog 
        isOpen={isConfirmationDialogOpen}
        onClose={closeConfirmationDialog}
        onConfirm={confirmUpdateUser}
      />
    </div>
  );
};

export default UserInformation;
