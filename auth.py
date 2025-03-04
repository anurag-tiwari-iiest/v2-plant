from flask import Blueprint, render_template, request, redirect, url_for, flash, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from models import db, User

# Initialize Flask extensions
# db = SQLAlchemy()
bcrypt = Bcrypt()
login_manager = LoginManager()
login_manager.login_view = "auth.login"

def init_login_manager(app):
    login_manager.init_app(app)


# Create a Blueprint for authentication
auth = Blueprint("auth", __name__)


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Route to handle login
@auth.route("/login", methods=["GET", "POST"])
def login():
    """Logs in an existing user"""
    data = request.json  # Accepts JSON from React
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()
    if user and bcrypt.check_password_hash(user.password, password):
        login_user(user)
        return jsonify({"message": "Login successful"}), 200
    return jsonify({"message": "Invalid credentials"}), 401

# Route to handle logout
@auth.route("/logout", methods=["GET"])
@login_required
def logout():
    """Logs out the user"""
    logout_user()
    return jsonify({"message": "Logged out successfully"}), 200

# Route to handle registration
@auth.route("/register", methods=["POST"])
def register():
    """Registers a new user"""
    data = request.json  # Accepts JSON from React
    email = data.get("email")
    password = data.get("password")

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "User already exists"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
    new_user = User(email=email, password=hashed_password)

    db.session.add(new_user)
    db.session.commit()

    login_user(new_user)  # Logs in after registration
    return jsonify({"message": "User registered successfully"}), 200
