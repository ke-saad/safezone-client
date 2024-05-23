import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { IoMdPerson, IoMdLock, IoMdEye, IoMdEyeOff } from "react-icons/io";
import { Input, Button, Typography, Card } from "@material-tailwind/react";
import SuccessDialog from '../Modals/SuccessDialog';
import ErrorModal from '../Modals/ErrorModal';

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const toggleShowPassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3001/login", {
        username,
        password,
      });
      const token = response.data.token;
      localStorage.setItem("token", token);
      setIsSuccessDialogOpen(true);
      setTimeout(() => {
        setIsSuccessDialogOpen(false);
        navigate("/admindashboard");
      }, 3000);
    } catch (error) {
      setErrorMessage("Invalid username or password");
      setIsErrorModalOpen(true);
      setTimeout(() => {
        setIsErrorModalOpen(false);
        setErrorMessage("");
      }, 3000);
    }
  };

  return (
    <>
      <SuccessDialog 
        isOpen={isSuccessDialogOpen} 
        onClose={() => setIsSuccessDialogOpen(false)} 
        successMessage="Login successful! Redirecting..."
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
        <Card className="w-full max-w-md p-10 rounded-lg bg-white bg-opacity-90 shadow-lg">
          <form className="w-full" onSubmit={handleSubmit}>
            <div className="text-center mb-6">
              <img src="/Logo1.png" alt="Logo" className="mx-auto mb-4 w-28 h-28" />
              <Typography variant="h4" className="font-bold text-4xl font-serif text-black">Login</Typography>
            </div>
            <div className="mb-6">
              <Typography variant="h6" className="font-medium text-black mb-2">Username</Typography>
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
            <div className="mb-6">
              <Typography variant="h6" className="font-medium text-black mb-2">Password</Typography>
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
            <Button type="submit" className="w-full bg-black text-white p-3 rounded-lg">
              Sign In
            </Button>
          </form>
        </Card>
      </section>
    </>
  );
};

export default Login;
