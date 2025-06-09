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

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'diabetech-super-secret-key-change-this-in-production-2024')

# Email Configuration - OPTIONAL for development
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True').lower() == 'true'
app.config['MAIL_USE_SSL'] = os.getenv('MAIL_USE_SSL', 'False').lower() == 'true'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')

# Development mode - set to True to skip email sending
DEVELOPMENT_MODE = os.getenv('DEVELOPMENT_MODE', 'True').lower() == 'true'

# Initialize Flask-Mail only if credentials are provided
mail = None
if app.config['MAIL_USERNAME'] and app.config['MAIL_PASSWORD']:
    mail = Mail(app)
    print("✅ Email configured successfully")
else:
    print("⚠️ Email not configured - running in development mode")

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

def send_otp_email(email, otp, purpose="verification", user_name="User"):
    """Send OTP via email - with development mode support"""
    try:
        # DEVELOPMENT MODE - Always succeed and print OTP to console
        if DEVELOPMENT_MODE:
            print(f"🔐 DEVELOPMENT MODE - OTP for {email}: {otp}")
            print(f"📧 Purpose: {purpose}")
            print(f"💡 Use this OTP in your modal: {otp}")
            return True
        
        # PRODUCTION MODE - Send actual email
        if mail:
            if purpose == 'password_reset':
                subject = 'DiabeTech - Reset Your Password'
                header_title = "FORGOT PASSWORD?"
                main_title = "Reset Your Password"
                greeting = f"Hello, {user_name}!"
                message = "We received a request to reset your password for your DiabeTech account. Use the OTP below to proceed with resetting your password."
            else:
                subject = 'DiabeTech - Verify Your Email Address'
                header_title = "THANK YOU FOR SIGNING UP!"
                main_title = "Verify Your E-mail Address"
                greeting = f"Hello, {user_name}!"
                message = "Thank you for registering with DiabeTech! To complete your registration, please verify your email address."
            
            msg = Message(
                subject,
                sender=('DiabeTech', app.config['MAIL_USERNAME']),  # Display name added here
                recipients=[email]
            )
            
            # Split OTP into individual digits for display
            otp_digits = list(otp)
            
            # IMPROVED EMAIL TEMPLATE - Gmail optimized, removed logo and email icon, larger instruction message
            msg.html = f"""
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>{subject}</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden;">
                    <!-- Header Section - REMOVED logo section -->
                    <tr>
                        <td align="center" style="background-color: #8b0000; color: white; padding: 30px 20px; text-align: center;">
                            <!-- REMOVED email icon -->
                            <div style="font-size: 16px; font-weight: 500; margin-bottom: 10px; opacity: 0.9;">{header_title}</div>
                            <h1 style="font-size: 30px; font-weight: 700; margin: 0;">{main_title}</h1>
                        </td>
                    </tr>
                    
                    <!-- Content Section -->
                    <tr>
                        <td style="padding: 40px; background-color: white;">
                            <!-- Greeting -->
                            <div style="font-size: 22px; font-weight: 600; color: #1a1a1a; margin-bottom: 20px;">{greeting}</div>
                            
                            <!-- Message - ENLARGED -->
                            <div style="font-size: 18px; color: #4a5568; line-height: 1.6; margin-bottom: 30px;">{message}</div>
                            
                            <!-- OTP Label - ENLARGED -->
                            <div style="font-size: 18px; color: #1a1a1a; font-weight: 600; margin-bottom: 20px;">Here is your OTP (One-Time Password):</div>
                            
                            <!-- OTP Container - IMPROVED: Much larger numbers -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f7f8fa; border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 25px;">
                                <tr>
                                    <td align="center">
                                        <table border="0" cellpadding="0" cellspacing="0" style="display: inline-table;">
                                            <tr>
                                                <!-- LARGER OTP DIGITS: 80px boxes with 48px font -->
                                                <td style="padding-right: 15px;">
                                                    <div style="width: 80px; height: 80px; background-color: white; border: 3px solid #e5e7eb; border-radius: 12px; display: inline-block; text-align: center; line-height: 80px; font-size: 48px; font-weight: 700; color: #dc2626; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);">{otp_digits[0]}</div>
                                                </td>
                                                <td style="padding-right: 15px;">
                                                    <div style="width: 80px; height: 80px; background-color: white; border: 3px solid #e5e7eb; border-radius: 12px; display: inline-block; text-align: center; line-height: 80px; font-size: 48px; font-weight: 700; color: #dc2626; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);">{otp_digits[1]}</div>
                                                </td>
                                                <td style="padding-right: 15px;">
                                                    <div style="width: 80px; height: 80px; background-color: white; border: 3px solid #e5e7eb; border-radius: 12px; display: inline-block; text-align: center; line-height: 80px; font-size: 48px; font-weight: 700; color: #dc2626; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);">{otp_digits[2]}</div>
                                                </td>
                                                <td>
                                                    <div style="width: 80px; height: 80px; background-color: white; border: 3px solid #e5e7eb; border-radius: 12px; display: inline-block; text-align: center; line-height: 80px; font-size: 48px; font-weight: 700; color: #dc2626; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);">{otp_digits[3]}</div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Warning Box - IMPROVED: Better aligned icon -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fef3c7; border: 2px solid #f59e0b; border-radius: 10px; margin-bottom: 30px;">
                                <tr>
                                    <td style="padding: 18px;">
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td width="32" style="vertical-align: middle;">
                                                    <div style="width: 28px; height: 28px; background-color: #f59e0b; border-radius: 50%; display: inline-block; text-align: center; line-height: 28px; color: white; font-weight: bold; font-size: 16px;">⏰</div>
                                                </td>
                                                <td style="padding-left: 15px; vertical-align: middle;">
                                                    <div style="font-size: 16px; color: #92400e; font-weight: 500; margin: 0;">This code is valid for the next 5 minutes.</div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Disclaimer -->
                            <div style="font-size: 14px; color: #9ca3af; margin-bottom: 30px;">
                                If you did not {'request this password reset' if purpose == 'password_reset' else 'create this account'}, please ignore this email.
                            </div>
                            
                            <!-- Footer -->
                            <div style="text-align: center; color: #6b7280;">
                                <div style="font-size: 16px; font-weight: 500; margin-bottom: 5px;">Stay healthy,</div>
                                <div style="font-size: 14px; color: #9ca3af;">The DiabeTech Team</div>
                            </div>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """
            
            mail.send(msg)
            print(f"✅ OTP email sent to {email}")
            return True
        else:
            print(f"❌ Email configuration error - mail object not initialized")
            return False
            
    except Exception as e:
        print(f"❌ Email sending error: {e}")
        import traceback
        traceback.print_exc()
        # In development mode, still return True to continue testing
        if DEVELOPMENT_MODE:
            print(f"🔐 DEVELOPMENT MODE - Continuing with OTP: {otp}")
            return True
        return False

# REGISTRATION API (existing)
@app.route('/api/register', methods=['POST'])
def register():
    try:
        print("=== REGISTRATION REQUEST ===")
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
        
        # Test database connection first
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
            
            print(f"🔐 Generated OTP: {otp} for {email}")
            
            # Store pending registration in session
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
            
            # Try to send OTP email
            email_sent = send_otp_email(email, otp, "verification", data['firstName'])
            
            if email_sent:
                print(f"✅ Registration successful for {email}")
                return jsonify({
                    'success': True, 
                    'message': 'OTP sent to your email' if not DEVELOPMENT_MODE else f'Development mode - OTP: {otp}',
                    'token': token,
                    'development_otp': otp if DEVELOPMENT_MODE else None
                })
            else:
                print(f"❌ Failed to send email to {email}")
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

# UPDATE PROFILE API (NEW)
@app.route('/api/update-profile', methods=['POST'])
def update_profile():
    try:
        print("=== UPDATE PROFILE REQUEST ===")
        
        # Check if user is logged in
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'User not authenticated'}), 401
        
        data = request.get_json()
        user_id = session['user_id']
        
        # Validate required fields
        first_name = data.get('firstName', '').strip()
        last_name = data.get('lastName', '').strip()
        contact_number = data.get('contactNumber', '').strip()
        
        if not first_name or not last_name:
            return jsonify({'success': False, 'message': 'First name and last name are required'}), 400
        
        print(f"🔄 Updating profile for user ID: {user_id}")
        
        # Update database
        connection = get_db_connection()
        if not connection:
            return jsonify({'success': False, 'message': 'Database connection error'}), 500
        
        try:
            cursor = connection.cursor()
            
            # Update user profile
            update_query = """
                UPDATE users 
                SET first_name = %s, last_name = %s, updated_at = %s
                WHERE id = %s
            """
            
            cursor.execute(update_query, (
                first_name,
                last_name,
                datetime.now(),
                user_id
            ))
            
            if cursor.rowcount == 0:
                print(f"❌ User not found for update: {user_id}")
                return jsonify({'success': False, 'message': 'User not found'}), 404
            
            connection.commit()
            
            # Update session data
            session['user_name'] = f"{first_name} {last_name}"
            
            print(f"✅ Profile updated successfully for user ID: {user_id}")
            return jsonify({
                'success': True, 
                'message': 'Profile updated successfully!',
                'user': {
                    'first_name': first_name,
                    'last_name': last_name,
                    'email': session.get('user_email', ''),
                    'contact_number': contact_number
                }
            })
            
        except mysql.connector.Error as err:
            print(f"❌ Database error during profile update: {err}")
            connection.rollback()
            return jsonify({'success': False, 'message': 'Failed to update profile'}), 500
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
                
    except Exception as e:
        print(f"❌ Update profile error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

# SEND OTP API (for forgot password)
@app.route('/api/send-otp', methods=['POST'])
def send_otp():
    try:
        print("=== SEND OTP REQUEST ===")
        data = request.get_json()
        
        email = data.get('email', '').strip().lower()
        if not email:
            return jsonify({'success': False, 'message': 'Email is required'}), 400
        
        # Validate email format
        if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
            return jsonify({'success': False, 'message': 'Invalid email format'}), 400
        
        print(f"📧 Password reset OTP request for: {email}")
        
        # Check if user exists
        connection = get_db_connection()
        if not connection:
            return jsonify({'success': False, 'message': 'Database connection error'}), 500
        
        try:
            cursor = connection.cursor()
            cursor.execute("SELECT id, first_name, last_name FROM users WHERE email = %s", (email,))
            user_data = cursor.fetchone()
            
            if not user_data:
                print(f"❌ User not found: {email}")
                return jsonify({'success': False, 'message': 'Email address not found'}), 404
            
            user_id, first_name, last_name = user_data
            print(f"✅ User found: {first_name} {last_name}")
            
            # Generate OTP and token
            otp = generate_otp()
            token = generate_token()
            expires_at = datetime.now() + timedelta(minutes=5)
            
            print(f"🔐 Generated password reset OTP: {otp} for {email}")
            
            # Store password reset session
            session[f'password_reset_{email}'] = {
                'user_id': user_id,
                'email': email,
                'otp': otp,
                'token': token,
                'expires_at': expires_at.isoformat(),
                'attempts': 0,
                'verified': False
            }
            
            # Send OTP email
            email_sent = send_otp_email(email, otp, "password_reset", first_name)
            
            if email_sent:
                print(f"✅ Password reset OTP sent to {email}")
                return jsonify({
                    'success': True, 
                    'message': 'OTP sent to your email' if not DEVELOPMENT_MODE else f'Development mode - OTP: {otp}',
                    'token': token,
                    'development_otp': otp if DEVELOPMENT_MODE else None
                })
            else:
                print(f"❌ Failed to send password reset OTP to {email}")
                return jsonify({'success': False, 'message': 'Failed to send OTP email'}), 500
                
        except mysql.connector.Error as err:
            print(f"❌ Database error: {err}")
            return jsonify({'success': False, 'message': 'Database error'}), 500
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
                
    except Exception as e:
        print(f"❌ Send OTP error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

# VERIFY OTP API (handles both registration and password reset)
@app.route('/api/verify-otp', methods=['POST'])
def verify_otp():
    try:
        print("=== OTP VERIFICATION ===")
        data = request.get_json()
        
        email = data.get('email', '').strip().lower()
        otp = data.get('otp', '').strip()
        token = data.get('token', '').strip()
        
        if not email or not otp:
            return jsonify({'success': False, 'message': 'Email and OTP are required'}), 400
        
        print(f"🔍 Verifying OTP for {email}: {otp}")
        
        # Check for registration verification first
        registration_key = f'pending_registration_{email}'
        registration_data = session.get(registration_key)
        
        if registration_data:
            print("📝 Processing registration OTP verification")
            
            # Check if OTP has expired
            expires_at = datetime.fromisoformat(registration_data['expires_at'])
            if datetime.now() > expires_at:
                print(f"❌ Registration OTP expired for {email}")
                session.pop(registration_key, None)
                return jsonify({'success': False, 'message': 'OTP has expired. Please register again.'}), 400
            
            # Check attempts
            if registration_data.get('attempts', 0) >= 3:
                print(f"❌ Too many registration attempts for {email}")
                session.pop(registration_key, None)
                return jsonify({'success': False, 'message': 'Too many failed attempts. Please register again.'}), 400
            
            # Verify OTP
            if otp != registration_data['otp']:
                print(f"❌ Invalid registration OTP for {email}")
                registration_data['attempts'] = registration_data.get('attempts', 0) + 1
                session[registration_key] = registration_data
                return jsonify({'success': False, 'message': 'Invalid OTP. Please try again.'}), 400
            
            # Create user account
            connection = get_db_connection()
            if not connection:
                return jsonify({'success': False, 'message': 'Database connection error'}), 500
            
            try:
                cursor = connection.cursor()
                insert_query = """
                    INSERT INTO users (first_name, last_name, email, password, role, is_verified, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """
                now = datetime.now()
                
                cursor.execute(insert_query, (
                    registration_data['firstName'],
                    registration_data['lastName'],
                    registration_data['email'],
                    registration_data['password'],
                    'User',
                    1,  # is_verified = True
                    now,
                    now
                ))
                
                connection.commit()
                session.pop(registration_key, None)
                
                print(f"✅ User account created successfully for {email}")
                return jsonify({'success': True, 'message': 'Account created successfully!'})
                
            except mysql.connector.Error as err:
                print(f"❌ Database error during user creation: {err}")
                connection.rollback()
                return jsonify({'success': False, 'message': 'Failed to create account'}), 500
            finally:
                if connection.is_connected():
                    cursor.close()
                    connection.close()
        
        # Check for password reset verification
        reset_key = f'password_reset_{email}'
        reset_data = session.get(reset_key)
        
        if reset_data:
            print("🔑 Processing password reset OTP verification")
            
            # Check if OTP has expired
            expires_at = datetime.fromisoformat(reset_data['expires_at'])
            if datetime.now() > expires_at:
                print(f"❌ Password reset OTP expired for {email}")
                session.pop(reset_key, None)
                return jsonify({'success': False, 'message': 'OTP has expired. Please request a new one.'}), 400
            
            # Check attempts
            if reset_data.get('attempts', 0) >= 3:
                print(f"❌ Too many password reset attempts for {email}")
                session.pop(reset_key, None)
                return jsonify({'success': False, 'message': 'Too many failed attempts. Please try again.'}), 400
            
            # Verify OTP
            if otp != reset_data['otp']:
                print(f"❌ Invalid password reset OTP for {email}")
                reset_data['attempts'] = reset_data.get('attempts', 0) + 1
                session[reset_key] = reset_data
                return jsonify({'success': False, 'message': 'Invalid OTP. Please try again.'}), 400
            
            # Mark as verified
            reset_data['verified'] = True
            session[reset_key] = reset_data
            
            print(f"✅ Password reset OTP verified for {email}")
            return jsonify({'success': True, 'message': 'OTP verified successfully!'})
        
        # No pending verification found
        print(f"❌ No pending verification found for {email}")
        return jsonify({'success': False, 'message': 'No pending verification found'}), 400
                
    except Exception as e:
        print(f"❌ OTP verification error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

# RESET PASSWORD API
@app.route('/api/reset-password', methods=['POST'])
def reset_password():
    try:
        print("=== RESET PASSWORD REQUEST ===")
        data = request.get_json()
        
        email = data.get('email', '').strip().lower()
        new_password = data.get('new_password', '').strip()
        token = data.get('token', '').strip()
        
        if not email or not new_password:
            return jsonify({'success': False, 'message': 'Email and new password are required'}), 400
        
        if len(new_password) < 8:
            return jsonify({'success': False, 'message': 'Password must be at least 8 characters long'}), 400
        
        print(f"🔑 Password reset request for: {email}")
        
        # Check password reset session
        reset_key = f'password_reset_{email}'
        reset_data = session.get(reset_key)
        
        if not reset_data:
            print(f"❌ No password reset session found for {email}")
            return jsonify({'success': False, 'message': 'Invalid reset session'}), 400
        
        if not reset_data.get('verified', False):
            print(f"❌ OTP not verified for {email}")
            return jsonify({'success': False, 'message': 'OTP verification required'}), 400
        
        # Update password in database
        connection = get_db_connection()
        if not connection:
            return jsonify({'success': False, 'message': 'Database connection error'}), 500
        
        try:
            cursor = connection.cursor()
            
            # Hash new password
            hashed_password = generate_password_hash(new_password)
            
            # Update user password
            update_query = "UPDATE users SET password = %s, updated_at = %s WHERE email = %s"
            cursor.execute(update_query, (hashed_password, datetime.now(), email))
            
            if cursor.rowcount == 0:
                print(f"❌ User not found for password update: {email}")
                return jsonify({'success': False, 'message': 'User not found'}), 404
            
            connection.commit()
            
            # Clear password reset session
            session.pop(reset_key, None)
            
            print(f"✅ Password updated successfully for {email}")
            return jsonify({'success': True, 'message': 'Password updated successfully!'})
            
        except mysql.connector.Error as err:
            print(f"❌ Database error during password update: {err}")
            connection.rollback()
            return jsonify({'success': False, 'message': 'Failed to update password'}), 500
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
                
    except Exception as e:
        print(f"❌ Reset password error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

# RESEND OTP API (handles both registration and password reset)
@app.route('/api/resend-otp', methods=['POST'])
def resend_otp():
    try:
        print("=== RESEND OTP ===")
        data = request.get_json()
        
        email = data.get('email', '').strip().lower()
        if not email:
            return jsonify({'success': False, 'message': 'Email is required'}), 400
        
        # Check for registration resend
        registration_key = f'pending_registration_{email}'
        registration_data = session.get(registration_key)
        
        if registration_data:
            print(f"📝 Resending registration OTP for {email}")
            
            # Generate new OTP
            new_otp = generate_otp()
            new_expires_at = datetime.now() + timedelta(minutes=5)
            
            # Update pending data
            registration_data['otp'] = new_otp
            registration_data['expires_at'] = new_expires_at.isoformat()
            registration_data['attempts'] = 0  # Reset attempts
            session[registration_key] = registration_data
            
            # Send new OTP
            if send_otp_email(email, new_otp, "verification", registration_data['firstName']):
                print(f"✅ New registration OTP sent to {email}")
                return jsonify({
                    'success': True, 
                    'message': 'New OTP sent successfully',
                    'development_otp': new_otp if DEVELOPMENT_MODE else None
                })
            else:
                return jsonify({'success': False, 'message': 'Failed to send OTP'}), 500
        
        # Check for password reset resend
        reset_key = f'password_reset_{email}'
        reset_data = session.get(reset_key)
        
        if reset_data:
            print(f"🔑 Resending password reset OTP for {email}")
            
            # Generate new OTP
            new_otp = generate_otp()
            new_expires_at = datetime.now() + timedelta(minutes=5)
            new_token = generate_token()
            
            # Update reset data
            reset_data['otp'] = new_otp
            reset_data['token'] = new_token
            reset_data['expires_at'] = new_expires_at.isoformat()
            reset_data['attempts'] = 0  # Reset attempts
            reset_data['verified'] = False  # Reset verification
            session[reset_key] = reset_data
            
            # Send new OTP
            if send_otp_email(email, new_otp, "password_reset", "User"):
                print(f"✅ New password reset OTP sent to {email}")
                return jsonify({
                    'success': True, 
                    'message': 'New OTP sent successfully',
                    'token': new_token,
                    'development_otp': new_otp if DEVELOPMENT_MODE else None
                })
            else:
                return jsonify({'success': False, 'message': 'Failed to send OTP'}), 500
        
        # No pending session found
        print(f"❌ No pending session found for {email}")
        return jsonify({'success': False, 'message': 'No pending verification found'}), 400
            
    except Exception as e:
        print(f"❌ Resend OTP error: {e}")
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

# SIGN-IN API (existing)
@app.route('/api/sign-in', methods=['POST'])
def sign_in_api():
    try:
        print("=== SIGN-IN REQUEST ===")
        
        email = request.form.get('email')
        password = request.form.get('password')

        if not email or not password:
            return jsonify({'success': False, 'message': 'Email and password are required'}), 400

        email = email.strip().lower()
        connection = get_db_connection()
        if not connection:
            return jsonify({'success': False, 'message': 'Database connection error'}), 500
        
        try:
            cursor = connection.cursor()
            cursor.execute("SELECT id, first_name, last_name, email, password, role, is_verified, created_at FROM users WHERE email = %s", (email,))
            user_data = cursor.fetchone()
            
            if not user_data:
                return jsonify({'success': False, 'message': 'Invalid email or password'}), 401

            user_id, first_name, last_name, user_email, hashed_password, role, is_verified, created_at = user_data

            if not check_password_hash(hashed_password, password):
                return jsonify({'success': False, 'message': 'Invalid email or password'}), 401

            session.clear()
            session['user_id'] = user_id
            session['user_email'] = user_email
            session['user_name'] = f"{first_name} {last_name}"
            session['user_role'] = role
            session['user_created_at'] = created_at.isoformat() if created_at else None
            session.permanent = True

            print(f"✅ User {email} signed in successfully")
            return jsonify({'success': True, 'message': 'Login successful'})
            
        except mysql.connector.Error as err:
            print(f"Database error during sign-in: {err}")
            return jsonify({'success': False, 'message': 'Database error'}), 500
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()

    except Exception as e:
        print(f"Sign-in error: {e}")
        return jsonify({'success': False, 'message': 'An error occurred during sign-in'}), 500

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

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect('/sign-in')
    
    # Get user data from database for the most up-to-date info
    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor()
            cursor.execute("SELECT first_name, last_name, email, role, created_at FROM users WHERE id = %s", (session['user_id'],))
            user_data_db = cursor.fetchone()
            
            if user_data_db:
                first_name, last_name, email, role, created_at = user_data_db
                user_data = {
                    'first_name': first_name,
                    'last_name': last_name,
                    'email': email,
                    'role': role,
                    'created_at': created_at
                }
            else:
                # Fallback to session data
                user_data = {
                    'first_name': session.get('user_name', 'User').split()[0],
                    'last_name': session.get('user_name', 'User').split()[-1],
                    'email': session.get('user_email', ''),
                    'role': session.get('user_role', 'User'),
                    'created_at': None
                }
        except mysql.connector.Error as err:
            print(f"Database error getting user data: {err}")
            # Fallback to session data
            user_data = {
                'first_name': session.get('user_name', 'User').split()[0],
                'last_name': session.get('user_name', 'User').split()[-1],
                'email': session.get('user_email', ''),
                'role': session.get('user_role', 'User'),
                'created_at': None
            }
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
    else:
        # Fallback to session data
        user_data = {
            'first_name': session.get('user_name', 'User').split()[0],
            'last_name': session.get('user_name', 'User').split()[-1],
            'email': session.get('user_email', ''),
            'role': session.get('user_role', 'User'),
            'created_at': None
        }
    
    return render_template('dashboard.html', user=user_data)

# Add this route after the dashboard route and before the logout route

@app.route('/patients')
def patients():
    if 'user_id' not in session:
        return redirect('/sign-in')
    
    # Get user data from database for the most up-to-date info
    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor()
            cursor.execute("SELECT first_name, last_name, email, role, created_at FROM users WHERE id = %s", (session['user_id'],))
            user_data_db = cursor.fetchone()
            
            if user_data_db:
                first_name, last_name, email, role, created_at = user_data_db
                user_data = {
                    'first_name': first_name,
                    'last_name': last_name,
                    'email': email,
                    'role': role,
                    'created_at': created_at
                }
            else:
                # Fallback to session data
                user_data = {
                    'first_name': session.get('user_name', 'User').split()[0],
                    'last_name': session.get('user_name', 'User').split()[-1],
                    'email': session.get('user_email', ''),
                    'role': session.get('user_role', 'User'),
                    'created_at': None
                }
        except mysql.connector.Error as err:
            print(f"Database error getting user data: {err}")
            # Fallback to session data
            user_data = {
                'first_name': session.get('user_name', 'User').split()[0],
                'last_name': session.get('user_name', 'User').split()[-1],
                'email': session.get('user_email', ''),
                'role': session.get('user_role', 'User'),
                'created_at': None
            }
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
    else:
        # Fallback to session data
        user_data = {
            'first_name': session.get('user_name', 'User').split()[0],
            'last_name': session.get('user_name', 'User').split()[-1],
            'email': session.get('user_email', ''),
            'role': session.get('user_role', 'User'),
            'created_at': None
        }
    
    return render_template('patients.html', user=user_data)

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
        
        return jsonify({
            'success': True, 
            'message': f'Database connected successfully. Users: {user_count}',
            'development_mode': DEVELOPMENT_MODE
        })
    except Exception as e:
        return jsonify({'success': False, 'message': f'Database error: {str(e)}'})
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == '__main__':
    print("🚀 Starting DiabeTech Flask App")
    print(f"📧 Development Mode: {DEVELOPMENT_MODE}")
    print(f"🔗 Database: {DATABASE_CONFIG['database']}")
    app.run(debug=True)
