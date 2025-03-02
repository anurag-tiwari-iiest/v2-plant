import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";

const Login = ({ checkLoginStatus }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post("http://127.0.0.1:5000/login", { email, password }, { withCredentials: true })
          .then(() => {
            localStorage.setItem("isLoggedIn", "true");
            checkLoginStatus();  
            setTimeout(() => navigate("/"), 100);  // Small delay ensures state updates before redirect
          })
          .catch(() => alert("Login failed!"));
      };


    return (
        <div className="container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <label>Email:</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />

                <label>Password:</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />

                <button type="submit" className="auth-btn">Login</button>

                <p>Don't have an account? <Link to="/register">Register here</Link></p>
            </form>
        </div>
    );
};

export default Login;
