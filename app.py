from flask import Flask, request, jsonify, session, render_template, redirect, url_for, flash
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
from routes.prescription_routes import prescription_bp
import sqlite3

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

# Register prescription blueprint
app.register_blueprint(prescription_bp)

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

# UPDATE PROFILE API (existing)
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
      specialization = data.get('specialization', '').strip() # NEW
      medical_license = data.get('medicalLicense', '').strip() # NEW
      
      if not first_name or not last_name:
          return jsonify({'success': False, 'message': 'First name and last name are required'}), 400
      
      print(f"🔄 Updating profile for user ID: {user_id}")
      
      # Update database
      connection = get_db_connection()
      if not connection:
          return jsonify({'success': False, 'message': 'Database connection error'}), 500
      
      try:
          cursor = connection.cursor()
          
          # Update user profile (assuming specialization and medical_license fields exist in your 'users' table)
          # If they don't exist, you'll need to add them to your database schema.
          update_query = """
              UPDATE users 
              SET first_name = %s, last_name = %s, specialization = %s, medical_license = %s, updated_at = %s
              WHERE id = %s
          """
          
          cursor.execute(update_query, (
              first_name,
              last_name,
              specialization, # NEW
              medical_license, # NEW
              datetime.now(),
              user_id
          ))
          
          if cursor.rowcount == 0:
              print(f"❌ User not found for update: {user_id}")
              return jsonify({'success': False, 'message': 'User not found'}), 404
          
          connection.commit()
          
          # Update session data (optional, but good for consistency)
          session['user_name'] = f"{first_name} {last_name}"
          
          print(f"✅ Profile updated successfully for user ID: {user_id}")
          return jsonify({
              'success': True, 
              'message': 'Profile updated successfully!',
              'user': {
                  'first_name': first_name,
                  'last_name': last_name,
                  'email': session.get('user_email', ''),
                  'specialization': specialization, # NEW
                  'medical_license': medical_license # NEW
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

# NEW: API endpoint for initiating password change from settings (maps to send_otp)
@app.route('/api/initiate-password-change', methods=['POST'])
def api_initiate_password_change():
  return send_otp()

# NEW: API endpoint for verifying password change OTP (maps to verify_otp)
@app.route('/api/verify-password-change-otp', methods=['POST'])
def api_verify_password_change_otp():
  return verify_otp()

# NEW: API endpoint for updating password from settings (maps to reset_password)
@app.route('/api/update-password', methods=['POST'])
def api_update_password():
  # This endpoint expects 'new_password' and 'email' in the JSON body.
  # The 'email' should come from the session or be passed from the client after OTP verification.
  # For simplicity, we'll assume the email is passed and the session for password_reset is active.
  data = request.get_json()
  email = data.get('email')
  new_password = data.get('new_password')
  
  # Ensure the email is associated with a verified password reset session
  reset_key = f'password_reset_{email}'
  reset_data = session.get(reset_key)
  
  if not reset_data or not reset_data.get('verified', False):
      return jsonify({'success': False, 'message': 'Password change not authorized. Please verify OTP first.'}), 403
  
  # Call the existing reset_password logic
  return reset_password()

# NEW: API endpoint for deleting account
@app.route('/api/delete-account', methods=['POST'])
def delete_account():
  try:
      print("=== DELETE ACCOUNT REQUEST ===")
      if 'user_id' not in session:
          return jsonify({'success': False, 'message': 'User not authenticated'}), 401
      
      user_id = session['user_id']
      
      connection = get_db_connection()
      if not connection:
          return jsonify({'success': False, 'message': 'Database connection error'}), 500
      
      try:
          cursor = connection.cursor()
          # Delete user from database
          delete_query = "DELETE FROM users WHERE id = %s"
          cursor.execute(delete_query, (user_id,))
          
          if cursor.rowcount == 0:
              print(f"❌ User not found for deletion: {user_id}")
              return jsonify({'success': False, 'message': 'User not found'}), 404
          
          connection.commit()
          session.clear() # Clear session after account deletion
          
          print(f"✅ Account deleted successfully for user ID: {user_id}")
          return jsonify({'success': True, 'message': 'Account deleted successfully'})
          
      except mysql.connector.Error as err:
          print(f"❌ Database error during account deletion: {err}")
          connection.rollback()
          return jsonify({'success': False, 'message': 'Failed to delete account'}), 500
      finally:
          if connection.is_connected():
              cursor.close()
              connection.close()
              
  except Exception as e:
      print(f"❌ Delete account error: {e}")
      import traceback
      traceback.print_exc()
      return jsonify({'success': False, 'message': 'Internal server error'}), 500

# NEW: API endpoint for profile picture upload (placeholder)
@app.route('/api/upload-profile-picture', methods=['POST'])
def upload_profile_picture():
    try:
        print("=== PROFILE PICTURE UPLOAD REQUEST ===")
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'User not authenticated'}), 401

        if 'profile_picture' not in request.files:
            return jsonify({'success': False, 'message': 'No file part'}), 400

        file = request.files['profile_picture']
        if file.filename == '':
            return jsonify({'success': False, 'message': 'No selected file'}), 400

        if file:
            # In a real application, you would save the file to a secure location
            # and store its path in the database. For this example, we'll just
            # acknowledge the upload and return a placeholder URL.
            # Example: filename = secure_filename(file.filename)
            # file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            
            # Simulate a successful upload by returning a placeholder URL
            # In a real app, this would be the actual URL to the saved image
            simulated_image_url = "/placeholder.svg?height=100&width=100" # Or a more dynamic URL if you have a storage service
            
            # You might want to update the user's profile in the DB with this URL
            # For now, we'll just return success.
            
            print(f"✅ Simulated profile picture upload for user ID: {session['user_id']}")
            return jsonify({
                'success': True,
                'message': 'Profile picture uploaded successfully (simulated)!',
                'imageUrl': simulated_image_url
            })
        
    except Exception as e:
        print(f"❌ Profile picture upload error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': 'Internal server error'}), 500


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

# Add Patient Route

@app.route('/api/add-patient', methods=['POST'])
def add_patient():
    try:
        print("=== ADD PATIENT REQUEST ===")
        
        # Check if user is logged in
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'User not authenticated'}), 401
        
        data = request.get_json()
        user_id = session['user_id']
        
        print(f"👤 Adding patient for user ID: {user_id}")
        print(f"📋 Patient data: {data}")
        
        # Validate required fields
        if not data.get('patientId'):
            return jsonify({'success': False, 'message': 'Patient ID is required'}), 400
        
        basic_info = data.get('basicInfo', {})
        if not basic_info.get('sex') or not basic_info.get('age'):
            return jsonify({'success': False, 'message': 'Sex and age are required'}), 400
        
        # Connect to database
        connection = get_db_connection()
        if not connection:
            return jsonify({'success': False, 'message': 'Database connection error'}), 500
        
        try:
            cursor = connection.cursor()
            
            # Check if patient ID already exists
            cursor.execute("SELECT id FROM patients WHERE patient_id = %s", (data['patientId'],))
            existing_patient = cursor.fetchone()
            
            if existing_patient:
                return jsonify({'success': False, 'message': 'Patient ID already exists'}), 400
            
            # Calculate risk level
            risk_level = calculate_risk_level(data)
            
            # Prepare data from different sections
            health_data = data.get('health', {})
            notes_data = data.get('notes', {})
            lifestyle_data = data.get('lifestyle', {})
            
            # Prepare complications string
            complications = []
            if health_data.get('knownConditions'):
                complications.append(health_data['knownConditions'])
            if not complications:
                complications.append('None')
            complications_str = ' / '.join(complications)
            
            # Insert patient into database with all new fields
            insert_query = """
                INSERT INTO patients (
                    patient_id, doctor_id, age, sex, smoking_status, date_of_birth,
                    diabetes_type, family_history, known_conditions, current_medications, allergies,
                    height, weight, bmi, blood_pressure, fasting_glucose, glucose_level, blood_sugar_level, 
                    hba1c, cholesterol_level, waist_circumference,
                    physical_activity, alcohol_consumption, stress_level, diet_type, sleep_duration,
                    risk_level, monitoring_frequency, checkup_frequency, initial_diagnosis, 
                    last_checkup_date, next_followup_date, complications, medical_history, 
                    remarks_notes, notes, created_at, updated_at
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 
                    %s, %s, %s, %s, %s, %s
                )
            """
            
            now = datetime.now()
            
            cursor.execute(insert_query, (
                # Basic patient info
                data['patientId'],
                user_id,
                basic_info.get('age'),
                basic_info.get('sex'),
                basic_info.get('smokingStatus'),
                basic_info.get('dateOfBirth') if basic_info.get('dateOfBirth') else None,
                
                # Medical history
                health_data.get('diabetesType'),
                health_data.get('familyHistory'),
                health_data.get('knownConditions'),
                health_data.get('currentMedications'),
                health_data.get('allergies'),
                
                # Clinical measurements
                health_data.get('height'),
                health_data.get('weight'),
                health_data.get('bmi'),
                health_data.get('bloodPressure'),
                health_data.get('fastingGlucose'),
                health_data.get('fastingGlucose'),  # glucose_level for backward compatibility
                health_data.get('bloodSugarLevel'),
                health_data.get('hba1c'),
                health_data.get('cholesterolLevel'),
                health_data.get('waistCircumference'),
                
                # Lifestyle factors
                lifestyle_data.get('physicalActivity'),
                lifestyle_data.get('alcoholConsumption'),
                lifestyle_data.get('stressLevel'),
                lifestyle_data.get('dietType'),
                lifestyle_data.get('sleepDuration'),
                
                # Risk and monitoring
                risk_level,
                notes_data.get('monitoringFrequency'),
                notes_data.get('monitoringFrequency'),  # checkup_frequency for backward compatibility
                notes_data.get('initialDiagnosis'),
                notes_data.get('lastCheckupDate') if notes_data.get('lastCheckupDate') else None,
                notes_data.get('nextFollowUp') if notes_data.get('nextFollowUp') else None,
                
                # Notes and documentation
                complications_str,
                health_data.get('knownConditions'),  # medical_history for backward compatibility
                notes_data.get('remarksNotes'),
                notes_data.get('remarksNotes'),  # notes for backward compatibility
                
                # Timestamps
                now,
                now
            ))
            
            patient_db_id = cursor.lastrowid
            connection.commit()
            
            print(f"✅ Patient {data['patientId']} added successfully with DB ID: {patient_db_id}")
            
            # Return the created patient data
            return jsonify({
                'success': True,
                'message': 'Patient record saved successfully!',
                'patient': {
                    'id': patient_db_id,
                    'patientId': data['patientId'],
                    'age': basic_info.get('age'),
                    'sex': basic_info.get('sex'),
                    'riskLevel': risk_level,
                    'checkupFrequency': notes_data.get('monitoringFrequency', 'Not Set'),
                    'complications': complications_str,
                    'bmi': health_data.get('bmi'),
                    'fastingGlucose': health_data.get('fastingGlucose'),
                    'bloodPressure': health_data.get('bloodPressure')
                }
            })
            
        except mysql.connector.Error as err:
            print(f"❌ Database error during patient creation: {err}")
            connection.rollback()
            return jsonify({'success': False, 'message': 'Failed to add patient record'}), 500
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
                
    except Exception as e:
        print(f"❌ Add patient error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

# Enhanced risk calculation function
def calculate_risk_level(patient_data):
    """Enhanced risk calculation based on comprehensive patient data"""
    risk_score = 0
    
    # Age factor (0-20 points)
    age = patient_data.get('basicInfo', {}).get('age', 0)
    if age > 65:
        risk_score += 20
    elif age > 45:
        risk_score += 15
    elif age > 30:
        risk_score += 5
    
    # Health factors
    health = patient_data.get('health', {})
    
    # BMI (0-20 points)
    bmi = health.get('bmi')
    if bmi:
        if bmi > 35:
            risk_score += 20
        elif bmi > 30:
            risk_score += 15
        elif bmi > 25:
            risk_score += 10
    
    # Glucose levels (0-25 points)
    fasting_glucose = health.get('fastingGlucose')
    if fasting_glucose:
        if fasting_glucose > 180:
            risk_score += 25
        elif fasting_glucose > 140:
            risk_score += 20
        elif fasting_glucose > 100:
            risk_score += 10
    
    blood_sugar = health.get('bloodSugarLevel')
    if blood_sugar:
        if blood_sugar > 200:
            risk_score += 20
        elif blood_sugar > 160:
            risk_score += 15
        elif blood_sugar > 120:
            risk_score += 10
    
    # HbA1c (0-25 points)
    hba1c = health.get('hba1c')
    if hba1c:
        if hba1c > 9:
            risk_score += 25
        elif hba1c > 7:
            risk_score += 20
        elif hba1c > 6.5:
            risk_score += 10
    
    # Blood pressure (0-15 points)
    bp = health.get('bloodPressure')
    if bp and '/' in bp:
        try:
            systolic = int(bp.split('/')[0])
            if systolic > 160:
                risk_score += 15
            elif systolic > 140:
                risk_score += 10
            elif systolic > 120:
                risk_score += 5
        except:
            pass
    
    # Lifestyle factors
    lifestyle = patient_data.get('lifestyle', {})
    basic_info = patient_data.get('basicInfo', {})
    
    # Smoking (0-20 points)
    smoking = basic_info.get('smokingStatus')
    if smoking == 'Smoker':
        risk_score += 20
    elif smoking == 'Former':
        risk_score += 10
    
    # Physical activity (0-15 points)
    activity = lifestyle.get('physicalActivity')
    if activity == 'Sedentary':
        risk_score += 15
    elif activity == 'Moderate':
        risk_score += 8
    
    # Stress level (0-10 points)
    stress = lifestyle.get('stressLevel')
    if stress == 'High':
        risk_score += 10
    elif stress == 'Moderate':
        risk_score += 5
    
    # Alcohol consumption (0-15 points)
    alcohol = lifestyle.get('alcoholConsumption')
    if alcohol == 'Heavy':
        risk_score += 15
    elif alcohol == 'Regularly':
        risk_score += 8
    
    # Sleep duration (0-10 points)
    sleep = lifestyle.get('sleepDuration')
    if sleep:
        if sleep < 6:
            risk_score += 10
        elif sleep > 9:
            risk_score += 5
    
    # Family history (0-10 points)
    family_history = health.get('familyHistory')
    if family_history == 'Yes':
        risk_score += 10
    
    # Known conditions (0-15 points)
    known_conditions = health.get('knownConditions', '').lower()
    if any(condition in known_conditions for condition in ['hypertension', 'cardiovascular', 'kidney', 'retinopathy', 'neuropathy']):
        risk_score += 15
    
    # Determine risk level based on total score
    print(f"🔍 Calculated risk score: {risk_score}")
    
    if risk_score >= 70:
        return 'High Risk'
    elif risk_score >= 35:
        return 'Moderate Risk'
    else:
        return 'Low Risk'
    
# NEW: Settings Page Route
@app.route('/settings')
def settings():
  if 'user_id' not in session:
      return redirect('/sign-in')
  
  connection = get_db_connection()
  user_data = {}
  if connection:
      try:
          cursor = connection.cursor()
          # Fetch specialization and medical_license from DB
          cursor.execute("SELECT first_name, last_name, email, role, created_at, specialization, medical_license FROM users WHERE id = %s", (session['user_id'],))
          user_data_db = cursor.fetchone()
          
          if user_data_db:
              first_name, last_name, email, role, created_at, specialization, medical_license = user_data_db
              user_data = {
                  'first_name': first_name,
                  'last_name': last_name,
                  'email': email,
                  'role': role,
                  'created_at': created_at,
                  'specialization': specialization if specialization else 'Not Set', # Default value
                  'medical_license': medical_license if medical_license else 'Not Set' # Default value
              }
          else:
              user_data = {
                  'first_name': session.get('user_name', 'User').split()[0],
                  'last_name': session.get('user_name', 'User').split()[-1],
                  'email': session.get('user_email', ''),
                  'role': session.get('user_role', 'User'),
                  'created_at': None,
                  'specialization': 'Not Set',
                  'medical_license': 'Not Set'
              }
      except mysql.connector.Error as err:
          print(f"Database error getting user data for settings: {err}")
          user_data = {
              'first_name': session.get('user_name', 'User').split()[0],
              'last_name': session.get('user_name', 'User').split()[-1],
              'email': session.get('user_email', ''),
              'role': session.get('user_role', 'User'),
              'created_at': None,
              'specialization': 'Not Set',
              'medical_license': 'Not Set'
          }
      finally:
          if connection.is_connected():
              cursor.close()
              connection.close()
  else:
      user_data = {
          'first_name': session.get('user_name', 'User').split()[0],
          'last_name': session.get('user_name', 'User').split()[-1],
          'email': session.get('user_email', ''),
          'role': session.get('user_role', 'User'),
          'created_at': None,
          'specialization': 'Not Set',
          'medical_license': 'Not Set'
      }
  
  return render_template('settings.html', user=user_data)


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
