from flask import Flask, request, jsonify, render_template, session, redirect, url_for
from flask_cors import CORS
from flask_mail import Mail, Message
import sqlite3
import hashlib
import re
import secrets
import json

app = Flask(__name__)
app.secret_key = 'your_secret_key_here'
CORS(app)

# Configure Flask-Mail
app.config['MAIL_SERVER'] = 'smtp.googlemail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_USERNAME'] = 'osamu.anime.team@gmail.com'
app.config['MAIL_PASSWORD'] = 'oxjj xllz nvcu vtso'
app.config['MAIL_DEFAULT_SENDER'] = 'Osamu Anime Team <osamu.anime.team@gmail.com>'

mail = Mail(app)

# Function to create a database and table for user accounts
def create_database():
    conn = sqlite3.connect('accounts.db')
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            trial_count INTEGER NOT NULL,
            confirmed INTEGER NOT NULL DEFAULT 0,
            confirmation_token TEXT NOT NULL
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS activity_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            activity_type TEXT NOT NULL,
            details TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')

    conn.commit()
    conn.close()


# Function to register a new user with a specified trial count
def register(email, password, trial_count=10):
    conn = sqlite3.connect('accounts.db')
    cursor = conn.cursor()

    # Check if the email is already registered or not confirmed
    cursor.execute('''
        SELECT * FROM users WHERE email=?
    ''', (email,))

    existing_user = cursor.fetchone()

    if existing_user:
        if existing_user[3] == 0:
            conn.close()
            return False  # Email already exists and not confirmed, registration failed
        else:
            conn.close()
            return False  # Email already exists and confirmed, registration failed

    # Hash the password before storing it
    hashed_password = hashlib.sha256(password.encode()).hexdigest()

    # Generate a confirmation token
    confirmation_token = generate_confirmation_token()

    cursor.execute('''
        INSERT INTO users (email, password, trial_count, confirmation_token) VALUES (?, ?, ?, ?)
    ''', (email, hashed_password, trial_count, confirmation_token))

    conn.commit()
    conn.close()

    # Send confirmation email
    send_confirmation_email(email, confirmation_token)

    return True  # Registration successful

# Function to send a confirmation email
def send_confirmation_email(email, confirmation_token):
    confirmation_link = f"https://system.saludeskimdev1.repl.co/confirm/{confirmation_token}"

    subject = "Confirm your registration"
    body = f"Please click the following link to confirm your registration: {confirmation_link}"

    msg = Message(subject, recipients=[email], body=body)
    mail.send(msg)

# Function to generate a random confirmation token
def generate_confirmation_token():
    return secrets.token_urlsafe(32)

# Function to confirm the user's registration
def confirm_registration(confirmation_token):
    conn = sqlite3.connect('accounts.db')
    cursor = conn.cursor()

    cursor.execute('''
        UPDATE users SET confirmed = 1 WHERE confirmation_token = ?
    ''', (confirmation_token,))

    conn.commit()
    conn.close()

# Function to authenticate a user
def login(email, password):
    conn = sqlite3.connect('accounts.db')
    cursor = conn.cursor()

    hashed_password = hashlib.sha256(password.encode()).hexdigest()

    cursor.execute('''
        SELECT * FROM users WHERE email=? AND confirmed=1
    ''', (email,))

    user = cursor.fetchone()

    if user:
        if user[2] == hashed_password:
            conn.close()
            return user  # Login successful
        else:
            conn.close()
            return None  # Password incorrect
    else:
        conn.close()
        return None  # User not found or not confirmed

# Email validation regex
EMAIL_REGEX = re.compile(r'^\S+@\S+\.\S+$')

# Route for confirming registration
@app.route('/confirm/<token>', methods=['GET'])
def confirm(token):
    # You might want to implement additional security checks for the token
    confirm_registration(token)
    return render_template('confirmation.html')  # Create a confirmation.html template

# Registration route
@app.route('/register', methods=['POST'])
def register_route():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')

    create_database()  # Ensure the database and table are created

    # Validate email format
    if not EMAIL_REGEX.match(email):
        return jsonify({'message': 'Registration failed. Invalid email format.'})

    # Check if the email is already registered and confirmed
    conn = sqlite3.connect('accounts.db')
    cursor = conn.cursor()

    cursor.execute('''
        SELECT * FROM users WHERE email=? AND confirmed=1
    ''', (email,))

    existing_confirmed_user = cursor.fetchone()

    if existing_confirmed_user:
        conn.close()
        return jsonify({'message': 'Email is already registered and confirmed.'})

    # Check if the email is already registered but not confirmed
    cursor.execute('''
        SELECT * FROM users WHERE email=? AND confirmed=0
    ''', (email,))

    existing_unconfirmed_user = cursor.fetchone()

    if existing_unconfirmed_user:
        conn.close()
        return jsonify({'message': 'Please confirm your email.'})

    # Attempt to register the user
    registration_successful = register(email, password)

    if registration_successful:
        return jsonify({'message': 'Registration successful. Please check your email to confirm.'})
    else:
        return jsonify({'message': 'Registration failed. Email already exists or not confirmed.'})


@app.route('/login', methods=['POST'])
def login_route():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')

    # Validate email format
    if not EMAIL_REGEX.match(email):
        return jsonify({'message': 'Login failed. Invalid email format.'})

    user = login(email, password)

    if user:
        session['user_id'] = user[0]  # Save user ID in the session
        if request_trial(user[0]):
            return jsonify({'message': 'Login successful!'})
        else:
            return jsonify({'message': 'Login successful!'})
    else:
        # Check if the email exists in the database (regardless of confirmation status)
        conn = sqlite3.connect('accounts.db')
        cursor = conn.cursor()

        cursor.execute('''
            SELECT * FROM users WHERE email=?
        ''', (email,))

        existing_user = cursor.fetchone()

        # Check if the email is already registered but not confirmed
        cursor.execute('''
            SELECT * FROM users WHERE email=? AND confirmed=0
        ''', (email,))

        existing_unconfirmed_user = cursor.fetchone()

        if existing_unconfirmed_user:
            conn.close()
            return jsonify({'message': 'Please confirm your email.'})

        conn.close()
        if existing_user:
            return jsonify({'message': 'Login failed. Incorrect password or email.'})
        else:
            return jsonify({'message': 'Login failed. Email not found.'})


# Homepage route
@app.route('/home', methods=['GET'])
def homepage():
    if 'user_id' in session:
        return render_template('homepage.html')
    else:
        return redirect(url_for('index'))

# Redirect '/' to '/home' if the user is already logged in
@app.route('/', methods=['GET'])
def index():
    if 'user_id' in session:
        return redirect(url_for('homepage'))
    else:
        return render_template('login-register.html')

@app.route('/logout', methods=['GET'])
def logout():
    session.pop('user_id', None)
    return redirect(url_for('index'))  # Use the correct endpoint here

# Function to decrement the trial count for a user
def request_trial(user_id):
    conn = sqlite3.connect('accounts.db')
    cursor = conn.cursor()

    # Check if the user exists, is confirmed, and has trials remaining
    cursor.execute('''
        SELECT trial_count FROM users WHERE id=? AND confirmed=1
    ''', (user_id,))

    trial_count = cursor.fetchone()

    if trial_count and trial_count[0] > 0:
        # Decrement the trial count
        cursor.execute('''
            UPDATE users SET trial_count = trial_count - 1 WHERE id=?
        ''', (user_id,))

        conn.commit()
        conn.close()

        return True
    else:
        conn.close()
        return False


@app.route('/activity', methods=['POST'])
def activity_log():
    data = request.get_json()
    user_id = session.get('user_id')  # Assuming the user is logged in

    if not user_id:
        return jsonify({'message': 'User not logged in.'}), 401

    activity_type = data.get('activity_type')
    details = data.get('details')

    if not activity_type or not details:
        return jsonify({'message': 'Activity type or details missing.'}), 400

    conn = sqlite3.connect('accounts.db')
    cursor = conn.cursor()

    # Convert details to a JSON string
    details_json = json.dumps(details)

    # Check if the same activity type already exists for the user
    cursor.execute('''
        SELECT id FROM activity_log WHERE user_id=? AND details=? LIMIT 1
    ''', (user_id, details_json))

    existing_activity_id = cursor.fetchone()

    if existing_activity_id:
        # Update the existing entry
        cursor.execute('''
            UPDATE activity_log SET details=?, timestamp=CURRENT_TIMESTAMP WHERE id=?
        ''', (details_json, existing_activity_id[0]))
    else:
        # Insert into the database
        cursor.execute('''
            INSERT INTO activity_log (user_id, activity_type, details) VALUES (?, ?, ?)
        ''', (user_id, activity_type, details_json))

    conn.commit()
    conn.close()

    return jsonify({'message': 'Activity uploaded successfully.'})



@app.route('/user_activity', methods=['POST'])
def get_user_activity():
    user_id = session.get('user_id')  # Assuming the user is logged in

    if not user_id:
        return jsonify({'message': 'User not logged in.'}), 401

    conn = sqlite3.connect('accounts.db')
    cursor = conn.cursor()

    # Retrieve user's activity logs
    cursor.execute('''
        SELECT id, activity_type, details, timestamp FROM activity_log WHERE user_id=? ORDER BY timestamp DESC
    ''', (user_id,))

    activity_logs = cursor.fetchall()

    conn.close()

    # Adjust the response structure if needed
    return jsonify({'activity_logs': activity_logs})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
