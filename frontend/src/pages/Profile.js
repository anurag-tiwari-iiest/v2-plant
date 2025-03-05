import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";

const Profile = () => {
  const [plants, setPlants] = useState([]);
  const [advice, setAdvice] = useState("");

  // Fetch plant data from Flask API
    useEffect(() => {
        axios.get(`${API_URL}/get-plants`, {
            withCredentials: true,  // Ensures cookies are sent
            headers: { "Content-Type": "application/json" }  // Prevents issues with Flask
        })
        .then(response => {
            console.log("API Response:", response.data);  // Check what is returned
            if (Array.isArray(response.data)) {
            setPlants(response.data);
            } else {
            setPlants([]);  // ❌ Prevents crashes
            }
        })
        .catch(error => {
            console.error("Error fetching plants:", error);
        });
        }, []);
    

    const [userEmail, setUserEmail] = useState("");

    useEffect(() => {
        axios.get(`${API_URL}/get-user`, { withCredentials: true })
        .then(response => setUserEmail(response.data.email))
        .catch(error => console.error("Error fetching user:", error));
    }, []);
        

    const deletePlant = (id) => {
        axios.delete(`${API_URL}/delete-plant/${id}`, {
            withCredentials: true
          })
          .then(() => {
            setPlants(plants.filter(plant => plant.id !== id)); // Remove deleted plant from UI
          })
          .catch(error => console.error("⚠️ Error deleting plant:", error));
      };

  // Get care advice
  const getCareAdvice = (plant) => {
    axios.post(`${API_URL}/get-care`, {
      plant_type: plant.type,
      plant_age: plant.age_months,
      location: plant.location,
      plant_environment: plant.environment,
    })
    .then(response => setAdvice(response.data.message))
    .catch(error => console.error("Error fetching care advice:", error));
  };

  return (
    <div className="profile-wrapper">
    <br></br>

    <div className="container">
      <h2>👤 Your Profile</h2>
      <h3>Email: {userEmail}</h3> 
      <br></br>
    </div>


    <h3>🌿 Your Plants</h3>
      <table className="plant-table">
        <thead>
          <tr>
            <th>Plant Type</th>
            <th>Location</th>
            <th>Age (months)</th>
            <th>Environment</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {plants.map(plant => (
            <tr key={plant.id}>
              <td>{plant.type}</td>
              <td>{plant.location}</td>
              <td>{plant.age_months}</td>
              <td>{plant.environment}</td>
              <td>
                <button className="advice-btn" onClick={() => getCareAdvice(plant)}>🌱 Get Advice</button>
                <button className="delete-btn" onClick={() => deletePlant(plant.id)}>🗑️ Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Display Care Advice */}
      {advice && (
        <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc" }}>
          <h3>🌱 Plant Care Advice</h3>
          <p>{advice}</p>
        </div>
      )}
    </div>
  );
};

export default Profile;
