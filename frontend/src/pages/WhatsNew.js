import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";

const WhatsNew = () => {
  const [tip, setTip] = useState("");

  const fetchNewTip = () => {
    axios.get(`${API_URL}/api/tips`, { withCredentials: true })
      .then(response => setTip(response.data.tip))
      .catch(() => setTip("⚠️ No tips available right now."));
  };

  useEffect(() => {
    fetchNewTip();  // Load first tip on page load
  }, []);

  return (
    <div className="container">
      <h2>🌱 Plant Care Tips</h2>
      <br></br>
      <p>{tip}</p>
      <br></br>
      <button className="tip-button" onClick={fetchNewTip}>Load New Tip</button>
    </div>
  );
};

export default WhatsNew;
