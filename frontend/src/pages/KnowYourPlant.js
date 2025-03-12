import React, { useState } from "react";
import axios from "axios";
import { API_URL } from "../config";

const KnowYourPlant = () => {
    const [query, setQuery] = useState("");
    const [plant, setPlant] = useState(null);
    const [error, setError] = useState("");

    const searchPlant = () => {
        if (!query.trim()) return;
        
        axios.get(`${API_URL}/api/search-plant?query=${encodeURIComponent(query)}`)
            .then(response => {
                setPlant(response.data);
                setError("");
            })
            .catch(() => {
                setError("Plant not found");
                setPlant(null);
            });
    };

    return (
        <div className="container">
            <h1>🌱 Know Your Plant</h1>
            <input 
                type="text" 
                placeholder="Search for a plant..." 
                value={query} 
                onChange={e => setQuery(e.target.value)} 
            />
            <button onClick={searchPlant}>Search</button>

            {error && <p>{error}</p>}

            {plant && (
                <div className="plant-card">
                    <img src={plant.image_url} alt={plant.common_name} />
                    <h2>{plant.common_name} ({plant.scientific_name})</h2>
                </div>
            )}
        </div>
    );
};

export default KnowYourPlant;
