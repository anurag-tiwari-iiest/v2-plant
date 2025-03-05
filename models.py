from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin

db = SQLAlchemy()

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    plants = db.relationship("Plant", backref="owner", lazy=True)  # Link to plants

class Plant(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    plant_type = db.Column(db.String(50), nullable=False)
    plant_age = db.Column(db.Integer, nullable=False)
    location = db.Column(db.String(100), nullable=False)
    environment = db.Column(db.String(10), nullable=False)
