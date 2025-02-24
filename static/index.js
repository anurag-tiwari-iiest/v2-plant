function toggleMenu() {
    const navLinks = document.querySelector(".nav-links");
    navLinks.classList.toggle("show");
}


document.getElementById("plant-form").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent page reload

    let location = document.getElementById("location").value.trim();
    let plantType = document.getElementById("plant-type").value.trim();
    let resultDiv = document.getElementById("result");

    // ✅ Validate: Only allow city name (letters) or PIN code (6 digits)
    if (!/^\d{6}$/.test(location) && !/^[A-Za-z\s]+$/.test(location)) {
        resultDiv.innerHTML = `<p style="color: red;">⚠️ Enter a valid city or 6-digit PIN code.</p>`;
        resultDiv.style.display = "block";
        return;
    }

    let plantData = {
        location: location,
        plant_type: plantType,
        plant_age: document.getElementById("plant-age").value,
        plant_environment: document.getElementById("plant-environment").value
    };

    fetch("http://127.0.0.1:5000/get-care", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(plantData)
    })
        .then(response => response.json())
        .then(data => {
            let weatherInfo = data.weather
                ? `<br><br>🌡️ <b>Temperature:</b> ${data.weather.temperature}°C<br>
            💧 <b>Humidity:</b> ${data.weather.humidity}%<br>
            ☔ <b>Rainfall:</b> ${data.weather.rain}mm`
                : "";

            resultDiv.innerHTML = `<p><b>✅ Plant Care Recommendation:</b><br>${data.message}${weatherInfo}</p>`;

            resultDiv.style.display = "block";
        })
        .catch(error => console.error("Error:", error));
});


document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ Chatbot script loaded!");

    // Chat elements
    const chatIcon = document.createElement("div");
    chatIcon.id = "chat-icon";
    chatIcon.innerHTML = "🗪";
    document.body.appendChild(chatIcon);

    const chatContainer = document.createElement("div");
    chatContainer.id = "chat-container";
    chatContainer.innerHTML = `
        <div id="chat-box"></div>
        <div id="chat-input-container">
            <input type="text" id="user-input" placeholder="Ask me about plant care...">
            <button id="send-btn">▶</button>
        </div>
    `;
    document.body.appendChild(chatContainer);

    const chatBox = document.getElementById("chat-box");
    const userInput = document.getElementById("user-input");
    const sendBtn = document.getElementById("send-btn");

    // Toggle chat visibility
    chatIcon.addEventListener("click", function () {
        chatContainer.style.display = chatContainer.style.display === "none" ? "flex" : "none";
    });

    // Function to append messages
    function appendMessage(sender, message) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add(sender);
        messageDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to latest message
    }

    
    // Function to send messages
    function sendMessage() {     
        const message = userInput.value.trim();
        if (message === "") return;

        console.log("✅ Sending message:", message);

        appendMessage("You", message);
        userInput.value = "";

        fetch("http://127.0.0.1:5000/chatbot", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: message })
        })
        .then(response => response.json())
        .then(data => {
            console.log("✅ Chatbot response received:", data);
            appendMessage("Bot", data.response);
        })
        .catch(error => {
            console.error("❌ Error sending message:", error);
            appendMessage("Bot", "⚠️ Error: Unable to connect to AI.");
        });
    }

    // Event listeners for send button and Enter key
    sendBtn.addEventListener("click", function () {
        // console.log("✅ Send button clicked!");
        sendMessage();
    });

    userInput.addEventListener("keypress", function (event) {
        // console.log(`✅ Key pressed: ${event.key}`);
        if (event.key === "Enter") {
            // console.log("✅ Enter key detected!");
            sendMessage();
        }
    });

    console.log("✅ Chatbot script finished loading!");
});
