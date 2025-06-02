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

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'  # Change this to a secure secret key

# Email Configuration
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True').lower() == 'true'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')

mail = Mail(app)

# Database Configuration
DATABASE_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'root',
    'database': 'diabetech'
}

# In-memory storage for registration OTP codes (in production, use Redis or database)
registration_otp_storage = {}
# In-memory storage for password reset OTP codes
password_reset_otp_storage = {}

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

def get_user_first_name(email):
    """Get user's first name from database"""
    connection = get_db_connection()
    if not connection:
        return "User"
    
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT first_name FROM users WHERE email = %s", (email,))
        result = cursor.fetchone()
        return result[0] if result else "User"
    except mysql.connector.Error as err:
        print(f"Database error: {err}")
        return "User"
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def send_registration_otp_email(to_email, otp_code, first_name):
    """Send OTP email for registration"""
    try:
        msg = Message(
            subject='Email Verification OTP for Diabetech Account',
            sender=app.config['MAIL_USERNAME'],
            recipients=[to_email]
        )

        # HTML content for registration
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{
                    font-family: 'Arial', sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background: linear-gradient(135deg, #531111 0%, #531111 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                    border-radius: 10px 10px 0 0;
                }}
                .content {{
                    background: #f8f9fa;
                    padding: 30px;
                    border-radius: 0 0 10px 10px;
                }}
                .otp-code {{
                    background: #8b0000;
                    color: white;
                    font-size: 32px;
                    font-weight: bold;
                    padding: 20px;
                    text-align: center;
                    border-radius: 10px;
                    margin: 20px 0;
                    letter-spacing: 8px;
                }}
                .footer {{
                    text-align: center;
                    margin-top: 20px;
                    color: #666;
                    font-size: 14px;
                }}
                .warning {{
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    color: #856404;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 20px 0;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Diabetech</h1>
                <h2>Welcome to Diabetech!</h2>
            </div>
            <div class="content">
                <p>Hi <strong>{first_name}</strong>,</p>
                
                <p>Thank you for registering with Diabetech! To complete your registration, please verify your email address.</p>
                
                <p>Please use the One-Time Password (OTP) below to verify your email:</p>
                
                <div class="otp-code">{otp_code}</div>
                
                <div class="warning">
                    <strong>⏰ This code is valid for the next 10 minutes.</strong>
                </div>
                
                <p>If you did not create this account, please ignore this email.</p>
                
                <div class="footer">
                    <p>Welcome to better health management,<br>
                    <strong>The Diabetech Team</strong></p>
                </div>
            </div>
        </body>
        </html>
        """

        msg.html = html_content
        mail.send(msg)
        print(f"Registration OTP email sent to {to_email}")
        return True
    except Exception as e:
        print(f"Failed to send registration email: {e}")
        return False

def send_password_reset_email(to_email, otp_code, first_name):
    """Send OTP email for password reset"""
    try:
        msg = Message(
            subject='Password Reset OTP for Diabetech Account',
            sender=app.config['MAIL_USERNAME'],
            recipients=[to_email]
        )

        # HTML content for password reset
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{
                    font-family: 'Arial', sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background: linear-gradient(135deg, #531111 0%, #531111 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                    border-radius: 10px 10px 0 0;
                }}
                .content {{
                    background: #f8f9fa;
                    padding: 30px;
                    border-radius: 0 0 10px 10px;
                }}
                .otp-code {{
                    background: #8b0000;
                    color: white;
                    font-size: 32px;
                    font-weight: bold;
                    padding: 20px;
                    text-align: center;
                    border-radius: 10px;
                    margin: 20px 0;
                    letter-spacing: 8px;
                }}
                .footer {{
                    text-align: center;
                    margin-top: 20px;
                    color: #666;
                    font-size: 14px;
                }}
                .warning {{
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    color: #856404;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 20px 0;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Diabetech</h1>
                <h2>Password Reset Request</h2>
            </div>
            <div class="content">
                <p>Hi <strong>{first_name}</strong>,</p>
                
                <p>We received a request to reset the password for your Diabetech account.</p>
                
                <p>Please use the One-Time Password (OTP) below to proceed with resetting your password:</p>
                
                <div class="otp-code">{otp_code}</div>
                
                <div class="warning">
                    <strong>⏰ This code is valid for the next 10 minutes.</strong>
                </div>
                
                <p>If you did not request this, please ignore this email. Your account remains secure.</p>
                
                <div class="footer">
                    <p>Stay healthy,<br>
                    <strong>The Diabetech Team</strong></p>
                </div>
            </div>
        </body>
        </html>
        """

        msg.html = html_content
        mail.send(msg)
        print(f"Password reset OTP email sent to {to_email}")
        return True
    except Exception as e:
        print(f"Failed to send password reset email: {e}")
        return False

# User Registration API
@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['firstName', 'lastName', 'email', 'password']
        if not all(field in data for field in required_fields):
            return jsonify({'success': False, 'message': 'All fields are required'}), 400
        
        email = data['email'].strip().lower()
        
        # Validate email format
        if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
            return jsonify({'success': False, 'message': 'Invalid email format'}), 400
        
        # Check if user already exists
        connection = get_db_connection()
        if not connection:
            return jsonify({'success': False, 'message': 'Database connection error'}), 500
        
        try:
            cursor = connection.cursor()
            cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
            existing_user = cursor.fetchone()
            
            if existing_user:
                return jsonify({'success': False, 'message': 'Email already registered'}), 400
                
        except mysql.connector.Error as err:
            print(f"Database error: {err}")
            return jsonify({'success': False, 'message': 'Database error'}), 500
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
        
        # Generate OTP and token
        otp_code = generate_otp()
        token = generate_token()
        
        # Store registration data with OTP (10 minutes expiration)
        expiration = datetime.now() + timedelta(minutes=10)
        registration_otp_storage[token] = {
            'firstName': data['firstName'],
            'lastName': data['lastName'],
            'email': email,
            'password': generate_password_hash(data['password']),
            'otp': otp_code,
            'expires': expiration,
            'verified': False
        }
        
        # Send registration OTP email
        if send_registration_otp_email(email, otp_code, data['firstName']):
            return jsonify({
                'success': True, 
                'message': 'Registration initiated. Please check your email for verification code.',
                'token': token
            })
        else:
            return jsonify({'success': False, 'message': 'Failed to send verification email. Please try again.'}), 500
            
    except Exception as e:
        print(f"Registration error: {e}")
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

# Verify Registration OTP
@app.route('/api/verify-registration-otp', methods=['POST'])
def verify_registration_otp():
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        otp = data.get('otp', '').strip()
        token = data.get('token', '').strip()
        
        if not all([email, otp, token]):
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400
        
        # Check if token exists
        if token not in registration_otp_storage:
            return jsonify({'success': False, 'message': 'Invalid or expired session'})
        
        stored_data = registration_otp_storage[token]
        
        # Check if expired
        if datetime.now() > stored_data['expires']:
            del registration_otp_storage[token]
            return jsonify({'success': False, 'message': 'OTP has expired. Please register again.'})
        
        # Check if email matches
        if stored_data['email'] != email:
            return jsonify({'success': False, 'message': 'Invalid session'})
        
        # Check if OTP matches
        if stored_data['otp'] != otp:
            return jsonify({'success': False, 'message': 'Invalid OTP code'})
        
        # Create user account
        connection = get_db_connection()
        if not connection:
            return jsonify({'success': False, 'message': 'Database connection error'})
        
        try:
            cursor = connection.cursor()
            
            # Insert new user
            insert_query = """
                INSERT INTO users (first_name, last_name, email, password, role, is_verified, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """
            now = datetime.now()
            cursor.execute(insert_query, (
                stored_data['firstName'],
                stored_data['lastName'],
                stored_data['email'],
                stored_data['password'],
                'User',
                1,  # is_verified = True
                now,
                now
            ))
            
            connection.commit()
            
            # Clean up registration storage
            del registration_otp_storage[token]
            
            return jsonify({'success': True, 'message': 'Account created successfully! You can now sign in.'})
            
        except mysql.connector.Error as err:
            print(f"Database error: {err}")
            connection.rollback()
            return jsonify({'success': False, 'message': 'Failed to create account'})
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
        
    except Exception as e:
        print(f"Verify registration OTP error: {e}")
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

# Resend Registration OTP
@app.route('/api/resend-registration-otp', methods=['POST'])
def resend_registration_otp():
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        token = data.get('token', '').strip()
        
        if not all([email, token]):
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400
        
        # Check if token exists
        if token not in registration_otp_storage:
            return jsonify({'success': False, 'message': 'Invalid or expired session'})
        
        stored_data = registration_otp_storage[token]
        
        # Check if email matches
        if stored_data['email'] != email:
            return jsonify({'success': False, 'message': 'Invalid session'})
        
        # Generate new OTP and extend expiration
        new_otp = generate_otp()
        stored_data['otp'] = new_otp
        stored_data['expires'] = datetime.now() + timedelta(minutes=10)
        
        # Send new OTP email
        if send_registration_otp_email(email, new_otp, stored_data['firstName']):
            return jsonify({'success': True, 'message': 'New verification code sent successfully!'})
        else:
            return jsonify({'success': False, 'message': 'Failed to send verification email. Please try again.'}), 500
            
    except Exception as e:
        print(f"Resend registration OTP error: {e}")
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

# User Sign-in API
@app.route('/api/sign-in', methods=['POST'])
def sign_in_api():
    try:
        # Get data from form (FormData from JavaScript)
        email = request.form.get('email')
        password = request.form.get('password')

        print(f"Sign-in attempt for email: {email}")  # Debug log

        # Validate input
        if not email or not password:
            print("Missing email or password")
            return jsonify({'success': False, 'message': 'Email and password are required'}), 400

        # Clean email input
        email = email.strip().lower()

        # Find user by email
        connection = get_db_connection()
        if not connection:
            return jsonify({'success': False, 'message': 'Database connection error'}), 500
        
        try:
            cursor = connection.cursor()
            cursor.execute("SELECT id, first_name, last_name, email, password, role, is_verified FROM users WHERE email = %s", (email,))
            user_data = cursor.fetchone()
            
            if not user_data:
                print(f"User not found for email: {email}")
                return jsonify({'success': False, 'message': 'Invalid email or password'}), 401

            user_id, first_name, last_name, user_email, hashed_password, role, is_verified = user_data

            # Check password
            if not check_password_hash(hashed_password, password):
                print(f"Invalid password for user: {email}")
                return jsonify({'success': False, 'message': 'Invalid email or password'}), 401

            # Check if user is verified
            if not is_verified:
                print(f"User not verified: {email}")
                return jsonify({'success': False, 'message': 'Email not verified. Please check your email for verification instructions.'}), 403

            # Create session
            session.clear()  # Clear any existing session data
            session['user_id'] = user_id
            session['user_email'] = user_email
            session['user_name'] = f"{first_name} {last_name}"
            session['user_role'] = role
            session.permanent = True  # Make session permanent

            print(f"User {email} signed in successfully")
            return jsonify({'success': True, 'message': 'Login successful'})
            
        except mysql.connector.Error as err:
            print(f"Database error: {err}")
            return jsonify({'success': False, 'message': 'Database error'}), 500
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()

    except Exception as e:
        print(f"Sign-in error: {e}")
        return jsonify({'success': False, 'message': 'An error occurred during sign-in. Please try again.'}), 500

# Forgot Password - Send OTP (using password_reset_tokens table)
@app.route('/api/send-otp', methods=['POST'])
def send_password_reset_otp():
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        
        if not email:
            return jsonify({'success': False, 'message': 'Email is required'}), 400
        
        # Validate email format
        if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
            return jsonify({'success': False, 'message': 'Invalid email format'}), 400
        
        # Check if user exists
        connection = get_db_connection()
        if not connection:
            return jsonify({'success': False, 'message': 'Database connection error'})
        
        try:
            cursor = connection.cursor()
            cursor.execute("SELECT id, first_name FROM users WHERE email = %s", (email,))
            user_data = cursor.fetchone()
            
            if not user_data:
                return jsonify({'success': False, 'message': 'No account found with this email address'}), 404
            
            user_id, first_name = user_data
            
            # Generate OTP and token
            otp_code = generate_otp()
            token = generate_token()
            expires_at = datetime.now() + timedelta(minutes=10)
            
            # Store in password_reset_tokens table
            insert_query = """
                INSERT INTO password_reset_tokens (user_id, token, otp_code, email, expires_at, created_at)
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            cursor.execute(insert_query, (user_id, token, otp_code, email, expires_at, datetime.now()))
            connection.commit()
            
            # Send email
            if send_password_reset_email(email, otp_code, first_name):
                return jsonify({
                    'success': True, 
                    'message': 'OTP sent successfully',
                    'token': token
                })
            else:
                return jsonify({'success': False, 'message': 'Failed to send email. Please try again.'}), 500
                
        except mysql.connector.Error as err:
            print(f"Database error: {err}")
            connection.rollback()
            return jsonify({'success': False, 'message': 'Database error'})
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
            
    except Exception as e:
        print(f"Send OTP error: {e}")
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

# Verify OTP for Password Reset (using password_reset_tokens table)
@app.route('/api/verify-otp', methods=['POST'])
def verify_password_reset_otp():
    try:
        data = request.get_json()
        
        # Log the received data for debugging
        print(f"Received OTP verification data: {data}")
        
        if not data:
            print("No JSON data received")
            return jsonify({'success': False, 'message': 'No data received'}), 400
        
        email = data.get('email', '').strip().lower()
        otp = data.get('otp', '').strip()
        token = data.get('token', '').strip()
        
        print(f"Parsed data - Email: {email}, OTP: {otp}, Token: {token[:10]}...")
        
        if not email:
            print("Missing email")
            return jsonify({'success': False, 'message': 'Email is required'}), 400
        
        if not otp:
            print("Missing OTP")
            return jsonify({'success': False, 'message': 'OTP is required'}), 400
            
        if not token:
            print("Missing token")
            return jsonify({'success': False, 'message': 'Token is required'}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'success': False, 'message': 'Database connection error'})
        
        try:
            cursor = connection.cursor()
            
            # Check if token exists and is valid
            select_query = """
                SELECT id, user_id, otp_code, expires_at, used_at 
                FROM password_reset_tokens 
                WHERE token = %s AND email = %s
            """
            cursor.execute(select_query, (token, email))
            token_data = cursor.fetchone()
            
            print(f"Token data found: {token_data is not None}")
            
            if not token_data:
                return jsonify({'success': False, 'message': 'Invalid or expired session'})
            
            token_id, user_id, stored_otp, expires_at, used_at = token_data
            
            print(f"Stored OTP: {stored_otp}, Received OTP: {otp}")
            
            # Check if already used
            if used_at:
                return jsonify({'success': False, 'message': 'This reset link has already been used'})
            
            # Check if expired
            if datetime.now() > expires_at:
                return jsonify({'success': False, 'message': 'OTP has expired. Please request a new one.'})
            
            # Check if OTP matches
            if stored_otp != otp:
                return jsonify({'success': False, 'message': 'Invalid OTP code'})
            
            print("OTP verification successful")
            return jsonify({'success': True, 'message': 'OTP verified successfully'})
            
        except mysql.connector.Error as err:
            print(f"Database error: {err}")
            return jsonify({'success': False, 'message': 'Database error'})
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
        
    except Exception as e:
        print(f"Verify OTP error: {e}")
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

# Reset Password (using password_reset_tokens table)
@app.route('/api/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        new_password = data.get('new_password', '').strip()
        token = data.get('token', '').strip()
        
        if not all([email, new_password, token]):
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400
        
        # Validate password strength
        if len(new_password) < 8:
            return jsonify({'success': False, 'message': 'Password must be at least 8 characters long'}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'success': False, 'message': 'Database connection error'})
        
        try:
            cursor = connection.cursor()
            
            # Check if token exists and is valid
            select_query = """
                SELECT id, user_id, otp_code, expires_at, used_at 
                FROM password_reset_tokens 
                WHERE token = %s AND email = %s
            """
            cursor.execute(select_query, (token, email))
            token_data = cursor.fetchone()
            
            if not token_data:
                return jsonify({'success': False, 'message': 'Invalid or expired session'})
            
            token_id, user_id, stored_otp, expires_at, used_at = token_data
            
            # Check if already used
            if used_at:
                return jsonify({'success': False, 'message': 'This reset link has already been used'})
            
            # Check if expired
            if datetime.now() > expires_at:
                return jsonify({'success': False, 'message': 'Session has expired. Please start over.'})
            
            # Update user password
            hashed_password = generate_password_hash(new_password)
            update_user_query = "UPDATE users SET password = %s, updated_at = %s WHERE id = %s"
            cursor.execute(update_user_query, (hashed_password, datetime.now(), user_id))
            
            # Mark token as used
            update_token_query = "UPDATE password_reset_tokens SET used_at = %s WHERE id = %s"
            cursor.execute(update_token_query, (datetime.now(), token_id))
            
            connection.commit()
            
            return jsonify({'success': True, 'message': 'Password reset successfully'})
            
        except mysql.connector.Error as err:
            print(f"Database error: {err}")
            connection.rollback()
            return jsonify({'success': False, 'message': 'Database error'})
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
        
    except Exception as e:
        print(f"Reset password error: {e}")
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

# Logout API
@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out successfully'})

# Test database connection
@app.route('/api/test-db')
def test_db():
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'success': False, 'message': 'Failed to connect to database'})
        
        cursor = connection.cursor()
        cursor.execute("SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM password_reset_tokens")
        token_count = cursor.fetchone()[0]
        
        return jsonify({
            'success': True, 
            'message': f'Database connected successfully. Users: {user_count}, Reset tokens: {token_count}'
        })
    except Exception as e:
        return jsonify({'success': False, 'message': f'Database error: {str(e)}'})
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

# Your existing routes here...
@app.route('/')
def index():
    return render_template('sign-up.html')

@app.route('/sign-up')
def sign_up():
    return render_template('sign-up.html')

@app.route('/sign-in')
def sign_in():
    return render_template('sign-in.html')

@app.route('/loading')
def loading():
    return render_template('loading.html')

@app.route('/dashboard')
def dashboard():
    # Check if user is logged in
    if 'user_id' not in session:
        return redirect(url_for('sign_in'))
    
    # Get user data from database
    connection = get_db_connection()
    if not connection:
        return redirect(url_for('sign_in'))
    
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT first_name, last_name, email, role FROM users WHERE id = %s", (session['user_id'],))
        user_data = cursor.fetchone()
        
        if not user_data:
            session.clear()  # Clear invalid session
            return redirect(url_for('sign_in'))
        
        user = {
            'first_name': user_data[0],
            'last_name': user_data[1],
            'email': user_data[2],
            'role': user_data[3]
        }
        
        return render_template('dashboard.html', user=user)
        
    except mysql.connector.Error as err:
        print(f"Database error: {err}")
        return redirect(url_for('sign_in'))
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == '__main__':
    app.run(debug=True)
