import React, { useState } from "react";
import axios from "axios";

const Home = () => {
  // Plant Care State
  const [location, setLocation] = useState("");
  const [plantType, setPlantType] = useState("");
  const [plantAge, setPlantAge] = useState("");
  const [plantEnvironment, setPlantEnvironment] = useState("");
  const [result, setResult] = useState("");
  const [addMessage, setAddMessage] = useState("");

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
    axios.post("http://127.0.0.1:5000/chatbot", { message: chatMessage })
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
    axios.post("http://127.0.0.1:5000/get-care", {
      location,
      plant_type: plantType,
      plant_age: plantAge,
      plant_environment: plantEnvironment
    })
    .then(response => setResult(response.data.message))
    .catch(error => setResult("⚠️ Error fetching care advice."));
  };

  // Handle Adding a Plant
  const handleAddPlant = () => {
    axios.post("http://127.0.0.1:5000/add-plant", {
      location,
      plant_type: plantType,
      plant_age: plantAge,
      environment: plantEnvironment
    }, { withCredentials: true })
    .then(response => {
      if (response.data.duplicate) {
        if (window.confirm("This plant already exists! Do you still want to add it?")) {
          axios.post("http://127.0.0.1:5000/add-plant", {
            location,
            plant_type: plantType,
            plant_age: plantAge,
            environment: plantEnvironment
          }, { withCredentials: true })
          .then(res => setAddMessage(res.data.message))
          .catch(() => setAddMessage("⚠️ Error adding duplicate plant."));
        }
      } else {
        setAddMessage(response.data.message);
      }
    })
    .catch(() => setAddMessage("⚠️ Error adding plant."));
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
