import os
from dotenv import load_dotenv
import requests, re, random, json
import sqlite3
from flask import Flask, render_template, request, jsonify, make_response, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, login_required, current_user
from auth import auth, db, bcrypt, login_manager, init_login_manager
from flask_cors import CORS
from models import db, User, Plant
from flask_migrate import Migrate
from flask_session import Session


load_dotenv() 

app = Flask(__name__)
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True

init_login_manager(app)

app.config["SESSION_TYPE"] = "filesystem"
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_USE_SIGNER"] = True
Session(app)

# CORS(app, resources={r"/*": {"origins": ["https://v2-plant-1.onrender.com"]}}, supports_credentials=True)
CORS(app, supports_credentials=True)

app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

# Initialize extensions
db.init_app(app)
migrate = Migrate(app, db)
bcrypt.init_app(app)
login_manager.init_app(app)

# Register authentication blueprint
app.register_blueprint(auth)


API_KEY = os.getenv("API_KEY")
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")



def check_database():
    """Check if the database has the 'plant' table, create it if missing."""
    conn = sqlite3.connect("database.db")  # Ensure this matches your actual database filename
    cursor = conn.cursor()

    # Check if the 'plant' table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='plant';")
    table_exists = cursor.fetchone()

    if not table_exists:
        print("🚨 Table 'plant' does NOT exist! Creating it now...")
        cursor.execute("""
            CREATE TABLE plant (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                location TEXT NOT NULL,
                plant_type TEXT NOT NULL,
                plant_age INTEGER NOT NULL,
                environment TEXT NOT NULL
            );
        """)
        conn.commit()
        print("✅ Table 'plant' has been created successfully!")
    else:
        print("✅ Table 'plant' already exists.")

    conn.close()


def get_weather(location):
    """Fetch weather data from OpenWeatherMap API based on city or PIN code."""
    if re.match(r"^\d{6}$", location):
        url = f"http://api.openweathermap.org/data/2.5/weather?zip={location},IN&appid={API_KEY}&units=metric"
    else:
        url = f"http://api.openweathermap.org/data/2.5/weather?q={location},IN&appid={API_KEY}&units=metric"

    try:
        response = requests.get(url)
        data = response.json()

        if response.status_code == 200 and "main" in data:
            return {
                "temperature": data["main"]["temp"],
                "humidity": data["main"]["humidity"],
                "rain": data.get("rain", {}).get("1h", 0),
            }
    except requests.exceptions.RequestException as e:
        print(f"Weather API error: {e}")
    
    return None


def get_huggingface_response(user_input):
    """Send user input to Hugging Face API and get chatbot response."""
    url = "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill"
    headers = {"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"}
    payload = {"inputs": user_input}

    response = requests.post(url, headers=headers, json=payload)
    
    if response.status_code == 200:
        try:
            return response.json()[0]["generated_text"]
        except (IndexError, KeyError):
            return "Sorry, I couldn't process that request right now. Please try again."
    else:
        return "⚠️ Error: Unable to fetch response from AI. Try again later."


def calculate_watering_schedule(temp, humidity, rain, plant_type, plant_age, environment):
    """Calculate watering schedule based on weather conditions and plant type."""
    watering_days = 2

    if temp > 30:
        watering_days -= 1
    elif temp < 20:
        watering_days += 2

    if humidity < 30:
        watering_days -= 1

    if rain > 5:
        return "No extra watering needed due to recent rainfall. ☔"

    plant_type_modifiers = {
        "Aloe Vera": 2, "Cactus": 3, "Snake Plant": 2, "Money Plant": 1,
        "Pothos": 1, "Tulsi": -1, "Rose": -1, "Basil": -1, "Neem": -1
    }
    watering_days += plant_type_modifiers.get(plant_type, 0)

    try:
        plant_age = int(plant_age)
        if plant_age < 6:
            watering_days -= 1
        elif plant_age >= 24:
            watering_days += 1
    except ValueError:
        return "⚠️ Error: Invalid plant age."

    if environment.lower() == "outdoor":
        watering_days -= 1
    elif environment.lower() == "indoor":
        watering_days += 1

    watering_days = max(watering_days, 1)
    return f"Water every {watering_days} days. 💧" if watering_days > 1 else "Water every day. 💧"


@app.route("/")
@login_required
def home():
    response = make_response(render_template("index.html"))
    response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; connect-src 'self' http://127.0.0.1:5000;"
    return response


@app.route("/get-care", methods=["POST"])
def get_plant_care():
    """Handle plant care recommendations."""
    data = request.json
    location = data["location"].strip()

    if not re.match(r"^\d{6}$", location) and not re.match(r"^[A-Za-z\s]+$", location):
        return jsonify({"message": "⚠️ Error: Enter a valid city name or 6-digit PIN code."})

    weather = get_weather(location)

    if weather:
        watering_instruction = calculate_watering_schedule(
            weather["temperature"], weather["humidity"], weather["rain"],
            data["plant_type"], data["plant_age"], data["plant_environment"]
        )

        return jsonify({
            "message": f"Your {data['plant_type']} (age {data['plant_age']} months) in {data['plant_environment']} at {location} needs: {watering_instruction}",
            "weather": weather
        })
    else:
        return jsonify({"message": "⚠️ Error: Invalid city name or PIN code. Try again."})


@app.route("/chatbot", methods=["POST"])
def chatbot():
    """Handle chatbot interactions."""
    data = request.json
    print("Received request:", data)  # ✅ Debugging line

    user_message = data.get("message", "").strip()

    if not user_message:
        return jsonify({"response": "⚠️ Please enter a message!"})

    bot_response = get_huggingface_response(user_message)
    print("Bot response:", bot_response)  # ✅ Debugging line

    return jsonify({"response": bot_response})



# Route to serve the "What's New" page
@app.route("/whats-new")
@login_required
def whats_new():
    return render_template("whats-new.html")

# Load plant care tips from a JSON file
def load_tips():
    with open("tips.json", "r") as file:
        return json.load(file)


@app.route("/profile")
@login_required
def profile():
    return render_template("profile.html")


@app.route('/delete-plant/<int:plant_id>', methods=['DELETE'])
def delete_plant(plant_id):
    plant = Plant.query.get(plant_id)
    if plant:
        db.session.delete(plant)
        db.session.commit()
        return jsonify({"message": "Plant deleted successfully!"})
    return jsonify({"message": "Plant not found!"}), 404


# API route to send random tips
@app.route("/api/tips")
@login_required
def get_random_tip():
    tips = load_tips()
    tip = random.choice(tips)
    return jsonify({"tip": tip})


@app.route("/pricing")
@login_required
def pricing():
    return render_template("pricing.html")

@app.route("/contact-us")
@login_required
def contact_us():
    return render_template("contact-us.html")


@app.route("/add-plant", methods=["POST"])
@login_required
def add_plant():
    data = request.json

    conn = sqlite3.connect("instance/users.db")
    cursor = conn.cursor()

    # ✅ Check if the plant already exists for this user
    cursor.execute(
        "SELECT * FROM plant WHERE user_id = ? AND plant_type = ? AND location = ? AND plant_age = ? AND environment = ?",
        (current_user.id, data["plant_type"], data["location"], data["plant_age"], data["environment"])
    )
    
    existing_plant = cursor.fetchone()

    if existing_plant:
        return jsonify({"message": "⚠️ Plant already exists! Do you still want to add it?", "duplicate": True})

    # ✅ If not a duplicate, add the new plant
    cursor.execute(
        "INSERT INTO plant (user_id, plant_type, plant_age, location, environment) VALUES (?, ?, ?, ?, ?)",
        (current_user.id, data["plant_type"], data["plant_age"], data["location"], data["environment"])
    )
    
    conn.commit()
    conn.close()
    
    return jsonify({"message": "✅ Plant added successfully!", "duplicate": False})


@app.route('/get-user', methods=["GET"])
@login_required 
def get_user():
    if not current_user or not current_user.is_authenticated:
        return jsonify({"error": "User not authenticated"}), 401

    return jsonify({"email": current_user.email}), 200


@app.route('/get-plants')
@login_required
def get_plants():
    plants = Plant.query.filter_by(user_id=current_user.id).all()
    
    plant_list = [
        {
            "id": p.id,
            "type": p.plant_type,
            "age_months": p.plant_age,
            "location": p.location,
            "environment": p.environment,
        }
        for p in plants
    ]
    return jsonify(plant_list)



with app.app_context():
    db.create_all()  # ✅ Make sure tables are created

check_database()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
