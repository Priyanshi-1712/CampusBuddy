# CampusBuddy: Poornima University's Sharing Economy 🚀

CampusBuddy is an all-in-one platform designed exclusively for **Poornima University** students. It combines **carpooling**, **AI-ranked resource sharing**, and **real-time safety** to solve the daily challenges of campus life.

## ✨ Features

- 🚗 **Ride Sharing:** Find or offer rides to campus (Sitapura/Mansarovar). Uses **OTP-based boarding** for security.
- 📚 **Resource Marketplace:** Share notes and lab gear. Ranked by an **AI quality algorithm**.
- 🔐 **Verified Access:** Restricted to `@poornima.edu.in` email addresses only.
- 🆘 **SOS Emergency:** One-tap alert to campus security with live location tracking.

## 🛠️ Tech Stack

- **Frontend:** React.js, Tailwind CSS, Axios, Google Maps API
- **Backend:** FastAPI (Python 3.10+), WebSockets for live tracking
- **Database:** PostgreSQL (Supabase)
- **Auth:** JWT (JSON Web Tokens) & SMTP for OTP verification

## 🚀 Getting Started

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload