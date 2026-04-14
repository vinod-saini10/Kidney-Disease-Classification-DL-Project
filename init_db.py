import pymysql
import os
from dotenv import load_dotenv
from flask import Flask
from src.cnnClassifier.models import db

load_dotenv()

def init_database():
    # Connect to MySQL to create the database if it doesn't exist
    connection = pymysql.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', '')
    )
    
    try:
        with connection.cursor() as cursor:
            # Create DB
            db_name = os.getenv('DB_NAME', 'kidney_db')
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
            print(f"Database '{db_name}' checked/created.")
    finally:
        connection.close()

    # Create app context to initialize tables
    app = Flask(__name__)
    db_host = os.getenv('DB_HOST')
    db_user = os.getenv('DB_USER')
    db_pass = os.getenv('DB_PASSWORD')
    db_name = os.getenv('DB_NAME')
    
    app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{db_user}:{db_pass}@{db_host}/{db_name}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    db.init_app(app)
    
    with app.app_context():
        db.create_all()
        print("Tables created successfully.")
        
        # Create an admin user if none exists
        from src.cnnClassifier.models import User
        admin_email = "admin@kidney.com"
        if not User.query.filter_by(email=admin_email).first():
            admin = User(
                name="Admin User",
                email=admin_email,
                password="admin123", # Change this in production
                role="admin"
            )
            admin.is_verified = True
            db.session.add(admin)
            db.session.commit()
            print(f"Default admin user created: {admin_email} / admin123")

if __name__ == "__main__":
    init_database()
