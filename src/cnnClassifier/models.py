from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from flask_bcrypt import Bcrypt

db = SQLAlchemy()
bcrypt = Bcrypt()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    address = db.Column(db.Text, nullable=True)
    image = db.Column(db.String(255), nullable=True)
    is_verified = db.Column(db.Boolean, default=False)
    role = db.Column(db.String(20), default='user') # 'user' or 'admin'
    otp = db.Column(db.String(6), nullable=True)
    otp_expiry = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    predictions = db.relationship('Prediction', backref='user', lazy=True)

    def __init__(self, name, email, password, phone=None, address=None, image=None, role='user'):
        self.name = name
        self.email = email
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')
        self.phone = phone
        self.address = address
        self.image = image
        self.role = role

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password, password)

class Prediction(db.Model):
    __tablename__ = 'predictions'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    image_path = db.Column(db.String(255), nullable=False)
    result = db.Column(db.String(50), nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
