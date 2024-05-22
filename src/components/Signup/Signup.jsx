import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { IoMdPerson, IoMdLock, IoMdEye, IoMdEyeOff } from "react-icons/io";
import { validatePassword } from "../utils/passwordValidator"; // Import the password validator
import { Input, Button, Typography, Card } from "@material-tailwind/react";
import SuccessDialog from '../Modals/SuccessDialog';
import ErrorModal from '../Modals/ErrorModal';

const Signup = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  const navigate = useNavigate();

  const toggleShowPassword = () => setShowPassword(!showPassword);
  const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password || !confirmPassword) {
      setErrorMessage("Username, password, and confirm password are required");
      setIsErrorModalOpen(true);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      setIsErrorModalOpen(true);
      return;
    }

    if (!validatePassword(password)) {
      setErrorMessage("Weak Password");
      setIsErrorModalOpen(true);
      return;
    }

    try {
      const response = await axios.post("http://localhost:3001/register", {
        username,
        password,
        isAdmin,
      });

      if (response.status === 201) {
        setUsername("");
        setPassword("");
        setConfirmPassword("");
        setIsAdmin(false);
        setSuccessMessage("User added successfully!");
        setIsSuccessModalOpen(true);
        setTimeout(() => {
          navigate('/viewallusers');
        }, 3000); // Delay for showing the success message before redirecting
      }
    } catch (error) {
      if (!error.response) {
        setErrorMessage("Network error, please try again later.");
      } else if (error.response.status === 400) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Internal server error");
      }
      setIsErrorModalOpen(true);
    }
  };

  return (
    <>
      <SuccessDialog 
        isOpen={isSuccessModalOpen} 
        onClose={() => {
          setIsSuccessModalOpen(false);
          navigate('/viewallusers');
        }} 
        successMessage={successMessage}
      />
      <ErrorModal 
        isOpen={isErrorModalOpen} 
        onClose={() => setIsErrorModalOpen(false)} 
        errorMessage={errorMessage}
      />
      <section
        className="flex items-center justify-center min-h-screen bg-cover bg-center"
        style={{ backgroundImage: 'url(/Map.png)' }}
      >
        <div className="navbar flex justify-between w-full p-4 bg-black shadow-md">
          <Link to="/login" className="text-white py-2 px-4 w-1/2 text-center rounded hover:text-black hover:bg-gray-300 transition">
            Logout
          </Link>
          <Link to="/admindashboard" className="text-white py-2 px-4 w-1/2 text-center rounded hover:text-black hover:bg-gray-300 transition">
            Dashboard
          </Link>
          <Link to="/viewallusers" className="text-white py-2 px-4 w-1/2 text-center rounded hover:text-black hover:bg-gray-300 transition">
            Users Management
          </Link>
        </div>

        <Card className="w-full max-w-md p-6 rounded-lg bg-white bg-opacity-90 shadow-lg">
          <form className="w-full" onSubmit={handleSubmit}>
            <div className="text-center mb-4">
              <img src="/Logo1.png" alt="Logo" className="mx-auto mb-4 w-20 h-20" />
              <Typography variant="h4" className="font-bold text-3xl font-serif text-black">Add User</Typography>
            </div>
            <div className="mb-4">
              <Typography variant="h4" className="font-medium text-black mb-1">Username</Typography>
              <div className="relative">
                <IoMdPerson size={24} className="absolute left-3 inset-y-0 my-auto text-black pointer-events-none" />
                <Input
                  id="username"
                  name="username"
                  size="lg"
                  placeholder="Username"
                  className="pl-12 border text-black border-gray-300 bg-transparent rounded-lg w-full h-14 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
            <div className="mb-4">
              <Typography variant="h4" className="font-medium text-black mb-1">Password</Typography>
              <div className="relative">
                <IoMdLock size={24} className="absolute left-3 inset-y-0 my-auto text-black pointer-events-none" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  size="lg"
                  placeholder="Password"
                  className="pl-12 border text-black border-gray-300 bg-transparent rounded-lg w-full h-14 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {showPassword ? (
                    <IoMdEyeOff size={24} onClick={toggleShowPassword} className="cursor-pointer text-black" />
                  ) : (
                    <IoMdEye size={24} onClick={toggleShowPassword} className="cursor-pointer text-black" />
                  )}
                </div>
              </div>
            </div>
            <div className="mb-4">
              <Typography variant="h4" className="font-medium text-black mb-1">Confirm Password</Typography>
              <div className="relative">
                <IoMdLock size={24} className="absolute left-3 inset-y-0 my-auto text-black pointer-events-none" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  size="lg"
                  placeholder="Confirm Password"
                  className="pl-12 border text-black border-gray-300 bg-transparent rounded-lg w-full h-14 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {showConfirmPassword ? (
                    <IoMdEyeOff size={24} onClick={toggleShowConfirmPassword} className="cursor-pointer text-black" />
                  ) : (
                    <IoMdEye size={24} onClick={toggleShowConfirmPassword} className="cursor-pointer text-black" />
                  )}
                </div>
              </div>
            </div>
            <div className="mb-4 flex items-center">
              <input
                id="isAdmin"
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="isAdmin" className="ml-2 text-sm font-medium text-gray-900 dark:text-black">Rendre Admin</label>
            </div>
            <div className="text-right mb-4">
              <Button type="submit" className="bg-black text-white p-3 rounded-lg w-full">
                Add User
              </Button>
            </div>
          </form>
        </Card>
      </section>
    </>
  );
};

export default Signup;
