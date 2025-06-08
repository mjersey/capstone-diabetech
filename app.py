from flask import Flask, request, jsonify, session, render_template, redirect, url_for
from flask_mail import Mail, Message
import os
import random
import string
import hashlib
import time
from datetime import datetime, timedelta
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash
import re
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import ssl

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'diabetech-super-secret-key-change-this-in-production-2024')

# Email Configuration for Gmail
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True').lower() == 'true'
app.config['MAIL_USE_SSL'] = os.getenv('MAIL_USE_SSL', 'False').lower() == 'true'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')

# Initialize Flask-Mail
mail = Mail(app)

# Database Configuration
DATABASE_URL = os.getenv('DATABASE_URL', 'mysql://root:root@localhost/diabetech')
import urllib.parse as urlparse
url = urlparse.urlparse(DATABASE_URL)
DATABASE_CONFIG = {
    'host': url.hostname or 'localhost',
    'user': url.username or 'root',
    'password': url.password or 'root',
    'database': url.path[1:] if url.path else 'diabetech'
}

def get_db_connection():
    """Get database connection"""
    try:
        connection = mysql.connector.connect(**DATABASE_CONFIG)
        return connection
    except mysql.connector.Error as err:
        print(f"Database connection error: {err}")
        return None

def generate_otp():
    """Generate a 4-digit OTP"""
    return ''.join(random.choices(string.digits, k=4))

def generate_token():
    """Generate a secure token for OTP verification"""
    return hashlib.sha256(f"{time.time()}{random.random()}".encode()).hexdigest()

def send_otp_email(email, otp):
    """Send OTP via email"""
    try:
        # For development, you can print the OTP to console
        print(f"🔐 OTP for {email}: {otp}")
        
        # If email credentials are configured, send actual email
        if app.config['MAIL_USERNAME'] and app.config['MAIL_PASSWORD']:
            msg = Message(
                'Diabetech - Email Verification Code',
                sender=app.config['MAIL_USERNAME'],
                recipients=[email]
            )
            
            msg.html = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #8b0000; color: white; padding: 20px; text-align: center;">
                    <h1>Diabetech</h1>
                </div>
                <div style="padding: 30px; background: #f8f9fa;">
                    <h2 style="color: #333;">Email Verification</h2>
                    <p>Your verification code is:</p>
                    <div style="background: white; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; border: 2px solid #8b0000;">
                        <h1 style="color: #8b0000; font-size: 32px; margin: 0; letter-spacing: 8px;">{otp}</h1>
                    </div>
                    <p>This code will expire in 5 minutes.</p>
                    <p style="color: #666; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
                </div>
            </div>
            """
            
            mail.send(msg)
            print(f"✅ OTP email sent to {email}")
        else:
            print(f"⚠️ Email not configured. OTP for {email}: {otp}")
            
        return True
    except Exception as e:
        print(f"❌ Failed to send OTP email: {e}")
        return False

# RESTORED EMAIL VERIFICATION REGISTRATION API
@app.route('/api/register', methods=['POST'])
def register():
    try:
        print("=== REGISTRATION WITH EMAIL VERIFICATION ===")
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['firstName', 'lastName', 'email', 'password']
        if not all(field in data for field in required_fields):
            print("❌ Missing required fields")
            return jsonify({'success': False, 'message': 'All fields are required'}), 400
        
        email = data['email'].strip().lower()
        print(f"📧 Registration attempt for: {email}")
        
        # Validate email format
        if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
            print("❌ Invalid email format")
            return jsonify({'success': False, 'message': 'Invalid email format'}), 400
        
        # Check if user already exists
        connection = get_db_connection()
        if not connection:
            print("❌ Database connection failed")
            return jsonify({'success': False, 'message': 'Database connection error'}), 500
        
        try:
            cursor = connection.cursor()
            cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
            existing_user = cursor.fetchone()
            
            if existing_user:
                print(f"❌ Email already registered: {email}")
                return jsonify({'success': False, 'message': 'Email already exists'}), 400
            
            # Generate OTP and token
            otp = generate_otp()
            token = generate_token()
            expires_at = datetime.now() + timedelta(minutes=5)
            
            # Store pending registration in session or temporary table
            session[f'pending_registration_{email}'] = {
                'firstName': data['firstName'],
                'lastName': data['lastName'],
                'email': email,
                'password': generate_password_hash(data['password']),
                'otp': otp,
                'token': token,
                'expires_at': expires_at.isoformat(),
                'attempts': 0
            }
            
            # Send OTP email
            if send_otp_email(email, otp):
                print(f"✅ OTP sent to {email}")
                return jsonify({
                    'success': True, 
                    'message': 'OTP sent to your email',
                    'token': token
                })
            else:
                print(f"❌ Failed to send OTP to {email}")
                return jsonify({'success': False, 'message': 'Failed to send verification email'}), 500
                
        except mysql.connector.Error as err:
            print(f"❌ Database error: {err}")
            return jsonify({'success': False, 'message': 'Database error'}), 500
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
            
    except Exception as e:
        print(f"❌ Registration error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': 'Internal server error. Please try again.'}), 500

# OTP VERIFICATION API
@app.route('/api/verify-otp', methods=['POST'])
def verify_otp():
    try:
        print("=== OTP VERIFICATION ===")
        data = request.get_json()
        
        email = data.get('email', '').strip().lower()
        otp = data.get('otp', '').strip()
        
        if not email or not otp:
            return jsonify({'success': False, 'message': 'Email and OTP are required'}), 400
        
        # Get pending registration from session
        pending_key = f'pending_registration_{email}'
        pending_data = session.get(pending_key)
        
        if not pending_data:
            print(f"❌ No pending registration found for {email}")
            return jsonify({'success': False, 'message': 'No pending registration found'}), 400
        
        # Check if OTP has expired
        expires_at = datetime.fromisoformat(pending_data['expires_at'])
        if datetime.now() > expires_at:
            print(f"❌ OTP expired for {email}")
            session.pop(pending_key, None)
            return jsonify({'success': False, 'message': 'OTP has expired. Please register again.'}), 400
        
        # Check attempts
        if pending_data.get('attempts', 0) >= 3:
            print(f"❌ Too many attempts for {email}")
            session.pop(pending_key, None)
            return jsonify({'success': False, 'message': 'Too many failed attempts. Please register again.'}), 400
        
        # Verify OTP
        if otp != pending_data['otp']:
            print(f"❌ Invalid OTP for {email}")
            pending_data['attempts'] = pending_data.get('attempts', 0) + 1
            session[pending_key] = pending_data
            return jsonify({'success': False, 'message': 'Invalid OTP. Please try again.'}), 400
        
        # OTP is valid, create user account
        connection = get_db_connection()
        if not connection:
            return jsonify({'success': False, 'message': 'Database connection error'}), 500
        
        try:
            cursor = connection.cursor()
            
            # Insert user into database
            insert_query = """
                INSERT INTO users (first_name, last_name, email, password, role, is_verified, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """
            now = datetime.now()
            
            cursor.execute(insert_query, (
                pending_data['firstName'],
                pending_data['lastName'],
                pending_data['email'],
                pending_data['password'],
                'User',
                1,  # is_verified = True
                now,
                now
            ))
            
            connection.commit()
            
            # Clear pending registration
            session.pop(pending_key, None)
            
            print(f"✅ User account created successfully for {email}")
            return jsonify({
                'success': True, 
                'message': 'Account created successfully!'
            })
            
        except mysql.connector.Error as err:
            print(f"❌ Database error during user creation: {err}")
            connection.rollback()
            return jsonify({'success': False, 'message': 'Failed to create account'}), 500
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
                
    except Exception as e:
        print(f"❌ OTP verification error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

# RESEND OTP API
@app.route('/api/resend-otp', methods=['POST'])
def resend_otp():
    try:
        print("=== RESEND OTP ===")
        data = request.get_json()
        
        email = data.get('email', '').strip().lower()
        if not email:
            return jsonify({'success': False, 'message': 'Email is required'}), 400
        
        # Get pending registration from session
        pending_key = f'pending_registration_{email}'
        pending_data = session.get(pending_key)
        
        if not pending_data:
            print(f"❌ No pending registration found for {email}")
            return jsonify({'success': False, 'message': 'No pending registration found'}), 400
        
        # Generate new OTP
        new_otp = generate_otp()
        new_expires_at = datetime.now() + timedelta(minutes=5)
        
        # Update pending data
        pending_data['otp'] = new_otp
        pending_data['expires_at'] = new_expires_at.isoformat()
        pending_data['attempts'] = 0  # Reset attempts
        session[pending_key] = pending_data
        
        # Send new OTP
        if send_otp_email(email, new_otp):
            print(f"✅ New OTP sent to {email}")
            return jsonify({
                'success': True, 
                'message': 'New OTP sent successfully'
            })
        else:
            print(f"❌ Failed to send new OTP to {email}")
            return jsonify({'success': False, 'message': 'Failed to send OTP'}), 500
            
    except Exception as e:
        print(f"❌ Resend OTP error: {e}")
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

# SIGN-IN API (unchanged)
@app.route('/api/sign-in', methods=['POST'])
def sign_in_api():
    try:
        print("=== SIGN-IN REQUEST ===")
        
        email = request.form.get('email')
        password = request.form.get('password')

        print(f"Sign-in attempt for email: {email}")

        if not email or not password:
            print("Missing email or password")
            return jsonify({'success': False, 'message': 'Email and password are required'}), 400

        email = email.strip().lower()

        connection = get_db_connection()
        if not connection:
            print("Database connection failed")
            return jsonify({'success': False, 'message': 'Database connection error. Please try again later.'}), 500
        
        try:
            cursor = connection.cursor()
            
            cursor.execute("SELECT id, first_name, last_name, email, password, role, is_verified FROM users WHERE email = %s", (email,))
            user_data = cursor.fetchone()
            
            if not user_data:
                print(f"User not found for email: {email}")
                return jsonify({'success': False, 'message': 'Invalid email or password'}), 401

            user_id, first_name, last_name, user_email, hashed_password, role, is_verified = user_data
            print(f"User found: {first_name} {last_name}, verified: {is_verified}")

            if not check_password_hash(hashed_password, password):
                print(f"Invalid password for user: {email}")
                return jsonify({'success': False, 'message': 'Invalid email or password'}), 401

            # Create session
            session.clear()
            session['user_id'] = user_id
            session['user_email'] = user_email
            session['user_name'] = f"{first_name} {last_name}"
            session['user_role'] = role
            session.permanent = True

            print(f"✅ User {email} signed in successfully")
            return jsonify({'success': True, 'message': 'Login successful'})
            
        except mysql.connector.Error as err:
            print(f"Database error during sign-in: {err}")
            return jsonify({'success': False, 'message': 'Database error. Please try again later.'}), 500
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()

    except Exception as e:
        print(f"Sign-in error: {e}")
        return jsonify({'success': False, 'message': 'An error occurred during sign-in. Please try again.'}), 500

# Dashboard and other routes (unchanged)
@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect('/sign-in')
    
    user_data = {
        'first_name': session.get('user_name', 'User').split()[0],
        'last_name': session.get('user_name', 'User').split()[-1],
        'email': session.get('user_email', ''),
        'role': session.get('user_role', 'User')
    }
    
    return render_template('dashboard.html', user=user_data)

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out successfully'})

# Routes
@app.route('/')
def index():
    return render_template('sign-up.html')

@app.route('/sign-up')
def sign_up():
    return render_template('sign-up.html')

@app.route('/sign-in')
def sign_in():
    return render_template('sign-in.html')

if __name__ == '__main__':
    app.run(debug=True)
