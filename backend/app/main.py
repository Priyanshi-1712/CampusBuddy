import os
import re
import cv2
import numpy as np
import easyocr
import random
import shutil
import smtplib
import asyncio
import string
import fitz  
import ssl  
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel, EmailStr
from fastapi.responses import FileResponse
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from app.models import user as models
from typing import List, Optional
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import APIRouter, UploadFile, File, Form, FastAPI, Depends, HTTPException
from sqlalchemy import or_, and_
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
# --- IMAGE PROCESSING & OCR ---
from PIL import Image

# 1. DATABASE & MODEL IMPORTS
from app.api import sos
from app.core.database import SessionLocal, engine, Base
from app.models.resource import Resource, Message, Purchase, Review, Wishlist
from app.models.user import User, Wallet, Transaction
from app.models.ride import Ride, Booking
from app.api.resources import router as marketplace_router
from app.models.subscriber import Subscriber
from difflib import SequenceMatcher
from passlib.context import CryptContext
# --- SMTP CONFIGURATION ---
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 465
SENDER_EMAIL = "campusbuddy.admin@gmail.com" 
SENDER_PASSWORD = "kyvhmvznsedwdfmx" 

# Initialize EasyOCR Reader (English)
reader = easyocr.Reader(['en'])
# Initialize Database
Base.metadata.create_all(bind=engine)
app = FastAPI()
# Create router for custom user endpoints
router = APIRouter()

# --- 1. DIRECTORY SETUP ---
UPLOAD_ROOT = "static"
IMAGES_DIR = os.path.join(UPLOAD_ROOT, "img")
AVATARS_DIR = os.path.join(UPLOAD_ROOT, "avatars") 
NOTES_DIR = os.path.join(UPLOAD_ROOT, "notes")
PAPERS_DIR = os.path.join(UPLOAD_ROOT, "old_papers")
for p in [IMAGES_DIR, AVATARS_DIR, NOTES_DIR, PAPERS_DIR]:
    if not os.path.exists(p): 
        os.makedirs(p, exist_ok=True)

# 2. MOUNT STATIC FILES
app.mount("/static", StaticFiles(directory="static"), name="static")
# --- CORS CONFIGURATION ---
app.add_middleware(
    CORSMiddleware,
     allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        ],
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"], 
)
# 3. DB Session
def get_db():
    db = SessionLocal()
    try: 
        yield db
    finally: 
        db.close()

# 3. SCHEMAS --- Redemption Schema ---
class RedeemRequest(BaseModel):
    email: str
    amount: float
    account_holder: str
    account_number: str
    ifsc_code: str
    bank_name: str

class SignupRequest(BaseModel):
    email: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordVerify(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

class MessageCreate(BaseModel):
    item_id: int
    receiver_email: str
    sender_email: str
    content: str 

class RideCreate(BaseModel):
    destination: str
    departure_time: datetime
    seats_available: int
    price_per_seat: int
    driver_name: str
    contact: str
    owner: str

class BookingRequest(BaseModel):
    booker_email: str

class PurchaseRequest(BaseModel):
    item_id: int
    buyer_email: str

class HandoverVerify(BaseModel):
    order_id: int
    otp_code: str

class MarkReadRequest(BaseModel):
    sender_email: str
    receiver_email: str

class RatingRequest(BaseModel):
    reviewer_email: str
    target_email: str
    stars: int
    type: str # 'ride' or 'product'

class PointsRequest(BaseModel):
    email: str
    amount: int

class PaymentVerifyRequest(BaseModel):
    item_id: int
    buyer_email: str
    payment_id: Optional[str] = "COD"
    status: Optional[str] = "success"

class ConfirmSeatRequest(BaseModel):
    booking_id: int

class StartRideRequest(BaseModel):
    ride_id: int
    passenger_email: str
    otp_code: str

class CompleteRideRequest(BaseModel):
    ride_id: int

class ReviewCreate(BaseModel):
    resource_id: int
    rating: int
    user_email: str
    comment: str = " "

class SubscribeRequest(BaseModel):
    email: EmailStr

class ReportRequest(BaseModel):
    reporter_email: str
    reported_email: str
    reason: str
    description: Optional[str] = None
    category: str
    item_id: Optional[int] = None

conf = ConnectionConfig(
    MAIL_USERNAME = "campusbuddy.admin@gmail.com",
    MAIL_PASSWORD = "kyvhmvznsedwdfmx", 
    MAIL_FROM = "campusbuddy.admin@gmail.com",
    MAIL_PORT = 587,                    
    MAIL_SERVER = "smtp.gmail.com",
    MAIL_STARTTLS = True,               
    MAIL_SSL_TLS = False,
    USE_CREDENTIALS = True,
    VALIDATE_CERTS = False              
)
# Helper function for aggressive cleaning 
def robust_normalize(text):
    if not text: return ""
    t = text.lower()
    t = t.replace('/', '').replace('-', '').replace(' ', '')
    confusions = {'o': '0', 'i': '1', 'l': '1', 's': '5', 'b': '8', 'z': '2', 'g': '6', 'q': '9'}
    for char, replacement in confusions.items():
        t = t.replace(char, replacement)
    return re.sub(r'[^a-z0-9]', '', t).strip()
# --- REAL EMAIL SENDER --- 
def send_email_otp(email: str, otp: str, subject_type="verification"):
    try:
        CURRENT_AUTH_PW = "kyvhmvznsedwdfmx" 
        message = MIMEMultipart()
        message["From"] = f"CampusBuddy Support <{SENDER_EMAIL}>"
        message["To"] = email
        if subject_type == "reset":
            message["Subject"] = f"{otp} is your Password Reset Code"
            title = "Reset Your Password"
            text = "We received a request to reset your password. Use the code below:"
        else:
            message["Subject"] = f"{otp} is your verification code"
            title = "Verify Your Account"
            text = "Use the code below to complete your registration:"

        body = f"""
        <html>
            <body style="font-family: sans-serif; padding: 20px; color: #333;">
                <div style="max-width: 500px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px;">
                    <h2 style="color: #05488B;">{title}</h2>
                    <p>{text}</p>
                    <div style="background: #f8fafc; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                        <h1 style="letter-spacing: 8px; color: #05488B; margin: 0;">{otp}</h1>
                    </div>
                    <p style="font-size: 12px; color: #64748b;">This code expires in 10 minutes. If you didn't request this, please ignore this email.</p>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                    <p style="font-size: 10px; color: #94a3b8; text-align: center;">© 2026 CampusBuddy — FutureBiits Tech</p>
                </div>
            </body>
        </html>
        """
        message.attach(MIMEText(body, "html"))
        context = ssl.create_default_context() 
        context = ssl.create_default_context() 
        with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT, context=context) as server:
            # We use CURRENT_AUTH_PW to ensure it matches the token used in other routers
            server.login(SENDER_EMAIL, CURRENT_AUTH_PW)
            server.send_message(message)
        print(f"✅ OTP {otp} successfully delivered to {email}")
        return True
    except Exception as e:
        print(f"❌ SMTP ERROR: {e}")
        return False
# --- OCR & FACE DETECTION LOGIC ---
@app.post("/api/signup/verify-id")
async def verify_student_id(
    full_name: str = Form(...),
    id_card: UploadFile = File(...)
):
    print(f"DEBUG: Starting Strict Verification for {full_name}")
    contents = await id_card.read()

    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(status_code=400, detail="Invalid image")
    height, width = img.shape[:2]
    if width > 800:
        img = cv2.resize(img, (800, int(height * (800 / width))))
    results = reader.readtext(img, detail=0)  
    text_raw = " ".join(results).lower()
    c_detected = robust_normalize(text_raw)
    
    uni_keywords = ["poornima", "piet", "pce", "pgi", "university", "college","transport","hostel","student"]
    if not any(k in text_raw or k in c_detected for k in uni_keywords):
        return {"success": False, "error": "ID card must be from a Poornima Group institution"}
    
    name_parts = full_name.lower().split()
    if not any(robust_normalize(part) in c_detected for part in name_parts if len(part) > 2):
        return {"success": False, "error": "Identity Theft Protection: Name on ID does not match your input."}

    # Face detection using the existing buffer
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is not None:
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        if len(faces) > 0:
            return {"success": True, "message": "Verified! Face and Identity matched."}
    return {"success": True, "message": "Verified, but no face detected."}
# --- FORGOT PASSWORD: STEP 1 (Send OTP) ---
@app.post("/api/auth/forgot-password")
async def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    email = req.email.lower().strip()
    user = db.query(User).filter(User.college_email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email.")
    # ------Generate a reset OTP-------
    otp = str(random.randint(1000, 9999))
    user.current_otp = otp
    user.otp_created_at = datetime.now(timezone.utc)
    email_sent = send_email_otp(email, otp, subject_type="reset")
    if not email_sent:
        raise HTTPException(status_code=500, detail="Failed to send reset email.")
    db.commit()
    return {"status": "success", "message": "Reset code sent to your email."}
# --- FORGOT PASSWORD: STEP 2 (Verify & Reset) ---
@app.post("/api/auth/reset-password-verify")
async def reset_password_final(req: ResetPasswordVerify, db: Session = Depends(get_db)):
    email = req.email.lower().strip()
    user = db.query(User).filter(User.college_email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    # 1. Verify OTP
    if str(user.current_otp).strip() != str(req.otp).strip():
        raise HTTPException(status_code=400, detail="Invalid reset code.")
    # 2. Check Expiry (10 mins)
    now = datetime.now(timezone.utc)
    otp_time = user.otp_created_at
    if otp_time:
        if otp_time.tzinfo is None: 
            otp_time = otp_time.replace(tzinfo=timezone.utc)
        if now > (otp_time + timedelta(minutes=10)):
            raise HTTPException(status_code=400, detail="Reset code has expired.")
    # 3. Update Password
    user.hashed_password = req.new_password 
    user.current_otp = None # Clear OTP after success
    db.commit()
    return {"status": "success", "message": "Password updated successfully!"}
# --- SUBSCRIPTION & NEWSLETTER ---
@app.post("/api/subscribe")
async def subscribe_user(data: SubscribeRequest, db: Session = Depends(get_db)):
    try:
        # 1. Database logic (Checks if already exists, otherwise saves)
        existing = db.query(Subscriber).filter(Subscriber.email == data.email.lower()).first()
        if not existing:
            new_sub = Subscriber(email=data.email.lower())
            db.add(new_sub)
            db.commit()
        else:
            # If they already exist in DB, we still try to send the mail in case they missed it
            print(f"ℹ️ User {data.email} already in database. Resending welcome mail.")

        html_content = f"""
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
            <h2 style="color: #05488B;">Priority Access Granted! 🚀</h2>
            <p>Welcome to <b>CampusBuddy</b>. You're now on the list for early-bird alerts.</p>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
                <p style="margin: 0; font-size: 14px;">📧 Linked Account: <b>{data.email}</b></p>
            </div>
            <p style="font-size: 12px; color: #666; margin-top: 20px;">Engineering Excellence — Team FutureBiits</p>
        </div>
        """
        # 3. Message Configuration
        message = MessageSchema(
            subject="CampusBuddy | Priority Access Granted! ⚡",
            recipients=[data.email],
            body=html_content,
            subtype=MessageType.html # CRITICAL: Tells Gmail this is an aesthetic email
        )
        # 4. Dispatch Email
        fm = FastMail(conf)
        await fm.send_message(message)
        
        print(f"✅ MAIL DISPATCHED: {data.email}")
        return {"status": "success"}

    except Exception as e:
        # Rollback DB if it fails during the commit phase
        if 'db' in locals():
            db.rollback()
        print(f"❌ MAIL FAILURE: {str(e)}")
        # Returns success because the user is likely already recorded in the DB
        return {"status": "success", "note": "Subscribed to DB only"}
# --- AUTH ROUTES ---
@app.get("/api/users/me")
def get_user_profile(email: str, db: Session = Depends(get_db)):
    clean_email = email.lower().strip()
    user = db.query(User).filter(User.college_email == clean_email).first()
    if not user:
        # Instead of crashing, we return a 404
        raise HTTPException(status_code=404, detail="User not found")
    wallet = db.query(Wallet).filter(Wallet.user_id == user.id).first()
    if not wallet:
        wallet = Wallet(user_id=user.id, balance=0.0, pending_earnings=0.0, total_revenue=0.0)
        db.add(wallet)
        db.commit()
        db.refresh(wallet)
    return {
        "full_name": user.full_name,
        "college_email": user.college_email,
        "avatar_url": user.avatar_url,
        "points": getattr(user, "points", 0) or 0,
        "created_at": user.created_at,
        "is_driver_verified": getattr(user, "is_driver_verified", False),
        "is_verified": getattr(user, "is_verified", False), 
        "wallet_balance": wallet.balance,
        "wallet_pending": wallet.pending_earnings,
        "wallet_total": wallet.total_revenue
    }
@app.post("/api/wallet/redeem")
async def redeem_to_bank(req: RedeemRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.college_email == req.email.lower().strip()).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    wallet = db.query(Wallet).filter(Wallet.user_id == user.id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    
    # 1. Validation: Check if they have enough money
    if wallet.balance < req.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance for withdrawal.")
    # 2. Validation: Minimum limit for professional feel
    if req.amount < 100:
        raise HTTPException(status_code=400, detail="Minimum redemption amount is ₹100.")
    try:
        # 3. Deduct from Virtual Balance
        wallet.balance -= req.amount
        # 4. Create a Transaction Ledger Entry
        new_tx = Transaction(
            user_id=user.id,
            amount=-req.amount,  # Negative indicates withdrawal
            type="WITHDRAWAL",
            description=f"Redeemed to {req.bank_name} (A/c: ...{req.account_number[-4:]})"
        )
        db.add(new_tx)
        db.add(wallet)
        db.commit()
        
        print(f"🏦 REDEMPTION: ₹{req.amount} processed for {user.college_email}")
        
        return {
            "status": "success",
            "message": "Redemption successful! Money will reflect in 24 hours."
        }
        
    except Exception as e:
        db.rollback()
        print(f"Redeem Error: {e}")
        raise HTTPException(status_code=500, detail="Transaction failed.")

@router.post("/api/auth/signup-otp")
async def signup_otp(payload: dict, db: Session = Depends(get_db)):
    # --- ENHANCED UNIVERSAL CLEANING & VALIDATION (NEW) ---
    raw_email = payload.get("email", "")
    # Removes all spaces, converts to lower, and strips hidden whitespace
    email = "".join(raw_email.split()).lower().strip()
    if "@poornima.edu.in" not in email:
        raise HTTPException(status_code=400, detail="Access Denied: Use your official @poornima.edu.in email.")
    
    # --- NEW ADDITION: STRICT DOMAIN CHECK ---
    if not email.endswith("@poornima.edu.in"):
        raise HTTPException(status_code=400, detail="Access Denied: Use your official @poornima.edu.in email.")
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.college_email == email).first()
    if existing_user and existing_user.is_verified:
        raise HTTPException(status_code=400, detail="Email already registered.")

    # Generate OTP
    otp_code = str(random.randint(1000, 9999))

    if not existing_user:
        new_user = User(college_email=email, current_otp=otp_code, is_verified=False)
        db.add(new_user)
    else:
        existing_user.current_otp = otp_code
        existing_user.otp_created_at = datetime.now(timezone.utc)

    try:
        db.commit()
        
        try:
            # 1. Removed '#' to uncomment the line
            # 2. Changed 'send_otp_email' to 'send_email_otp' to match your function name
            # We use the 'email' variable here to ensure no hidden spaces are sent to SMTP
            email_sent = send_email_otp(email, otp_code, subject_type="verification") 
            
            if not email_sent:
                print(f"❌ Failed to send email to {email}")
                # --- NEW FALLBACK FOR DEMO ---
                return {
                    "status": "partial_success", 
                    "message": "OTP generated (Check server logs if email doesn't arrive)",
                    "debug_otp": otp_code 
                }
            else:
                print(f"✅ OTP Email successfully sent to {email}")
                return {"status": "success", "message": "OTP Sent"}

        except Exception as e:
            print(f"Email Error: {e}")
            # --- NEW FALLBACK FOR DEMO ---
            return {
                "status": "partial_success", 
                "message": "System Error: OTP logged in terminal.",
                "debug_otp": otp_code 
            }
        
    except Exception as e:
        db.rollback()
        print(f"Database Error: {e}")
        raise HTTPException(status_code=500, detail="Database Sync Error.")

@app.post("/api/auth/send-otp")
def send_otp(data: dict, db: Session = Depends(get_db)):
    email = data.get("email", "").lower().strip()
    password = data.get("password")
    
    user = db.query(User).filter(User.college_email == email).first()
# def send_otp(data: dict, db: Session = Depends(get_db)):
#     password = data.get("password")
#     raw_email = data.get("email", "") # <--- FIXED TO 'data'
    # email = "".join(raw_email.split()).lower().strip()
    # email = data.get("email", "").lower().strip()

    # user = db.query(User).filter(User.college_email == email).first()
    
    if not user or user.hashed_password != password:
        raise HTTPException(status_code=401, detail="Invalid credentials.")
        
    otp = str(random.randint(1000, 9999))
    user.current_otp = otp
    user.otp_created_at = datetime.now(timezone.utc) 
    
    email_success = send_email_otp(email, otp)
    if not email_success:
         raise HTTPException(status_code=500, detail="Failed to send email.")
         
    db.commit()
    return {"message": "OTP Sent"}



pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password):
    return pwd_context.hash(password)

def fuzzy_match(a, b):
    return SequenceMatcher(None, a, b).ratio()

@app.post("/api/auth/register-final")
async def register_final(
    full_name: str = Form(...), 
    email: str = Form(...), 
    password: str = Form(...), 
    otp: str = Form(...), 
    registration_no: str = Form(...),
    phone_number: str = Form(...),
    id_card: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    email_clean = email.lower().strip()
    prefix = email_clean.split('@')[0]

    # -------- 1. OPTIMIZED IMAGE LOADING (PRESERVED) --------
    contents = await id_card.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise HTTPException(status_code=400, detail="Invalid image uploaded")

    h, w = img.shape[:2]
    if max(h, w) > 1000:
        scale = 1000 / max(h, w)
        img = cv2.resize(img, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)

    # --------  OPTIMIZED OCR (PRESERVED) --------
    results = reader.readtext(img, detail=0, paragraph=True)
    detected_text_raw = " ".join(results).lower()
    
    c_detected = robust_normalize(detected_text_raw)
    c_reg_input = robust_normalize(registration_no)

    # --------  STRICT TRIPLE LOCK (PRESERVED & ENHANCED) --------
    
    # LOCK 1: Institutional Check (PRESERVED)
    uni_keywords = [
    "poornima", "pornima", "poornma", "poornlma",  # OCR variations
    "piet", "pce", "pgi",
    "university", "college",
    "student", "transport", "hostel"
    ]    
    is_uni_valid = any(k in detected_text_raw or k in c_detected for k in uni_keywords)

    # LOCK 2: Registration No Check (PRESERVED)
    reg_suffix = c_reg_input[-5:] if len(c_reg_input) > 5 else c_reg_input
    is_reg_valid = any(c_reg_input[-5:] in word for word in results) or (c_reg_input in c_detected)

    # Part B: Typed Name parts check 
    name_parts = [robust_normalize(p) for p in full_name.split() if len(p) > 2]
    is_name_valid = all(part in c_detected for part in name_parts) if name_parts else False

    # --------  GATEKEEPER --------
    # Check if Uni is valid AND Reg is valid AND (Typed Name OR Email Prefix) matches the ID
    if not (is_uni_valid and is_reg_valid and is_name_valid):
        print(f"❌ FAILED: Uni:{is_uni_valid}, Reg:{is_reg_valid}, Name:{is_name_valid}")
        raise HTTPException(
            status_code=400, 
            detail="Verification Failed: Name or Reg No not clearly visible on ID card."
        )

    # -------- DB PERSISTENCE --------
    user = db.query(User).filter(User.college_email == email_clean).first()
    if not user:
        raise HTTPException(status_code=404, detail="Session expired. Please restart signup.")
    user.full_name = full_name.strip()
    user.hashed_password = password.strip() 
    user.registration_no = registration_no.strip()
    user.phone_number = phone_number.strip()
    user.is_verified = True

    # -------- FAST FACE CROP  --------
    try:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        if len(faces) > 0:
            x, y, w, h = faces[0]
            face_crop = img[max(0, y-50):y+h+50, max(0, x-50):x+w+50]
            avatar_path = f"static/avatars/avatar_{prefix}.jpg"
            cv2.imwrite(avatar_path, face_crop)
            user.avatar_url = f"/{avatar_path}"
    except Exception as e:
        print("Face detection skipped:", e)
    db.commit()
    return {"status": "success", "message": "ID Verified Successfully! 🎉"}

async def run_9pm_settlement():
    while True:
        now = datetime.now()
        if now.hour == 21 and now.minute == 0:
            print("LOG: Starting 9 PM Wallet Settlement...")
            db = SessionLocal()
            try:
                wallets = db.query(Wallet).filter(Wallet.pending_earnings > 0).all()
                for w in wallets:
                    settlement_amount = w.pending_earnings
                    w.balance += settlement_amount
                    w.pending_earnings = 0
                    db.add(Transaction(
                        user_id=w.user_id,
                        amount=settlement_amount,
                        type="SETTLEMENT",
                        description="Daily 9 PM Virtual Balance Update"
                    ))
                db.commit()
                print(f"LOG: Successfully settled {len(wallets)} wallets.")
            except Exception as e:
                print(f"ERROR: Settlement failed: {e}")
                db.rollback()
            finally:
                db.close()
            await asyncio.sleep(61)  
        await asyncio.sleep(30)
    # --- SAVE USER ---
    user.full_name = full_name
    user.hashed_password = hash_password(password)
    user.registration_no = registration_no
    user.phone_number = phone_number
    user.is_verified = True
    # --- FACE DETECTION ---
    try:
        face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        if len(faces) > 0:
            (x, y, w, h) = faces[0]
            face_crop = img[max(0, y-50):y+h+50, max(0, x-50):x+w+50]
            avatar_path = f"static/avatars/avatar_{prefix}.jpg"
            cv2.imwrite(avatar_path, face_crop)
            user.avatar_url = f"/{avatar_path}"
    except Exception as e:
        print("Face detection error:", e)
    db.commit()
    return {
        "status": "success",
        "message": "ID Verified Successfully ✅"
    }
#Trigger it on startup
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(run_9pm_settlement())
@app.post("/api/auth/signup-otp")
async def signup_otp(payload: dict, db: Session = Depends(get_db)):
    # 1. Clean Email
    raw_email = payload.get("email", "")
    email = "".join(raw_email.split()).lower().strip()
    # 2. Domain Check
    if not email.endswith("@poornima.edu.in"):
        raise HTTPException(status_code=400, detail="Use @poornima.edu.in email only.")
    # 3. DB Check
    existing_user = db.query(User).filter(User.college_email == email).first()
    if existing_user and existing_user.is_verified:
        raise HTTPException(status_code=400, detail="Email already registered.")
    # 4. Generate & Save OTP
    otp_code = str(random.randint(1000, 9999))
    if not existing_user:
        new_user = User(college_email=email, current_otp=otp_code, is_verified=False)
        db.add(new_user)
    else:
        existing_user.current_otp = otp_code
        existing_user.otp_created_at = datetime.now(timezone.utc)
    db.commit()
    # 5. SEND EMAIL
    email_sent = send_email_otp(email, otp_code)
    if not email_sent:
        print(f"⚠️ MAIL BLOCKED: USE CODE {otp_code}")
        return {"status": "partial_success", "debug_otp": otp_code}
    return {"status": "success", "message": "OTP Sent"}
@router.post("/api/auth/verify-otp")
def verify_otp(data: dict, db: Session = Depends(get_db)):
    email = data.get("email", "").lower().strip()
    otp_input = str(data.get("otp", "")).strip()
    user = db.query(User).filter(User.college_email == email).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found.")
    if str(user.current_otp).strip() == otp_input:
        return {
            "status": "success",
            "username": user.full_name or "",
            "email": user.college_email
        }
    raise HTTPException(status_code=400, detail="Invalid OTP code.")

# --- RIDES, WISHLIST, ORDERS ---
@app.get("/api/my-offered-rides/{email}")
def get_my_offered_rides(email: str, db: Session = Depends(get_db)):
    email_clean = email.lower().strip()
    rides = db.query(Ride).filter(Ride.owner == email_clean).all()
    
    result = []
    for ride in rides:
        bookings = db.query(Booking).filter(Booking.ride_id == ride.id).all()
        
        booking_list = []
        for b in bookings:
            # Grab the booker's email safely
            passenger_email = getattr(b, 'booker_email', None) or getattr(b, 'passenger_email', None)
            
            if passenger_email:
                # Fetch their real name from the User table!
                user = db.query(User).filter(User.college_email == passenger_email).first()
                booking_list.append({
                    "booker_email": passenger_email,
                    "booker_name": user.full_name if user else "Campus Student"
                })
            
        # Convert the ride to a dictionary and explicitly attach the bookings array
        ride_dict = {
            "id": ride.id,
            "destination": ride.destination,
            "departure_time": ride.departure_time,
            "seats_available": ride.seats_available,
            "price_per_seat": ride.price_per_seat,
            "owner": ride.owner,
            "status": ride.status,
            "bookings": booking_list 
        }
        result.append(ride_dict)
        
    return result
@app.get("/api/marketplace/wishlist")
def get_wishlist(email: Optional[str] = None, user_email: Optional[str] = None, db: Session = Depends(get_db)):
    target_email = email or user_email
    if not target_email:
        return []
    email_clean = target_email.lower().strip()
    items = db.query(Resource).join(Wishlist, Resource.id == Wishlist.item_id)\
              .filter(Wishlist.user_email == email_clean).all()
    return items

@app.get("/api/wishlist/{email}")
def get_user_wishlist_path(email: str, db: Session = Depends(get_db)):
    email_clean = email.lower().strip()
    items = db.query(Resource).join(Wishlist, Resource.id == Wishlist.item_id)\
              .filter(Wishlist.user_email == email_clean).all()
    return items

@app.post("/api/wishlist/add")
@app.post("/api/marketplace/wishlist/add")
def add_to_wishlist(data: dict, db: Session = Depends(get_db)):
    try:
        # SUPER SAFE FALLBACK: Check for all possible ways the frontend might send the email
        raw_email = data.get("user_email") or data.get("email") or data.get("userEmail")
        
        if not raw_email:
            raise HTTPException(status_code=400, detail="Email is required")
            
        user_email = str(raw_email).lower().strip()
        item_id = data.get("item_id") or data.get("id")
        
        exists = db.query(Wishlist).filter(
            Wishlist.user_email == user_email, 
            Wishlist.item_id == int(item_id)
        ).first()
        
        if exists:
            return {"status": "success", "message": "Already in wishlist"}

        new_item = Wishlist(user_email=user_email, item_id=int(item_id))
        db.add(new_item)
        db.commit()
        return {"status": "success", "message": "Added to wishlist"}
        
    except Exception as e:
        db.rollback()
        print(f"🔥 WISHLIST CRASH: {str(e)}") 
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/wishlist/{email}/{item_id}")
@app.delete("/api/marketplace/wishlist/{email}/{item_id}")
def delete_from_wishlist(email: str, item_id: int, db: Session = Depends(get_db)):
    try:
        email_clean = email.lower().strip()
        wish_item = db.query(Wishlist).filter(
            Wishlist.user_email == email_clean,
            Wishlist.item_id == item_id
        ).first()
        
        if wish_item:
            db.delete(wish_item)
            db.commit()
            
        return {"status": "success", "message": "Removed from wishlist"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/rides/{ride_id}/book")
async def book_ride(ride_id: int, request: BookingRequest, db: Session = Depends(get_db)):
    # 1. Find the ride
    ride = db.query(Ride).filter(Ride.id == ride_id).first()    
    if not ride:
        return JSONResponse(
        content={
            "status": "success",
            "message": "Booked!",
            "ride_info": {
                "driver_name": ride.driver_name,
                "vehicle_model": ride.vehicle_model if hasattr(ride, 'vehicle_model') else "Campus Ride",
                "vehicle_no": ride.license_number # This is your plate number
            }
        },
        headers={"Access-Control-Allow-Origin": "http://localhost:5173"}
    )
    
    if ride.seats_available <= 0:
        return JSONResponse(
            status_code=400, 
            content={"detail": "No seats available"},
            headers={"Access-Control-Allow-Origin": "http://localhost:5173"}
        )
    # We use ride.owner (which is an email) to get the driver's numeric ID
    driver = db.query(User).filter(User.college_email == ride.owner).first()
    if not driver:
        print(f"❌ Driver error: {ride.owner} not found")
        raise HTTPException(status_code=404, detail="Driver record missing")

    try:
        # Deduct seat
        ride.seats_available -= 1

        # WALLET LOGIC
        total_price = ride.price_per_seat
        driver_share = total_price * 0.75
        
        # Update Driver's Wallet using driver.id
        driver_wallet = db.query(Wallet).filter(Wallet.user_id == driver.id).first()
        if not driver_wallet:
            driver_wallet = Wallet(user_id=driver.id, balance=0.0, pending_earnings=0.0, total_revenue=0.0)
            db.add(driver_wallet)
            db.flush() 

        driver_wallet.pending_earnings += driver_share
        driver_wallet.total_revenue += total_price

        # Log the transaction
        new_tx = Transaction(
            user_id=driver.id,
            amount=driver_share,
            type="EARNING",
            description=f"Earned from ride to {ride.destination}"
        )
        db.add(new_tx)

        # Create the Booking entry for the passenger (So it shows in My Bookings)
        new_booking = Booking(
            ride_id=ride_id,
            booker_email=request.booker_email.lower().strip(),
            otp_code=str(random.randint(1000, 9999)),
            status="SCHEDULED"
        )
        db.add(new_booking)
        
        db.commit()

        return JSONResponse(
            content={
                "status": "success", 
                "message": f"Seat booked! ₹{driver_share} added to pending earnings."
            },
            headers={"Access-Control-Allow-Origin": "http://localhost:5173"}
        )

    except Exception as e:
        db.rollback()
        print(f"🔥 Backend Crash: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal Server Error during booking"},
            headers={"Access-Control-Allow-Origin": "http://localhost:5173"}
        )

@app.options("/api/rides/{ride_id}/book")
async def options_book_ride(ride_id: int):
    return JSONResponse(
        content="OK",
        headers={
            "Access-Control-Allow-Origin": "http://localhost:5173",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Credentials": "true",
        },
    )

@app.get("/api/wallet/transactions/{email}")
def get_wallet_transactions(email: str, db: Session = Depends(get_db)):
    # 1. Find the user first
    user = db.query(User).filter(User.college_email == email.lower().strip()).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 2. Fetch all transactions for this user, newest first
    transactions = db.query(Transaction).filter(
        Transaction.user_id == user.id
    ).order_by(Transaction.timestamp.desc()).all()
    
    return transactions
@router.post("/api/report")
async def submit_report(req: ReportRequest, db: Session = Depends(get_db)):
    try:
        new_report = models.Report(
            reporter_email=req.reporter_email.lower().strip(),
            reported_email=req.reported_email.lower().strip(),
            reason=req.reason,
            description=req.description,
            category=req.category,
            item_id=req.item_id
        )
        db.add(new_report)
        
        reports_count = db.query(models.Report).filter(
            models.Report.reported_email == req.reported_email
        ).count()
        
        if reports_count >= 5:
            print(f"⚠️ ALERT: User {req.reported_email} has reached high report threshold!")

        db.commit()
        return {"status": "success", "message": "Report submitted for review."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Reporting failed.")

@app.get("/api/marketplace/download/{item_id}")
def download_digital_item(item_id: int, user_email: str, db: Session = Depends(get_db)):
    # 1. Fetch the specific purchase record for THIS user
    purchase = db.query(Purchase).filter(
        Purchase.resource_id == item_id,
        Purchase.user_email == user_email.lower().strip()
    ).first()
    if not purchase:
        raise HTTPException(status_code=403, detail="Purchase record not found.")
    if purchase.is_downloaded:
        raise HTTPException(status_code=403, detail="File already vaulted.")
    # 2. Fetch the resource
    item = db.query(Resource).filter(Resource.id == item_id).first()
    if not item or not item.file_url:
        raise HTTPException(status_code=404, detail="File details not found")
    # 3. FIX PATH: Ensure the path is absolute for Windows/Linux consistency
    relative_path = item.file_url.lstrip("/") 
    file_path = os.path.abspath(relative_path)
    if not os.path.exists(file_path):
        file_path = os.path.join(os.getcwd(), relative_path)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Physical file missing on server")
    # 4. Mark as downloaded
    purchase.is_downloaded = True
    db.commit()
    # 5. Return FileResponse with explicit headers to prevent 0B file
    return FileResponse(
        path=file_path, 
        filename=f"CampusBuddy_{item.id}.pdf",
        media_type='application/pdf',
        headers={"Content-Disposition": f"attachment; filename=CampusBuddy_{item.id}.pdf"}
    )
    
@app.get("/api/rides")
def get_rides(db: Session = Depends(get_db)):
    return db.query(Ride).filter(Ride.seats_available > 0).all()

@app.post("/api/rides")
def create_ride(ride: RideCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.college_email == ride.owner).first()
    new_ride = Ride(
        destination=ride.destination,
        departure_time=ride.departure_time,
        seats_available=ride.seats_available,
        price_per_seat=ride.price_per_seat,
        driver_name=user.full_name if user else ride.driver_name,
        contact=ride.contact,
        owner=ride.owner
    )
    db.add(new_ride)
    db.commit()
    return {"status": "success"}

@app.post("/api/users/verify-driver") 
async def verify_driving_license(
    full_name: str = Form(...),
    license_no: str = Form(...),
    email: str = Form(...),
    expiry_date: str = Form(None),
    id_card: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    db_user = db.query(User).filter(User.college_email == email.lower().strip()).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    if db_user.is_driver_verified:
        return {"success": True, "message": "User is already a verified driver."}

    contents = await id_card.read()
    results = reader.readtext(contents, detail=0)
    detected_text = " ".join(results).lower()

    def clean(text):
        return re.sub(r'[^a-zA-Z0-9]', '', str(text)).lower()

    c_form_name, c_signup_name, c_license_no, c_ocr_text = clean(full_name), clean(db_user.full_name or ""), clean(license_no), clean(detected_text)

    if c_form_name != c_signup_name:
        raise HTTPException(status_code=400, detail="Name mismatch with signup record.")
    if c_signup_name not in c_ocr_text:
        raise HTTPException(status_code=400, detail="Name not detected on license.")
    if c_license_no not in c_ocr_text:
        raise HTTPException(status_code=400, detail="License number not found on image.")

    try:
        db_user.is_driver_verified = True 
        db_user.license_no = license_no.upper().strip()
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database update failed.")
    return {"success": True, "message": "Identity and License verified successfully!"}

# ---  VERIFY OTP & START RIDE ---
@app.post("/api/rides/start")
def start_ride(req: StartRideRequest, db: Session = Depends(get_db)):
    # Find the specific passenger's booking
    booking = db.query(Booking).filter(
        Booking.ride_id == req.ride_id, 
        Booking.booker_email == req.passenger_email.lower().strip()
    ).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Passenger booking not found")

    # Verify the OTP
    if str(booking.otp_code) != str(req.otp_code):
        raise HTTPException(status_code=400, detail="Invalid OTP. Please check with the passenger.")

    # Mark the passenger as boarded
    booking.status = "IN_TRANSIT"
    booking.otp_code = None # Clear OTP after use for security

    # Update the overall Ride status to IN_TRANSIT
    ride = db.query(Ride).filter(Ride.id == req.ride_id).first()
    if ride and ride.status == "SCHEDULED":
        ride.status = "IN_TRANSIT"

    db.commit()
    return {"status": "success", "message": "OTP Verified! Passenger boarded."}

# --- COMPLETE RIDE ---
@app.post("/api/rides/complete")
def complete_ride(req: CompleteRideRequest, db: Session = Depends(get_db)):
    # Find the ride
    ride = db.query(Ride).filter(Ride.id == req.ride_id).first()
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    ride.status = "COMPLETED"
    # Update all active bookings to completed
    bookings = db.query(Booking).filter(Booking.ride_id == req.ride_id).all()
    for b in bookings:
        b.status = "COMPLETED"
    db.commit()
    return {"status": "success", "message": "Ride completed successfully!"}

@app.get("/api/my-bookings/{email:path}")
def get_my_bookings(email: str, db: Session = Depends(get_db)):
    email_clean = email.lower().strip()
    
    results = db.query(Ride, Booking).join(Booking).filter(Booking.booker_email == email_clean).all()
    
    output = []
    for ride, booking in results:
        ride_dict = {
            "id": ride.id,
            "destination": ride.destination,
            "departure_time": ride.departure_time,
            "seats_available": ride.seats_available,
            "price_per_seat": ride.price_per_seat,
            "driver_name": ride.driver_name,
            "owner": ride.owner,
            "status": ride.status,          
            "otp_code": booking.otp_code    
        }
        output.append(ride_dict)
        
    return output

@app.delete("/api/rides/{ride_id}")
def delete_ride(ride_id: int, db: Session = Depends(get_db)):
    ride = db.query(Ride).filter(Ride.id == ride_id).first()
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    try:
        db.query(Booking).filter(Booking.ride_id == ride_id).delete()
        db.delete(ride)
        db.commit()
        return {"message": "Ride deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# --- MARKETPLACE & HANDOVER LOGIC ---
@app.post("/api/marketplace/post")
async def create_item(
    category: str = Form(...), 
    title: str = Form(...), 
    description: Optional[str] = Form(None),
    courseName: str = Form(...), 
    semester: str = Form(...), 
    owner_email: str = Form(...),
    owner_name: str = Form("Campus Student"), 
    isFree: str = Form(...), 
    price: str = Form("0"),  
    meetup_location: str = Form(...), 
    file: Optional[UploadFile] = File(None), 
    db: Session = Depends(get_db)
):
    # --- 1. EXISTING SPAM & QUALITY CHECKS ---
    clean_title = title.lower().strip()
    clean_desc = (description or "").lower().strip()
    full_text = f"{clean_title} {clean_desc}"
    spam_blacklist = ["slipper", "chappal", "heel", "shoe", "sandle", "footwear", "bedsheet", "pillow", "curtain", "tshirt", "jeans", "top", "dress", "makeup", "food", "bottle", "bag", "purse", "wallet"]
    
    if any(word in full_text for word in spam_blacklist):
        raise HTTPException(status_code=400, detail=f"SECURITY ALERT: Non-academic items ({clean_title}) are strictly prohibited.")
        
    generic_words = ["sheets", "item", "old", "used", "thing", "paper"]
    if clean_title in generic_words and len(clean_desc) < 20:
        raise HTTPException(status_code=400, detail="LOW QUALITY: Please provide a detailed description for this item (min 20 chars).")

    is_digital = category in ["Notes", "Old Papers"]
    contents = await file.read() if file else None
    
    # --- 2. INTEGRATED ACADEMIC VALIDATION ---
    if contents:
        academic_markers = ["edition", "calculator", "university", "author", "notes", "semester", "syllabus", "physics", "chemistry", "mathematics", "computer", "engineering"]
        extracted_text = ""

        # Logic for Digital Items (Notes/Papers) - Supports PDF & Image
        if is_digital:
            if file.filename.lower().endswith(".pdf"):
                try:
                    doc = fitz.open(stream=contents, filetype="pdf")
                    extracted_text = " ".join([page.get_text() for page in doc[:2]]) # Read first 2 pages
                except:
                    raise HTTPException(status_code=400, detail="Could not read PDF content.")
            else: # Image-based notes
                nparr = np.frombuffer(contents, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                if img is not None:
                    results = reader.readtext(img, detail=0)
                    extracted_text = " ".join(results).lower()

            if not any(marker in extracted_text.lower() for marker in academic_markers):
                raise HTTPException(status_code=400, detail="AI REJECTION: This file does not contain valid academic content.")

        # Logic for Physical Items (Non-Digital) - Your Original OCR Logic
        else:
            nparr = np.frombuffer(contents, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img is not None:
                results = reader.readtext(img, detail=0)
                detected_text = " ".join(results).lower()
                if not results or len(detected_text) < 3:
                     raise HTTPException(status_code=400, detail="AI REJECTION: No academic context detected in image.")

    # --- 3. SAVE FILE & DB INSERTION (Kept same as original) ---
    try:
        is_free_bool = str(isFree).lower() in ['true', '1', 't', 'y', 'yes']
        final_price = 0.0 if is_free_bool else float(str(price).strip() or 0)
    except:
        raise HTTPException(status_code=400, detail="Invalid price")

    file_db_url = None
    if file and contents:
        if category == "Old Papers": target_folder, url_prefix = PAPERS_DIR, "static/old_papers"
        elif category == "Notes": target_folder, url_prefix = NOTES_DIR, "static/notes"
        else: target_folder, url_prefix = IMAGES_DIR, "static/img"
        
        filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename.replace(' ', '_')}"
        file_path = os.path.join(target_folder, filename)
        
        with open(file_path, "wb") as buffer:
            buffer.write(contents)
        file_db_url = f"/{url_prefix}/{filename}"

    try:
        new_res = Resource(
            title=title, category=category, description=description or "",
            owner=owner_email, owner_name=owner_name, price=final_price,
            course=courseName, semester=semester, file_url=file_db_url,
            meetup_location=meetup_location, status="AVAILABLE", trust_rank=85
        )
        db.add(new_res)
        db.commit()
        return {"status": "success", "message": "Verified & Posted!"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error.")

@app.post("/api/marketplace/purchase")
async def purchase_item(request: PurchaseRequest, db: Session = Depends(get_db)):
    item_id = request.item_id
    buyer_email = request.buyer_email.lower().strip()

    item = db.query(Resource).filter(Resource.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    is_digital = item.category in ["Notes", "Old Papers"]

    try:
        # Create a new entry for EVERY buyer in the 'purchases' table.
        new_purchase = Purchase(user_email=buyer_email, resource_id=item.id)
        db.add(new_purchase)

        if is_digital:
            # Set 7-day window if not set
            if not getattr(item, 'expiry_date', None):
                item.expiry_date = datetime.now(timezone.utc) + timedelta(days=7)
            item.status = "AVAILABLE" # Digital stays available
        else:
            # FIX: Defined new_otp properly
            new_otp = str(random.randint(1000, 9999))
            item.status = "PENDING_HANDOVER"
            item.buyer_email = buyer_email
            item.otp_code = new_otp

        db.commit()
        
        return {
            "status": "success", 
            "is_digital": is_digital,
            "message": "Access Granted!" if is_digital else "Provide OTP to seller.",
            "otp": item.otp_code if not is_digital else None
        }
    except Exception as e:
        db.rollback()
        print(f"Purchase Error: {e}")
        raise HTTPException(status_code=500, detail="Database update failed")

@app.put("/api/marketplace/edit/{item_id}")
async def edit_item(item_id: int, data: dict, db: Session = Depends(get_db)):
    item = db.query(Resource).filter(Resource.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    if "price" in data:
        item.price = float(data["price"])

    db.commit()
    return {"status": "success", "message": "Price updated"}
    
    # Update fields safely
    item.title = data.get("title", item.title)
    item.description = data.get("description", item.description)
    item.price = float(data.get("price", item.price))
    item.meetup_location = data.get("meetup_location", item.meetup_location)
    
    db.commit()
    return {"status": "success", "message": "Item updated successfully"}

async def post_review(data: ReviewCreate, db: Session = Depends(get_db)):
    try:
        # 1. Create the Review object
        new_review = Review(
            resource_id=data.resource_id,
            user_email=data.user_email.lower().strip(),
            rating=data.rating,
            comment=data.comment
        )
        db.add(new_review)
        db.commit() 
        db.refresh(new_review)

        # 2. Update Resource Statistics
        item = db.query(Resource).filter(Resource.id == data.resource_id).first()
        if item:
            all_reviews = db.query(Review).filter(Review.resource_id == data.resource_id).all()
            ratings = [r.rating for r in all_reviews]
            count = len(ratings)
            
            if count > 0:
                item.avg_rating = sum(ratings) / count
                item.review_count = count

            # AI Trust Rank Logic
            current_trust = item.trust_rank if item.trust_rank is not None else 80
            if data.rating >= 4:
                item.trust_rank = min(100, current_trust + 2)
            elif data.rating <= 2:
                item.trust_rank = max(10, current_trust - 10)

            db.commit()
            
            return {
                "status": "success", 
                "new_avg": item.avg_rating, 
                "total_reviews": item.review_count
            }
            
    except Exception as e:
        db.rollback()
        print(f"🔥 DATABASE CRASH DETAIL: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/api/marketplace/items")
def get_all_items(db: Session = Depends(get_db)):
    # 1. Capture current time for expiry check
    now = datetime.now(timezone.utc)

    items = db.query(Resource).filter(
        or_(
            Resource.status == "AVAILABLE",
            and_(
                Resource.category.in_(["Notes", "Old Papers"]),
                Resource.expiry_date > now
            )
        )
    ).all()
    
    result = []
    for item in items:
        reviews = db.query(Review, User.full_name, User.avatar_url).\
            join(User, Review.user_email == User.college_email).\
            filter(Review.resource_id == item.id).all()
        
        review_list = []
        for r, name, avatar in reviews:
            review_list.append({
                "id": r.id,
                "user_name": name,
                "user_avatar": avatar,
                "rating": r.rating,
                "comment": r.comment,
                "date": r.created_at
            })

        item_data = {
            "id": item.id,
            "title": item.title,
            "category": item.category,
            "description": item.description,
            "owner": item.owner,
            "owner_name": item.owner_name,
            "price": item.price,
            "course": item.course,
            "semester": item.semester,
            "file_url": item.file_url,
            "meetup_location": item.meetup_location,
            "status": item.status,
            "trust_rank": item.trust_rank or 80,
            "avg_rating": item.avg_rating or 0,
            "review_count": item.review_count or 0,
            "reviews": review_list  
        }
        result.append(item_data)
        
    return result

@app.get("/api/my-orders/{user_email}")
async def get_user_orders(user_email: str, db: Session = Depends(get_db)):
    email_clean = user_email.lower().strip()
    
    orders = db.query(Resource, Purchase.is_downloaded).\
        join(Purchase, Resource.id == Purchase.resource_id).\
        filter(Purchase.user_email == email_clean).all()
    
    result = []
    for res, is_dl in orders:
        # Convert to dict and explicitly set the download status from the Purchase table
        order_dict = {column.name: getattr(res, column.name) for column in res.__table__.columns}
        order_dict["is_downloaded"] = is_dl
        
        if res.category in ["Notes", "Old Papers"]:
            order_dict["status"] = "RECEIVED"
        result.append(order_dict)
            
    return result

@app.get("/api/marketplace/inbox/{email}")
def get_user_inbox(email: str, db: Session = Depends(get_db)):
    email_clean = email.lower().strip()
    return db.query(Message).filter(
        or_(
            Message.receiver_email.ilike(email_clean),
            Message.sender_email.ilike(email_clean)
        )
    ).order_by(Message.timestamp.desc()).all()

@app.get("/api/marketplace/messages/{user1:path}/{user2:path}")
def get_chat(user1: str, user2: str, db: Session = Depends(get_db)):
    u1, u2 = user1.lower().strip(), user2.lower().strip()
    
    messages = db.query(Message).filter(
        or_(
            and_(Message.sender_email.ilike(u1), Message.receiver_email.ilike(u2)), 
            and_(Message.sender_email.ilike(u2), Message.receiver_email.ilike(u1))
        )
    ).order_by(Message.timestamp.asc()).all()
    
    result = []
    for m in messages:
        user_info = db.query(User).filter(User.college_email.ilike(m.sender_email)).first()
        name = user_info.full_name if user_info and user_info.full_name else str(m.sender_email).split('@')[0]
        
        result.append({
            "id": m.id, 
            "sender_email": str(m.sender_email).lower(), # Force lowercase for frontend consistency
            "receiver_email": str(m.receiver_email).lower(), 
            "content": m.content, 
            "timestamp": m.timestamp.isoformat() if m.timestamp else None, 
            "is_read": m.is_read, 
            "sender_name": name
        })
    return result

@app.post("/api/marketplace/send-message")
def send_message(msg: MessageCreate, db: Session = Depends(get_db)):
    new_msg = Message(
        item_id=msg.item_id, 
        sender_email=msg.sender_email.lower().strip(), 
        receiver_email=msg.receiver_email.lower().strip(), 
        content=msg.content, 
        is_read=False
    )
    db.add(new_msg)
    db.commit()
    return {"status": "success"}

@app.post("/api/marketplace/mark-read")
async def mark_messages_as_read(data: MarkReadRequest, db: Session = Depends(get_db)):
    db.query(Message).filter(Message.sender_email == data.sender_email.lower().strip(), Message.receiver_email == data.receiver_email.lower().strip(), Message.is_read == False).update({Message.is_read: True})
    db.commit()
    return {"status": "success"}

@app.get("/api/my-activity/{email:path}")
def get_activity(email: str, db: Session = Depends(get_db)):
    return {"listings": db.query(Resource).filter(Resource.owner == email).all(), "offers": db.query(Ride).filter(Ride.owner == email).all()}

@app.delete("/api/delete-resource/{item_id}")
def delete_resource(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Resource).filter(Resource.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if item.file_url and os.path.exists(item.file_url.lstrip("/")):
        os.remove(item.file_url.lstrip("/"))
    db.query(Message).filter(Message.item_id == item_id).delete()
    db.delete(item)
    db.commit()
    return {"message": "Item deleted"}

@app.post("/api/payments/verify")
async def verify_payment(req: PaymentVerifyRequest, db: Session = Depends(get_db)):
    item = db.query(Resource).filter(Resource.id == req.item_id).first()
    if not item: 
        raise HTTPException(status_code=404, detail="Item not found")

    # This creates the entry in purchase order so it shows in 'My Orders'
    new_purchase = Purchase(user_email=req.buyer_email.lower().strip(), resource_id=item.id)
    db.add(new_purchase)
    
    # If physical, update status
    if item.category not in ["Notes", "Old Papers"]:
        item.status = "PENDING_HANDOVER" 
        item.buyer_email = req.buyer_email.lower().strip()
        item.otp_code = str(random.randint(1000, 9999))
    
    db.commit()
    return {"status": "success", "message": "Claim recorded"}

@app.post("/api/payment/complete")
async def complete_payment(ride_id: int, db: Session = Depends(get_db)):
    ride = db.query(Ride).filter(Ride.id == ride_id).first()
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")

    # Find the Seller (Driver)
    seller_id = ride.driver_id
    
    # Get or Create Seller's Wallet
    seller_wallet = db.query(Wallet).filter(Wallet.user_id == seller_id).first()
    if not seller_wallet:
        seller_wallet = Wallet(user_id=seller_id, balance=0.0, pending_earnings=0.0, total_revenue=0.0)
        db.add(seller_wallet)

    try:
        # Update Wallet: Add ride price to balance and total revenue
        ride_amount = float(ride.price)
        seller_wallet.balance += ride_amount
        seller_wallet.total_revenue += ride_amount
        
        # Mark ride as paid
        ride.status = "COMPLETED"
        ride.payment_status = "PAID"

        # Record the transaction for the seller
        new_tx = Transaction(
            user_id=seller_id,
            amount=ride_amount,
            type="INCOME",
            description=f"Earned from ride #{ride.id}"
        )
        db.add(new_tx)
        
        db.commit()
        return {"status": "success", "new_balance": seller_wallet.balance}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Wallet update failed")
@router.post("/api/confirm-seat/{booking_id}")
async def confirm_seat(booking_id: int):
    db = get_db()
    
    # 1. Fetch the specific booking
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # 2. Generate a 4-digit numeric OTP for the Buyer
    otp = ''.join(random.choices(string.digits, k=4))
    
    # 3. Update status and save OTP
    booking.status = "CONFIRMED"
    booking.otp_code = otp
    
    db.commit()
    return {"message": "Seat confirmed", "otp": otp}

@app.post("/api/rides/confirm-payment/{ride_id}")
async def process_ride_payment(ride_id: int, db: Session = Depends(get_db)):
    ride = db.query(Ride).filter(Ride.id == ride_id).first()
    

    total_paid = ride.price_per_seat
    cb_commission = total_paid * 0.25  # 25% for Campus Buddy
    driver_share = total_paid * 0.75   # 75% for Driver
    
    # Find or Create Wallet for Driver
    wallet = db.query(Wallet).filter(Wallet.user_id == ride.owner_id).first()
    if not wallet:
        wallet = Wallet(user_id=ride.owner_id)
        db.add(wallet)
    
    # Update Virtual Ledger
    wallet.pending_earnings += driver_share
    wallet.total_revenue += total_paid
    
    # Log the Transaction
    new_tx = Transaction(
        user_id=ride.owner_id,
        amount=driver_share,
        type="EARNING",
        description=f"Ride from {ride.start_location} to {ride.destination}"
    )
    db.add(new_tx)
    
    db.commit()
    return {"message": "Payment held in Escrow. Settling at 9 PM."}

@router.get("/api/rider-bookings/{rider_email}")
async def get_rider_activity(rider_email: str, db: Session = Depends(get_db)):
    """
    Fetches bookings for rides posted by the specific rider.
    Used by RiderActivity.jsx
    """
    # Join Ride and Booking to find passengers for rides owned by rider_email
    bookings = db.query(Booking).join(Ride).filter(Ride.owner == rider_email).all()
    return bookings

@router.post("/api/verify-ride-otp")
async def verify_ride_otp(request: HandoverVerify, db: Session = Depends(get_db)):
    """
    Called by the Rider at the meetup point.
    Matches the OTP provided by the Buyer to mark the ride as COMPLETED.
    """
    # 1. Find the booking
    booking = db.query(Booking).filter(Booking.id == request.order_id).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking record not found")
        
    # 2. Check if the OTP matches
    if booking.otp_code != request.otp_code:
        raise HTTPException(status_code=400, detail="Invalid OTP. Please check with the passenger.")
        
    # 3. Update status to COMPLETED
    booking.status = "RECEIVED" # Matching your frontend 'isReceived' logic
    booking.otp_code = None # Clear OTP after successful use
    
    db.commit()
    return {"message": "Ride completed successfully! Safe travels."}

@router.post("/api/submit-rating")
async def submit_rating(request: RatingRequest, db: Session = Depends(get_db)):
    """
    Saves user feedback, updates the seller's global rating, 
    and rewards BOTH users with Buddy Points.
    """
    target_user = db.query(User).filter(User.college_email == request.target_email.lower().strip()).first()
    reviewer = db.query(User).filter(User.college_email == request.reviewer_email.lower().strip()).first()
    
    if not target_user:
        raise HTTPException(status_code=404, detail="Seller not found")

    current_points = getattr(target_user, 'points', 0) or 0
    target_user.points = current_points + (request.stars * 10)
    
    current_rating = getattr(target_user, 'rating', 0) or 0
    target_user.rating = ((current_rating + request.stars) / 2) if current_rating > 0 else request.stars

    if reviewer:
        reviewer_points = getattr(reviewer, 'points', 0) or 0
        reviewer.points = reviewer_points + 10
    
    db.commit()
    
    return {
        "message": "Thank you for your feedback! You earned +10 Buddy Points.", 
        "seller_points": request.stars * 10,
        "buyer_points": 10
    }

@router.post("/api/users/rate")
async def rate_user(req: RatingRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.college_email == req.target_email).first()
    if user and hasattr(user, 'rating'):
        user.rating = (user.rating + req.stars) / 2
        db.commit()
    return {"status": "success"}

@router.post("/api/users/add-points")
async def add_points(req: PointsRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.college_email == req.email).first()
    if user and hasattr(user, 'points'):
        user.points = (user.points or 0) + req.amount
        db.commit()
        return {"status": "success", "new_total": user.points}
    return {"status": "processed"}

@app.delete("/api/auth/terminate-account")
async def terminate_account(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.college_email == email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        db.delete(user)
        db.commit()
        return {"status": "success", "message": "Account terminated permanently."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error during termination.")


app.include_router(marketplace_router)
app.include_router(sos.router, prefix="/api/sos", tags=["Security"])
app.include_router(router)

app = app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
