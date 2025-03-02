import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";

const Register = ({ checkLoginStatus }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post("http://127.0.0.1:5000/login", { email, password }, { withCredentials: true })
          .then(() => {
            localStorage.setItem("isLoggedIn", "true");
            checkLoginStatus();  
            setTimeout(() => navigate("/"), 100); 
          })
          .catch(() => alert("Login failed!"));
      };

    return (
        <div className="container">
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <label>Email:</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />

                <label>Password:</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />

                <button type="submit" className="auth-btn">Register</button>

                <p>Already have an account? <Link to="/login">Login here</Link></p>
            </form>
        </div>
    );
};

export default Register;
