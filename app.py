from flask import Flask, render_template, request, jsonify, send_file
import os
import re
import json
import sqlite3
from datetime import datetime
from werkzeug.utils import secure_filename
from PyPDF2 import PdfReader
from docx import Document

app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = os.path.join("static", "uploads")
ALLOWED_EXTENSIONS = {"pdf", "docx"}
DATABASE = "database.db"

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Database Helper Functions
def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS resumes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                filepath TEXT NOT NULL,
                upload_date TEXT NOT NULL,
                ats_score INTEGER NOT NULL,
                found_skills TEXT NOT NULL,
                missing_skills TEXT NOT NULL,
                strengths TEXT NOT NULL,
                weaknesses TEXT NOT NULL,
                suggestions TEXT NOT NULL,
                overall_rating TEXT NOT NULL
            )
        ''')
        conn.commit()

# Initialize Database Table on Start
init_db()

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# Text Extraction Function
def extract_resume_text(filepath):
    text = ""
    try:
        if filepath.lower().endswith(".pdf"):
            reader = PdfReader(filepath)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        elif filepath.lower().endswith(".docx"):
            doc = Document(filepath)
            for para in doc.paragraphs:
                text += para.text + "\n"
    except Exception as e:
        print(f"Error extracting text: {e}")
    return text.lower()

# Dynamic ATS Analysis Engine
def calculate_ats_and_analysis(text):
    skills_master = [
        "python", "java", "c", "c++", "html", "css", "javascript", "react", "angular",
        "node", "express", "flask", "django", "sql", "mysql", "mongodb", "firebase",
        "git", "github", "api", "bootstrap", "tailwind", "docker", "linux", "aws",
        "communication", "leadership", "problem solving", "teamwork", "critical thinking"
    ]

    found = []
    missing = []

    for skill in skills_master:
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text):
            found.append(skill.title())
        else:
            missing.append(skill.title())

    # Dynamic Score calculation
    skill_match_percentage = (len(found) / len(skills_master)) * 70
    
    sections = ['education', 'experience', 'projects', 'skills', 'certifications', 'summary']
    section_score = sum(5 for sec in sections if sec in text)
    
    final_score = int(min(100, max(30, skill_match_percentage + section_score)))

    # Strengths
    strengths = []
    if len(found) >= 5:
        strengths.append(f"Strong key skills identified ({len(found)} core skills detected).")
    if "projects" in text:
        strengths.append("Project portfolio section is well outlined.")
    if "education" in text:
        strengths.append("Educational qualifications section identified.")
    if not strengths:
        strengths.append("Basic resume layout parsed successfully.")

    # Weaknesses
    weaknesses = []
    if len(found) < 7:
        weaknesses.append("Key technical/soft skills count is low.")
    if "git" not in text and "github" not in text:
        weaknesses.append("No version control tools (Git/GitHub) found.")
    if "certifications" not in text:
        weaknesses.append("Certification details section is missing.")

    # Suggestions
    suggestions = []
    if missing:
        suggestions.append(f"Add critical missing skills such as: {', '.join(missing[:4])}.")
    if "github" not in text:
        suggestions.append("Include GitHub links to demonstrate live project source code.")
    if "%" not in text and "achieved" not in text:
        suggestions.append("Quantify accomplishments using measurable statistics (e.g., 'Improved efficiency by 20%').")

    # Overall Rating
    if final_score >= 80:
        rating = "Excellent Fit"
    elif final_score >= 60:
        rating = "Good Candidate"
    elif final_score >= 45:
        rating = "Average Match"
    else:
        rating = "Needs Improvement"

    return final_score, found, missing, strengths, weaknesses, suggestions, rating

# ==================== PAGE ROUTES ====================

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/register")
def register():
    return render_template("register.html")

@app.route("/login")
def login():
    return render_template("login.html")

@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")

@app.route("/upload_resume")
def upload_resume():
    return render_template("upload_resume.html")

@app.route("/analysis")
def analysis():
    return render_template("analysis.html")

@app.route("/profile")
def profile():
    return render_template("profile.html")

# ADMIN PANEL ROUTE (सुधारित स्थान)
@app.route('/admin')
def admin_dashboard():
    return render_template('admin.html')

# ==================== API ENDPOINTS ====================

# 1. Upload & Analyze Resume API
@app.route("/analyze_resume", methods=["POST"])
def analyze_resume_endpoint():
    if "resume" not in request.files:
        return jsonify({"success": False, "message": "No file part in request"}), 400

    file = request.files["resume"]
    if file.filename == "":
        return jsonify({"success": False, "message": "No file selected"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_")
        saved_filename = timestamp + filename
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], saved_filename)
        file.save(filepath)

        # Extract Text
        extracted_text = extract_resume_text(filepath)

        # Calculate ATS & Details
        score, found, missing, strengths, weaknesses, suggestions, rating = calculate_ats_and_analysis(extracted_text)

        # Save to SQLite Database
        upload_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO resumes (
                    filename, filepath, upload_date, ats_score, 
                    found_skills, missing_skills, strengths, weaknesses, suggestions, overall_rating
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                filename,
                filepath,
                upload_date,
                score,
                json.dumps(found),
                json.dumps(missing),
                json.dumps(strengths),
                json.dumps(weaknesses),
                json.dumps(suggestions),
                rating
            ))
            res_id = cursor.lastrowid
            conn.commit()

        return jsonify({
            "success": True,
            "message": "Resume uploaded successfully!",
            "resume_id": res_id
        })

    return jsonify({"success": False, "message": "Invalid file format. Please upload PDF or DOCX."}), 400

# 2. Get Single Resume Analysis Data API
@app.route("/api/get_analysis/<int:resume_id>", methods=["GET"])
def get_analysis_data(resume_id):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM resumes WHERE id = ?", (resume_id,))
        row = cursor.fetchone()

    if not row:
        return jsonify({"success": False, "message": "Record not found"}), 404

    return jsonify({
        "success": True,
        "data": {
            "id": row["id"],
            "filename": row["filename"],
            "upload_date": row["upload_date"],
            "ats_score": row["ats_score"],
            "found_skills": json.loads(row["found_skills"]),
            "missing_skills": json.loads(row["missing_skills"]),
            "strengths": json.loads(row["strengths"]),
            "weaknesses": json.loads(row["weaknesses"]),
            "suggestions": json.loads(row["suggestions"]),
            "overall_rating": row["overall_rating"]
        }
    })

# 3. Get All History & Dashboard Data API
@app.route("/api/dashboard_data", methods=["GET"])
def get_dashboard_data():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM resumes ORDER BY id DESC")
        rows = cursor.fetchall()

    history = []
    total_uploads = len(rows)
    latest_score = rows[0]["ats_score"] if total_uploads > 0 else 0
    latest_filename = rows[0]["filename"] if total_uploads > 0 else "N/A"

    for r in rows:
        history.append({
            "id": r["id"],
            "filename": r["filename"],
            "ats_score": r["ats_score"],
            "upload_date": r["upload_date"],
            "overall_rating": r["overall_rating"]
        })

    return jsonify({
        "success": True,
        "total_uploads": total_uploads,
        "latest_score": latest_score,
        "latest_filename": latest_filename,
        "history": history
    })

# 4. Delete Resume API
@app.route("/api/delete_resume/<int:resume_id>", methods=["DELETE"])
def delete_resume(resume_id):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT filepath FROM resumes WHERE id = ?", (resume_id,))
        row = cursor.fetchone()
        
        if row and os.path.exists(row["filepath"]):
            try:
                os.remove(row["filepath"])
            except Exception as e:
                print(f"File remove error: {e}")

        cursor.execute("DELETE FROM resumes WHERE id = ?", (resume_id,))
        conn.commit()

    return jsonify({"success": True, "message": "Resume deleted successfully."})

# ================= RUN SERVER =================

if __name__ == "__main__":
    app.run(debug=True)