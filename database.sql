-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS diabetech;

-- Use the database
USE diabetech;

SET SQL_SAFE_UPDATES = 0;

-- Drop existing tables if you want to recreate them (uncomment if needed)
-- DROP TABLE IF EXISTS password_reset_tokens;
-- DROP TABLE IF EXISTS users;

-- Create users table 
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'User',
    is_verified TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for better performance
    INDEX idx_email (email),
    INDEX idx_is_verified (is_verified)
);

-- Create password reset tokens table 
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    otp_code VARCHAR(10) NOT NULL,
    email VARCHAR(100) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_email (email),
    INDEX idx_expires_at (expires_at)
);

CREATE TABLE IF NOT EXISTS patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id VARCHAR(20) UNIQUE NOT NULL,
    doctor_id INT NOT NULL,
    age INT NOT NULL,
    sex ENUM('Male', 'Female') NOT NULL,
    smoking_status ENUM('Smoker', 'Non-Smoker', 'Former'),
    date_of_birth DATE,
    bmi DECIMAL(5,2),
    glucose_level INT,
    blood_pressure VARCHAR(20),
    physical_activity VARCHAR(50),
    alcohol_consumption VARCHAR(50),
    stress_level VARCHAR(50),
    diet_type VARCHAR(50),
    sleep_duration DECIMAL(3,1),
    risk_level ENUM('Low Risk', 'Moderate Risk', 'High Risk'),
    checkup_frequency VARCHAR(50),
    complications TEXT,
    medical_history TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Check existing data
SELECT * FROM users;
SELECT * FROM patients;

DROP TABLE users;
DROP TABLE patients;
DROP TABLE password_reset_tokens;

-- Backup existing data (optional but recommended)
-- CREATE TABLE users_backup AS SELECT * FROM users;
-- CREATE TABLE patients_backup AS SELECT * FROM patients;

-- Add new columns to users table
ALTER TABLE users 
ADD COLUMN specialization VARCHAR(100) DEFAULT NULL AFTER role,
ADD COLUMN medical_license VARCHAR(100) DEFAULT NULL AFTER specialization;

-- Add new columns to patients table
ALTER TABLE patients 
ADD COLUMN diabetes_type VARCHAR(50) DEFAULT NULL AFTER date_of_birth,
ADD COLUMN family_history ENUM('Yes', 'No') DEFAULT NULL AFTER diabetes_type,
ADD COLUMN known_conditions TEXT DEFAULT NULL AFTER family_history,
ADD COLUMN current_medications TEXT DEFAULT NULL AFTER known_conditions,
ADD COLUMN allergies TEXT DEFAULT NULL AFTER current_medications,
ADD COLUMN height DECIMAL(5,2) DEFAULT NULL AFTER allergies,
ADD COLUMN weight DECIMAL(5,2) DEFAULT NULL AFTER height,
ADD COLUMN fasting_glucose INT DEFAULT NULL AFTER blood_pressure,
ADD COLUMN blood_sugar_level INT DEFAULT NULL AFTER glucose_level,
ADD COLUMN hba1c DECIMAL(3,1) DEFAULT NULL AFTER blood_sugar_level,
ADD COLUMN cholesterol_level INT DEFAULT NULL AFTER hba1c,
ADD COLUMN waist_circumference DECIMAL(5,2) DEFAULT NULL AFTER cholesterol_level,
ADD COLUMN monitoring_frequency VARCHAR(50) DEFAULT NULL AFTER checkup_frequency,
ADD COLUMN initial_diagnosis VARCHAR(255) DEFAULT NULL AFTER monitoring_frequency,
ADD COLUMN last_checkup_date DATE DEFAULT NULL AFTER initial_diagnosis,
ADD COLUMN next_followup_date DATE DEFAULT NULL AFTER last_checkup_date,
ADD COLUMN remarks_notes TEXT DEFAULT NULL AFTER notes;

-- Add indexes
ALTER TABLE patients 
ADD INDEX idx_patient_id (patient_id),
ADD INDEX idx_doctor_id (doctor_id),
ADD INDEX idx_risk_level (risk_level),
ADD INDEX idx_created_at (created_at);

-- Update existing data
UPDATE patients SET diabetes_type = 'Type 2' WHERE diabetes_type IS NULL;
UPDATE patients SET monitoring_frequency = checkup_frequency WHERE monitoring_frequency IS NULL AND checkup_frequency IS NOT NULL;

-- Verify the migration
SELECT 'Migration completed successfully!' as Status;
SELECT COUNT(*) as Total_Users FROM users;
SELECT COUNT(*) as Total_Patients FROM patients;

-- Show updated table structures
DESCRIBE users;
DESCRIBE patients;
