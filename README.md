# Diabetech Sign-Up System

A sign-up system for Diabetech with Flask backend and MySQL database.

## Setup Instructions

1. Create the MySQL database:
   \`\`\`
   mysql -u root -p < database.sql
   \`\`\`

2. Install dependencies:
   \`\`\`
   pip install -r requirements.txt
   \`\`\`

3. Run the Flask application:
   \`\`\`
   python app.py
   \`\`\`

4. Access the application at http://localhost:5000

## Project Structure

- `app.py`: Main Flask application
- `static/`: Static files (CSS, JS, images)
  - `css/sign-up.css`: Styling for the sign-up page
  - `js/sign-up.js`: Client-side JavaScript for form validation and interactions
- `templates/`: HTML templates
  - `sign-up.html`: Sign-up page template
- `database.sql`: SQL script to create the database and tables

## Features

- User registration with MySQL database storage
- Password hashing for security
- OTP verification system
- Responsive design
