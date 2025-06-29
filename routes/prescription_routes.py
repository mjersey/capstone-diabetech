from flask import Blueprint, request, jsonify, session, render_template, redirect, url_for
from datetime import datetime, timedelta
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash
import os
from dotenv import load_dotenv
import sqlite3

# Load environment variables
load_dotenv()

# Create Blueprint for prescription routes
prescription_bp = Blueprint('prescription', __name__)

# Database Configuration (same as main app)
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

# ===== PRESCRIPTION ROUTES =====

@prescription_bp.route('/prescription')
def prescription_page():
    """Prescription management page"""
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
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
    
    return render_template('prescription.html', user=user_data)

@prescription_bp.route('/api/prescriptions/sync', methods=['GET'])
def sync_prescriptions():
    """Sync prescriptions from localStorage - only return generated prescriptions"""
    try:
        print("=== PRESCRIPTION SYNC REQUEST ===")
        
        # Check if user is logged in
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'User not authenticated'}), 401
        
        # This endpoint will be called by the frontend to sync prescription data
        # The frontend will send the localStorage data and we'll filter for generated prescriptions only
        
        return jsonify({
            'success': True,
            'message': 'Prescription sync endpoint ready',
            'instructions': 'Send localStorage prescription data to filter generated prescriptions only'
        })
        
    except Exception as e:
        print(f"❌ Prescription sync error: {e}")
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

@prescription_bp.route('/api/prescriptions/bulk-print', methods=['POST'])
def bulk_print_prescriptions():
    """Handle bulk printing of prescriptions"""
    try:
        print("=== BULK PRINT PRESCRIPTIONS ===")
        
        # Check if user is logged in
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'User not authenticated'}), 401
        
        data = request.get_json()
        prescription_ids = data.get('prescriptionIds', [])
        print_format = data.get('printFormat', 'individual')
        
        if not prescription_ids:
            return jsonify({'success': False, 'message': 'No prescriptions selected'}), 400
        
        print(f"📄 Bulk printing {len(prescription_ids)} prescriptions in {print_format} format")
        
        # In a real application, you might:
        # 1. Fetch prescription data from database
        # 2. Generate PDF files
        # 3. Send to printer queue
        # 4. Update prescription status to "Printed"
        
        # For now, we'll simulate the process
        return jsonify({
            'success': True,
            'message': f'Successfully processed {len(prescription_ids)} prescriptions for printing',
            'printedCount': len(prescription_ids),
            'format': print_format
        })
        
    except Exception as e:
        print(f"❌ Bulk print error: {e}")
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

@prescription_bp.route('/api/prescriptions/<prescription_id>/print', methods=['POST'])
def print_single_prescription(prescription_id):
    """Handle single prescription printing"""
    try:
        print(f"=== PRINT SINGLE PRESCRIPTION: {prescription_id} ===")
        
        # Check if user is logged in
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'User not authenticated'}), 401
        
        # In a real application, you might:
        # 1. Fetch prescription data from database
        # 2. Generate PDF file
        # 3. Send to printer
        # 4. Update prescription status to "Printed"
        
        print(f"🖨️ Printing prescription {prescription_id}")
        
        return jsonify({
            'success': True,
            'message': f'Prescription {prescription_id} sent to printer successfully'
        })
        
    except Exception as e:
        print(f"❌ Single print error: {e}")
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

@prescription_bp.route('/api/prescriptions/<prescription_id>', methods=['GET'])
def get_prescription_details(prescription_id):
    """Get detailed prescription information"""
    try:
        print(f"=== GET PRESCRIPTION DETAILS: {prescription_id} ===")
        
        # Check if user is logged in
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'User not authenticated'}), 401
        
        # In a real application, you would fetch from database
        # For now, return a success response that the frontend can handle
        
        return jsonify({
            'success': True,
            'message': 'Prescription details endpoint ready',
            'prescriptionId': prescription_id
        })
        
    except Exception as e:
        print(f"❌ Get prescription details error: {e}")
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

@prescription_bp.route('/api/prescriptions/<prescription_id>/edit', methods=['PUT'])
def edit_prescription(prescription_id):
    """Edit prescription details"""
    try:
        print(f"=== EDIT PRESCRIPTION: {prescription_id} ===")
        
        # Check if user is logged in
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'User not authenticated'}), 401
        
        data = request.get_json()
        
        # In a real application, you would:
        # 1. Validate the prescription belongs to the current user
        # 2. Update prescription data in database
        # 3. Return updated prescription data
        
        print(f"✏️ Editing prescription {prescription_id}")
        
        return jsonify({
            'success': True,
            'message': f'Prescription {prescription_id} updated successfully',
            'prescriptionId': prescription_id
        })
        
    except Exception as e:
        print(f"❌ Edit prescription error: {e}")
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

@prescription_bp.route('/api/prescriptions/stats', methods=['GET'])
def get_prescription_stats():
    """Get prescription statistics"""
    try:
        print("=== GET PRESCRIPTION STATS ===")
        
        # Check if user is logged in
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'User not authenticated'}), 401
        
        # In a real application, you would calculate these from database
        # For now, return sample stats that the frontend can use
        
        stats = {
            'total': 0,
            'completedToday': 0,
            'printed': 0,
            'totalChange': '12.5%',
            'completedTodayChange': '8.3%',
            'printedChange': '15.2%'
        }
        
        return jsonify({
            'success': True,
            'stats': stats
        })
        
    except Exception as e:
        print(f"❌ Get prescription stats error: {e}")
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

@prescription_bp.route('/api/prescriptions/generate-all', methods=['POST'])
def generate_all_prescriptions():
    """Generate all pending prescriptions"""
    try:
        print("=== GENERATE ALL PRESCRIPTIONS ===")
        
        # Check if user is logged in
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'User not authenticated'}), 401
        
        data = request.get_json()
        pending_count = data.get('pendingCount', 0)
        
        print(f"🔄 Generating {pending_count} pending prescriptions")
        
        # In a real application, you would:
        # 1. Fetch pending prescriptions from database
        # 2. Generate medications based on patient risk levels
        # 3. Update prescription status to "Generated"
        # 4. Save to database
        
        return jsonify({
            'success': True,
            'message': f'Successfully generated {pending_count} prescriptions',
            'generatedCount': pending_count
        })
        
    except Exception as e:
        print(f"❌ Generate all prescriptions error: {e}")
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

@prescription_bp.route('/api/prescriptions/<prescription_id>/generate', methods=['POST'])
def generate_single_prescription(prescription_id):
    """Generate a single prescription"""
    try:
        print(f"=== GENERATE SINGLE PRESCRIPTION: {prescription_id} ===")
        
        # Check if user is logged in
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'User not authenticated'}), 401
        
        # In a real application, you would:
        # 1. Fetch prescription data from database
        # 2. Generate medications based on patient risk level
        # 3. Update prescription status to "Generated"
        # 4. Save to database
        
        print(f"💊 Generating prescription {prescription_id}")
        
        return jsonify({
            'success': True,
            'message': f'Prescription {prescription_id} generated successfully'
        })
        
    except Exception as e:
        print(f"❌ Generate single prescription error: {e}")
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

@prescription_bp.route('/api/prescriptions', methods=['GET'])
def get_prescriptions():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        conn = sqlite3.connect('diabetech.db')
        c = conn.cursor()
        c.execute('''SELECT * FROM prescriptions WHERE user_id = ? ORDER BY created_at DESC''', 
                 (session['user_id'],))
        prescriptions = c.fetchall()
        conn.close()
        
        return jsonify({'prescriptions': prescriptions})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@prescription_bp.route('/api/prescriptions', methods=['POST'])
def create_prescription():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        data = request.get_json()
        patient_id = data.get('patient_id')
        medications = data.get('medications', [])
        doctor_notes = data.get('doctor_notes', '')
        
        conn = sqlite3.connect('diabetech.db')
        c = conn.cursor()
        c.execute('''INSERT INTO prescriptions 
                     (user_id, patient_id, medications, doctor_notes, status, created_at)
                     VALUES (?, ?, ?, ?, ?, ?)''',
                 (session['user_id'], patient_id, str(medications), doctor_notes, 'Generated', datetime.now()))
        conn.commit()
        prescription_id = c.lastrowid
        conn.close()
        
        return jsonify({'success': True, 'prescription_id': prescription_id})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@prescription_bp.route('/api/prescriptions/<int:prescription_id>', methods=['PUT'])
def update_prescription(prescription_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        data = request.get_json()
        status = data.get('status')
        
        conn = sqlite3.connect('diabetech.db')
        c = conn.cursor()
        c.execute('''UPDATE prescriptions SET status = ?, updated_at = ? 
                     WHERE id = ? AND user_id = ?''',
                 (status, datetime.now(), prescription_id, session['user_id']))
        conn.commit()
        conn.close()
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===== PRESCRIPTION MANAGEMENT UTILITIES =====

def get_default_medications(risk_level):
    """Get default medications based on risk level"""
    medications_by_risk = {
        "High Risk": [
            {"medication": "Metformin", "dosage": "1000mg", "frequency": "2x daily", "duration": "30 days", "notes": "With meals"},
            {"medication": "Insulin Glargine", "dosage": "20 units", "frequency": "Daily", "duration": "Ongoing", "notes": "Bedtime injection"},
            {"medication": "Lisinopril", "dosage": "10mg", "frequency": "Daily", "duration": "30 days", "notes": "Monitor BP"},
            {"medication": "Atorvastatin", "dosage": "20mg", "frequency": "Daily", "duration": "30 days", "notes": "Evening dose"},
        ],
        "Moderate Risk": [
            {"medication": "Metformin", "dosage": "500mg", "frequency": "2x daily", "duration": "30 days", "notes": "With meals"},
            {"medication": "Glipizide", "dosage": "5mg", "frequency": "Daily", "duration": "30 days", "notes": "Before breakfast"},
            {"medication": "Lisinopril", "dosage": "5mg", "frequency": "Daily", "duration": "30 days", "notes": "Monitor BP"},
        ],
        "Low Risk": [
            {"medication": "Metformin", "dosage": "500mg", "frequency": "Daily", "duration": "30 days", "notes": "With dinner"},
            {"medication": "Multivitamin", "dosage": "1 tablet", "frequency": "Daily", "duration": "30 days", "notes": "With breakfast"},
        ],
    }
    
    return medications_by_risk.get(risk_level, medications_by_risk["Low Risk"])

def get_lifestyle_recommendations(risk_level):
    """Get lifestyle recommendations based on risk level"""
    recommendations_by_risk = {
        "High Risk": [
            {"category": "Exercise", "recommendation": "45 min/day supervised activity"},
            {"category": "Diet", "recommendation": "Strict carb counting, 1800 cal/day"},
            {"category": "Monitoring", "recommendation": "Blood glucose 4x daily"},
            {"category": "Follow-up", "recommendation": "Monthly appointments"},
        ],
        "Moderate Risk": [
            {"category": "Exercise", "recommendation": "30 min/day moderate activity"},
            {"category": "Diet", "recommendation": "Low glycemic index foods"},
            {"category": "Monitoring", "recommendation": "Blood glucose 2x daily"},
            {"category": "Follow-up", "recommendation": "Bi-monthly appointments"},
        ],
        "Low Risk": [
            {"category": "Exercise", "recommendation": "30 min/day walking"},
            {"category": "Diet", "recommendation": "Balanced diabetic diet"},
            {"category": "Monitoring", "recommendation": "Weekly blood glucose checks"},
            {"category": "Follow-up", "recommendation": "Quarterly appointments"},
        ],
    }
    
    return recommendations_by_risk.get(risk_level, recommendations_by_risk["Low Risk"])

def get_default_doctor_notes(risk_level):
    """Get default doctor notes based on risk level"""
    notes_by_risk = {
        "High Risk": "Patient requires intensive monitoring due to multiple risk factors. Consider insulin adjustment based on glucose logs. Schedule ophthalmology and podiatry referrals.",
        "Moderate Risk": "Continue current medication regimen. Monitor for signs of complications. Encourage lifestyle modifications and regular exercise.",
        "Low Risk": "Maintain current management plan. Focus on lifestyle modifications and preventive care. Continue regular monitoring.",
    }
    
    return notes_by_risk.get(risk_level, notes_by_risk["Low Risk"])

print("✅ Prescription routes module loaded")
