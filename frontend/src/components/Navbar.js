import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Navbar = ({ isLoggedIn, checkLoginStatus }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    axios.get("http://127.0.0.1:5000/logout", { withCredentials: true })
      .then(() => {
        localStorage.setItem("isLoggedIn", "false");
        checkLoginStatus();  // Updates Navbar instantly
        navigate("/login");
      })
      .catch(error => console.error("Logout failed", error));
  };

  return (
    <nav className="navbar">
      {/* Left Side Logo */}
      <div className="nav-left">
      <Link to="/" className="logo">
        {window.innerWidth <= 768 ? ( <button>Home</button> ) : ("🌱 Plant Care Assistant")}
       </Link>


      </div>

      {/* Middle Navigation - Hidden in Mobile */}
      <div className={`nav-links ${menuOpen ? "open" : ""}`}>
        <Link to="/pricing" onClick={() => setMenuOpen(false)}>Pricing</Link>
        <Link to="/whats-new" onClick={() => setMenuOpen(false)}>What's New?</Link>
        <Link to="/contact-us" onClick={() => setMenuOpen(false)}>Contact Us</Link>
      </div>

      {/* Right Side (Profile / Login) */}
      <div className="nav-right">
        {isLoggedIn ? (
          <div className="profile-dropdown">
            <button className="profile-icon">👤</button>
            <div className="dropdown-content">
              <button onClick={() => navigate("/profile")}>Profile</button>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          </div>
        ) : (
          <Link to="/login" className="login-btn">Login</Link>
        )}

        {/* Hamburger Menu Button */}
        {window.innerWidth <= 768 && (
            <div className="hamburger-dropdown">
                <button className="hamburger">☰</button>
                <div className="dropdown-content">
                    <Link to="/pricing" onClick={() => setMenuOpen(false)}>Pricing</Link>
                    <Link to="/whats-new" onClick={() => setMenuOpen(false)}>What's New?</Link>
                    <Link to="/contact-us" onClick={() => setMenuOpen(false)}>Contact Us</Link>
                </div>
            </div>
        )}

      </div>
    </nav>
  );
};

export default Navbar;
