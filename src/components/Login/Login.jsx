import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import axios from "axios";


const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3001/login", {
        username,
        password,
      });
      const token = response.data.token;
      localStorage.setItem("token", token);
      console.log("Token stored:", token); // Log the token to verify storage
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
    <div className="login-container">
      <div className="navbar">
        <Link to="/" className="nav-link">
          Home
        </Link>
        <Link to="/register" className="nav-link">
          Sign Up
        </Link>
        <Link to="/aboutus" className="nav-link">
          About Us
        </Link>
      </div>
      <h2 className="login-title">Login</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="text"
          id="username"
          name="username"
          className="login-input"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <br />
        <input
          type="password"
          className="login-input"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <button type="submit" className="login-button">
          Login
        </button>
      </form>
      <Link to="/forgot-password" className="forgot-password-link">
        Forgot your password? Reset it
      </Link>
      <div className="background-image"></div>
    </div>
  );
};

export default Login;
