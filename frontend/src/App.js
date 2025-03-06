import React, { useEffect, useState } from "react";
import "./styles.css";
import { API_URL } from "./config";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import WhatsNew from "./pages/WhatsNew";
import ContactUs from "./pages/ContactUs";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Pricing from "./pages/Pricing";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");

  // Check if user is logged in
  const checkLoginStatus = () => {
    axios.get(`${API_URL}/get-user`, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json"  // Ensures the request is JSON
      }
    })
      .then(() => {
        setIsLoggedIn(true);
        localStorage.setItem("isLoggedIn", "true");
      })
      .catch(() => {
        setIsLoggedIn(false);
        localStorage.setItem("isLoggedIn", "false");
      });
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);
  

  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} checkLoginStatus={checkLoginStatus} />
      <Routes>
        {/* Redirect to login if not logged in */}
        <Route path="/" element={isLoggedIn ? <Home /> : <Navigate to="/login" replace />} />
        <Route path="/profile" element={isLoggedIn ? <Profile /> : <Navigate to="/login" replace />} />
        <Route path="/whats-new" element={isLoggedIn ? <WhatsNew /> : <Navigate to="/login" replace />} />
        <Route path="/contact-us" element={isLoggedIn ? <ContactUs /> : <Navigate to="/login" replace />} />
        <Route path="/pricing" element={isLoggedIn ? <Pricing /> : <Navigate to="/login" replace />} />

        <Route path="/login" element={<Login checkLoginStatus={checkLoginStatus} />} />
        <Route path="/register" element={<Register checkLoginStatus={checkLoginStatus} />} />
      </Routes>
    </Router>
  );
};

export default App;
