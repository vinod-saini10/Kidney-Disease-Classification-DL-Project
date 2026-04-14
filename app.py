import os
import sys
import datetime
from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS, cross_origin
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from dotenv import load_dotenv
from werkzeug.utils import secure_filename

# Add src to sys.path to resolve ModuleNotFoundError
sys.path.append(os.path.join(os.getcwd(), "src"))

from src.cnnClassifier.models import db, User, Prediction, bcrypt
from src.cnnClassifier.auth import mail, generate_otp, send_otp_email
from cnnClassifier.utils.common import decodeImage
from cnnClassifier.pipeline.prediction import PredictionPipeline

# Load environment variables
load_dotenv()

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
os.putenv('LANG', 'en_US.UTF-8')
os.putenv('LC_ALL', 'en_US.UTF-8')

app = Flask(__name__)
CORS(app)

# Configurations
db_user = os.getenv('DB_USER', 'root')
db_pass = os.getenv('DB_PASSWORD', 'root')
db_host = os.getenv('DB_HOST', 'localhost')
db_name = os.getenv('DB_NAME', 'kidney_db')

app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{db_user}:{db_pass}@{db_host}/{db_name}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'fallback-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(days=1)

# Mail Config
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS') == 'True'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')

# Initialize Extensions
db.init_app(app)
bcrypt.init_app(app)
jwt = JWTManager(app)
mail.init_app(app)

# Ensure upload directories exist
PROFILE_UPLOAD_FOLDER = 'static/profiles'
SCAN_UPLOAD_FOLDER = 'static/scans'
os.makedirs(PROFILE_UPLOAD_FOLDER, exist_ok=True)
os.makedirs(SCAN_UPLOAD_FOLDER, exist_ok=True)

class ClientApp:
    def __init__(self):
        self.filename = "inputImage.jpg"
        self.classifier = PredictionPipeline(self.filename)

clApp = ClientApp()

# --- AUTH ROUTES ---

@app.route("/api/auth/register", methods=['POST'])
def register():
    try:
        data = request.form
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        phone = data.get('phone')
        address = data.get('address')
        
        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email already exists"}), 400
        
        # Handle Image Upload
        image_path = None
        if 'image' in request.files:
            file = request.files['image']
            if file.filename != '':
                filename = secure_filename(f"{datetime.datetime.now().timestamp()}_{file.filename}")
                image_path = os.path.join(PROFILE_UPLOAD_FOLDER, filename)
                file.save(image_path)
        
        user = User(name=name, email=email, password=password, phone=phone, address=address, image=image_path)
        
        # Generate and send OTP
        otp = generate_otp()
        user.otp = otp
        user.otp_expiry = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
        
        db.session.add(user)
        db.session.commit()
        
        send_otp_email(email, otp)
        
        return jsonify({"message": "User registered successfully. Please verify your email.", "user_id": user.id}), 201
    except Exception as e:
        import traceback
        print("!!! REGISTRATION ERROR !!!")
        traceback.print_exc()
        return jsonify({"error": "Internal Server Error", "details": str(e)}), 500

@app.route("/api/auth/verify", methods=['POST'])
def verify_otp():
    data = request.json
    email = data.get('email')
    otp = data.get('otp')
    
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    if user.otp == otp and user.otp_expiry > datetime.datetime.utcnow():
        user.is_verified = True
        user.otp = None
        user.otp_expiry = None
        db.session.commit()
        return jsonify({"message": "Email verified successfully"}), 200
    
    return jsonify({"error": "Invalid or expired OTP"}), 400

@app.route("/api/auth/login", methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401
    
    if not user.is_verified:
        return jsonify({"error": "Email not verified"}), 403
    
    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "token": access_token,
        "user": {
            "id": user.id,
            "name": user.name,
            "role": user.role,
            "image": user.image
        }
    }), 200

# --- PREDICTION ROUTES ---

@app.route("/api/predict", methods=['POST'])
@jwt_required()
def predict():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
             return jsonify({"error": "User not found"}), 404
        
        if not request.json or 'image' not in request.json:
            return jsonify({'error': 'No image provided'}), 400
        
        image_base64 = request.json['image']
        
        # Save image for prediction
        temp_filename = f"scan_{datetime.datetime.now().timestamp()}.jpg"
        temp_path = os.path.join(SCAN_UPLOAD_FOLDER, temp_filename)
        decodeImage(image_base64, temp_path)
        
        # Use shared clApp for classification (or re-init)
        clApp.filename = temp_path
        clApp.classifier.filename = temp_path
        prediction_result = clApp.classifier.predict()
        
        # Extract meaningful result and confidence
        if isinstance(prediction_result, list) and len(prediction_result) > 0:
            res_dict = prediction_result[0]
            result_str = res_dict.get('result', 'Unknown')
            confidence = res_dict.get('confidence', 0.95)
        else:
            result_str = str(prediction_result)
            confidence = 0.95
        
        # Save to DB
        pred_record = Prediction(
            user_id=user_id,
            image_path=temp_path,
            result=result_str,
            confidence=float(confidence)
        )
        db.session.add(pred_record)
        db.session.commit()
        
        return jsonify({
            "result": result_str,
            "confidence": confidence,
            "id": pred_record.id
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- DASHBOARD & ANALYTICS ---

@app.route("/api/user/history", methods=['GET'])
@jwt_required()
def user_history():
    user_id = get_jwt_identity()
    predictions = Prediction.query.filter_by(user_id=user_id).order_by(Prediction.created_at.desc()).all()
    
    history = []
    for p in predictions:
        history.append({
            "id": p.id,
            "result": p.result,
            "confidence": p.confidence,
            "date": p.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "image": p.image_path
        })
    
    # Stats for charts
    normal_count = Prediction.query.filter_by(user_id=user_id, result='Normal').count()
    tumor_count = Prediction.query.filter_by(user_id=user_id, result='Tumor').count()
    
    return jsonify({
        "history": history,
        "stats": {"Normal": normal_count, "Tumor": tumor_count}
    }), 200

@app.route("/api/admin/stats", methods=['GET'])
@jwt_required()
def admin_stats():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or user.role != 'admin':
        return jsonify({"error": "Unauthorized"}), 403
    
    total_users = User.query.count()
    total_predictions = Prediction.query.count()
    
    # Results distribution
    normal_count = Prediction.query.filter_by(result='Normal').count()
    tumor_count = Prediction.query.filter_by(result='Tumor').count()
    
    # User-wise data
    users_data = []
    users = User.query.filter_by(role='user').all()
    for u in users:
        pred_count = Prediction.query.filter_by(user_id=u.id).count()
        users_data.append({
            "name": u.name,
            "email": u.email,
            "prediction_count": pred_count
        })
        
    return jsonify({
        "total_users": total_users,
        "total_predictions": total_predictions,
        "overall_stats": {"Normal": normal_count, "Tumor": tumor_count},
        "users_analytics": users_data
    }), 200

# Serve static files (uploads)
@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

@app.route("/", methods=['GET'])
def home():
    return "API is running. Please use the React frontend."

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8080, debug=True)
