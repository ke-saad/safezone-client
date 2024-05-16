import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { IoMdPerson, IoMdLock, IoMdEye, IoMdEyeOff } from "react-icons/io";
import { Input, Button, Typography, Card } from "@material-tailwind/react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
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
      setError("");
      navigate("/admindashboard");
    } catch (error) {
      setError("Invalid username or password");
      setTimeout(() => {
        setError("");
      }, 3000);
    }
  };

  return (
    <section
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: 'url(/world_map.jpg)' }}
    >
<div className="navbar flex justify-between w-full p-4 bg-gray-800 shadow-md">
  <Link to="/login" className="text-white py-2 px-4 w-1/2 text-center rounded hover:bg-gray-700 transition">
    Login
  </Link>
  <Link to="/aboutus" className="text-white py-2 px-4 w-1/2 text-center rounded hover:bg-gray-700 transition">
    About Us
  </Link>
</div>

      <Card className="w-full max-w-md p-10 rounded-lg bg-white bg-opacity-90 shadow-lg">
        <div className="text-center mb-8">
          <img src="/public/Logo1.png" alt="Logo" className="mx-auto h-24 w-auto mb-4"/>
          <Typography variant="h4" className="font-bold text-black">Sign In</Typography>
        </div>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form className="w-full" onSubmit={handleSubmit}>
          <div className="mb-6">
          <Typography variant="small" className="font-medium text-black mb-2 block pr-96">Username</Typography>
            <div className="relative">
              <IoMdPerson size={24} className="absolute left-3 inset-y-0 my-auto text-black" />
              <Input
                id="username"
                name="username"
                size="lg"
                placeholder="Username"
                className="pl-12 border border-gray-300 rounded-lg w-full h-12"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>
          <div className="mb-6">
            <Typography variant="small" className="font-medium text-black mb-2 block pr-96">Password</Typography>
            <div className="relative">
              <IoMdLock size={24} className="absolute left-3 inset-y-0 my-auto text-black" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                size="lg"
                placeholder="Password"
                className="pl-12 border border-gray-300 rounded-lg w-full h-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {showPassword ? (
                  <IoMdEyeOff size={24} onClick={toggleShowPassword} className="cursor-pointer text-gray-400" />
                ) : (
                  <IoMdEye size={24} onClick={toggleShowPassword} className="cursor-pointer text-gray-400" />
                )}
              </div>
            </div>
          </div>
          <div className="text-right mb-6">
            <Button type="submit" className="mb-6 bg-black text-white p-3 rounded-lg" fullWidth>
              Sign In
            </Button>
          </div>
        
        </form>
      </Card>
    </section>
  );
};

export default Login;
