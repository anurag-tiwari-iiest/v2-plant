import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { useNavigate } from "react-router-dom";


const Home = () => {

  const navigate = useNavigate();
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      navigate("/login");  // Redirect if not logged in
    }
  }, [navigate]);

  // Plant Care State
  const [location, setLocation] = useState("");
  const [plantType, setPlantType] = useState("");
  const [plantAge, setPlantAge] = useState("");
  const [plantEnvironment, setPlantEnvironment] = useState("");
  const [result, setResult] = useState("");
  const [addMessage, setAddMessage] = useState("");
  const [weatherData, setWeatherData] = useState(null);


  // Chatbot State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  // Toggle Chatbot Visibility
  const toggleChat = () => setChatOpen(!chatOpen);

  // Send Message to Chatbot
  const sendMessage = () => {
    if (!chatMessage.trim()) return;  // Prevent empty messages

    // Add user message to chat history
    setChatHistory(prev => [...prev, { type: "user", text: chatMessage }]);

    // Send message to backend
    axios.post(`${API_URL}/chatbot`, { message: chatMessage })
      .then(response => {
        setChatHistory(prev => [...prev, { type: "bot", text: response.data.response }]);
      })
      .catch(() => {
        setChatHistory(prev => [...prev, { type: "bot", text: "⚠️ Error getting chatbot response." }]);
      });

    // Clear input field
    setChatMessage("");
};

  // Handle Plant Care Advice Request
  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post(`${API_URL}/get-care`, {
        location,
        plant_type: plantType,
        plant_age: plantAge,
        plant_environment: plantEnvironment
      })
      .then(response => {
        setResult(response.data.message); 
        setWeatherData(response.data.weather);
      })
      .catch(error => setResult("⚠️ Error fetching care advice."));
  };

  // Handle Adding a Plant
  const handleAddPlant = () => {
    console.log("📤 Sending request to add plant...", {
      location,
      plant_type: plantType,
      plant_age: plantAge,
      environment: plantEnvironment
    });
  
    axios.post(`${API_URL}/add-plant`, 
      {
        location,
        plant_type: plantType,
        plant_age: plantAge,
        environment: plantEnvironment
      }, 
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" }  // ✅ Fixes unsupported media type issue
      }
    )
    .then(response => {
      console.log("✅ Response received:", response.data);
  
      if (response.data.duplicate) {
        if (window.confirm("This plant already exists! Do you still want to add it?")) {
          axios.post(`${API_URL}/add-plant`, 
            {
              location,
              plant_type: plantType,
              plant_age: plantAge,
              environment: plantEnvironment
            }, 
            {
              withCredentials: true,
              headers: { "Content-Type": "application/json" }
            }
          )
          .then(res => setAddMessage(res.data.message))
          .catch(err => {
            console.error("⚠️ Error adding duplicate plant:", err);
            setAddMessage("⚠️ Error adding duplicate plant.");
          });
        }
      } else {
        setAddMessage(response.data.message);
      }
    })
    .catch(error => {
      console.error("🚨 Error adding plant:", error.response?.data || error.message);
      setAddMessage("⚠️ Error adding plant.");
    });
  };
  

  return (
    <div className="container">
      <h1>🌱 Virtual Plant Care Assistant</h1>
      <form onSubmit={handleSubmit}>
      <label>📍 Location:</label>
        <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Enter location or 6-digit Pin-code" required />


        <label>🌿 Plant Type:</label>
        <select value={plantType} onChange={e => setPlantType(e.target.value)} required>
            <option value="">Select a plant type</option>
            <option value="Succulent">Succulent</option>
            <option value="Fern">Fern</option>
            <option value="Cactus">Cactus</option>
            <option value="Orchid">Orchid</option>
            <option value="Herb">Herb</option>
            <option value="Flowering">Flowering</option>
            <option value="Bonsai">Bonsai</option>
            <option value="Vine">Vine</option>
            <option value="Shrub">Shrub</option>
            <option value="Tree">Tree</option>
        </select>

        <label>📅 Plant Age (Months):</label>
        <input type="number" value={plantAge} onChange={e => setPlantAge(e.target.value)} min="0" max="100" placeholder="Enter plant age (in Months)" required />


        <label>🏡 Environment:</label>
        <select value={plantEnvironment} onChange={e => setPlantEnvironment(e.target.value)} required>
          <option value="">Select</option>
          <option value="indoor">Indoor</option>
          <option value="outdoor">Outdoor</option>
        </select>

        <div className="button-container">
            <button id="add-plant-btn" type="submit">🌱 Care Advice</button>
            <button onClick={handleAddPlant} disabled={!location || !plantType || !plantAge || !plantEnvironment}>➕ Add Plant </button>
        </div>

      </form>


      {/* Floating Chatbot Button */}
      <div className="chatbot-container">
        <button className="chatbot-toggle" onClick={toggleChat}>🗪</button>

        {chatOpen && (
          <div className="chatbot-box">
            <h3>Chat with AI</h3>
            <div className="chatbot-messages">
            {chatHistory.map((msg, index) => (
                <div key={index} className={`chat-message ${msg.type}`}>
                    {msg.text}
                </div>
                ))}
        </div>

            <div className="chat-input-container">
                <input 
                    type="text" 
                    placeholder="Ask something..." 
                    value={chatMessage} 
                    onChange={e => setChatMessage(e.target.value)} 
                    onKeyDown={e => e.key === "Enter" && sendMessage()}
                />
                <button className="my-button" onClick={sendMessage}>➤</button>
            </div>

          </div>
          
        )}
      </div>

      {/* Display Care Advice */}
        {result && (
        <div className="content">
            <h3>🌱 Care Advice</h3>
            <p>{result}</p>

            {/* Display Weather Data */}
            {weatherData && (
            <div className="weather-info">
                <h4>🌦️ Weather Info</h4>
                <p>🌡️ Temperature: {weatherData.temperature}°C</p>
                <p>💧 Humidity: {weatherData.humidity}%</p>
                <p>🌧️ Rain: {weatherData.rain} mm</p>
            </div>
            )}
        </div>
        )}


      {/* Display Add Plant Message */}
      {addMessage && (
        <div style={{ marginTop: "20px", padding: "10px", border: "1px solid green", background: "#e8f5e9" }}>
          <p>{addMessage}</p>
        </div>
      )}
    </div>
  );
};

export default Home;
