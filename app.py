from flask import Flask, request, jsonify, render_template, send_from_directory, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail, Message
from werkzeug.security import generate_password_hash, check_password_hash
import random
import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Database configuration - also should use environment variables
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'mysql://root:root@localhost/diabetech')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Flask-Mail config - NOW USING ENVIRONMENT VARIABLES
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True').lower() == 'true'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')

# Validate that required environment variables are set
if not app.config['MAIL_USERNAME'] or not app.config['MAIL_PASSWORD']:
    raise ValueError("MAIL_USERNAME and MAIL_PASSWORD environment variables must be set")

mail = Mail(app)
db = SQLAlchemy(app)

# User model
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    otp = db.Column(db.String(10), nullable=True)
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Create tables
with app.app_context():
    db.create_all()

# Serve static files
@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

# Function to send OTP email (HTML format)
def send_otp_email(to_email, otp_code, first_name):
    try:
        msg = Message(
            subject="One-Time Password (OTP) for DiabeTech",
            sender=app.config['MAIL_USERNAME'],
            recipients=[to_email]
        )

        # HTML content
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .container {{
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #333;
            }}
            .otp {{
              font-size: 24px;
              font-weight: bold;
              color: #2e86de;
            }}
          </style>
        </head>
        <body>
          <div class="container">
            <p>Hello {first_name},</p>
            <br>
            <p>To complete your registration, please enter the following One-Time Password (OTP) in the verification page:</p>
            <p class="otp"><strong>{otp_code}</strong></p>
            <p>This code is valid for the next 10 minutes. Please do not share this code with anyone.</p>
            <br>
            <p>If you did not request this, please ignore this email.</p>
            <br>
            <p>Thank you,<br>The DIABETECH Team</p>
          </div>
        </body>
        </html>
        """

        msg.html = html_content
        mail.send(msg)
        print(f"OTP email sent to {to_email}")
    except Exception as e:
        print(f"Failed to send OTP email: {e}")

# Routes
@app.route('/')
def index():
    return render_template('sign-up.html')

@app.route('/sign-in')
def sign_in():
    return render_template('sign-in.html')

@app.route('/loading')
def loading():
    return render_template('loading.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

# Register API
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json

    if not all(key in data for key in ['firstName', 'lastName', 'email', 'password']):
        return jsonify({'success': False, 'message': 'All fields are required'}), 400

    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({'success': False, 'message': 'Email already exists'}), 400

    otp = ''.join([str(random.randint(0, 9)) for _ in range(4)])

    new_user = User(
        first_name=data['firstName'],
        last_name=data['lastName'],
        email=data['email'],
        password=generate_password_hash(data['password']),
        otp=otp,
        is_verified=False
    )

    try:
        db.session.add(new_user)
        db.session.commit()

        # Send OTP email
        send_otp_email(data['email'], otp, data['firstName'])

        return jsonify({'success': True, 'message': 'Registration successful. OTP sent to your email.'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Error: {str(e)}'}), 500

# OTP Verification
@app.route('/api/verify-otp', methods=['POST'])
def verify_otp():
    data = request.json

    if not all(key in data for key in ['email', 'otp']):
        return jsonify({'success': False, 'message': 'Email and OTP are required'}), 400

    user = User.query.filter_by(email=data['email'], otp=data['otp']).first()

    if user:
        user.is_verified = True
        user.otp = None

        try:
            db.session.commit()
            return jsonify({'success': True, 'message': 'OTP verified successfully'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'message': f'Error: {str(e)}'}), 500
    else:
        return jsonify({'success': False, 'message': 'Invalid OTP'}), 400

# Resend OTP
@app.route('/api/resend-otp', methods=['POST'])
def resend_otp():
    data = request.json

    if 'email' not in data:
        return jsonify({'success': False, 'message': 'Email is required'}), 400

    user = User.query.filter_by(email=data['email']).first()

    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404

    otp = ''.join([str(random.randint(0, 9)) for _ in range(4)])
    user.otp = otp

    try:
        db.session.commit()
        send_otp_email(data['email'], otp, user.first_name)
        return jsonify({'success': True, 'message': 'OTP resent successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': f'Error: {str(e)}'}), 500

# New Sign-in API route
@app.route('/api/sign-in', methods=['POST'])
def api_sign_in():
    email = request.form.get('email')
    password = request.form.get('password')

    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'success': False, 'message': 'Invalid email or password'}), 401

    if not check_password_hash(user.password, password):
        return jsonify({'success': False, 'message': 'Invalid email or password'}), 401

    if not user.is_verified:
        return jsonify({'success': False, 'message': 'Email not verified'}), 403

    return jsonify({'success': True, 'message': 'Login successful'})

if __name__ == '__main__':
    app.run(debug=True)
