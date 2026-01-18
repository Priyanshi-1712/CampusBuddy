import os
import random
import shutil
from typing import List
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, or_, and_
from sqlalchemy.orm import Session
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware 
from pydantic import BaseModel 

# Import database and models
from app.core.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.resource import Resource
from app.models.ride import Ride, Booking 
# Ensure Message is defined in your models/ride.py or models/chat.py
from app.models.ride import Message 

# Initialize Database Tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# --- 1. CORS SETUP ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 3. Uploads directory
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# --- Pydantic Schemas ---
class BookingRequest(BaseModel):
    booker_email: str

# --- AUTHENTICATION ROUTES ---

@app.post("/api/auth/send-otp")
def send_otp(data: dict, db: Session = Depends(get_db)):
    email = data.get("email")
    user = db.query(User).filter(User.college_email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Account not found.")
    otp = str(random.randint(1000, 9999))
    user.current_otp = otp
    db.commit()
    print(f"🔥 OTP FOR {email}: {otp}") 
    return {"message": "OTP Sent"}

@app.post("/api/auth/verify-otp")
def verify_otp(data: dict, db: Session = Depends(get_db)):
    email = data.get("email")
    otp_received = data.get("otp")
    user = db.query(User).filter(User.college_email == email).first()
    if user and user.current_otp == otp_received:
        user.current_otp = None 
        db.commit()
        return {"status": "success", "username": user.full_name}
    raise HTTPException(status_code=400, detail="Invalid OTP")

@app.post("/api/auth/signup")
async def signup(
    full_name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    user_exists = db.query(User).filter(User.college_email == email).first()
    if user_exists:
        raise HTTPException(status_code=400, detail="Email already registered")
    file_path = f"{UPLOAD_DIR}/{email}_id.{file.filename.split('.')[-1]}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    new_user = User(full_name=full_name, college_email=email, hashed_password=password, is_verified=False, id_card_url=file_path)
    db.add(new_user)
    db.commit()
    return {"message": "User created"}

@app.post("/api/auth/login")
def login(data: dict, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.college_email == data['email']).first()
    if not user or user.hashed_password != data['password']:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"message": "Login successful", "username": user.full_name}

# --- MARKETPLACE & RIDES ---

@app.get("/api/resources")
def get_resources(db: Session = Depends(get_db)):
    return db.query(Resource).all()

@app.post("/api/resources")
def post_resource(data: dict, db: Session = Depends(get_db)):
    new_item = Resource(title=data['title'], type=data['type'], price=int(data['price']), location=data['location'], owner=data['owner'])
    db.add(new_item)
    db.commit()
    return {"message": "Item listed!"}

@app.get("/api/rides")
def get_rides(db: Session = Depends(get_db)):
    return db.query(Ride).all()

@app.post("/api/rides")
def post_ride(data: dict, db: Session = Depends(get_db)):
    new_ride = Ride(
        destination=data['destination'],
        departure_time=data['time'],
        seats_available=int(data['seats']),
        price_per_seat=int(data['price']),
        driver_name=data['driver'],
        contact_number=data['contact'],
        owner=data['owner']
    )
    db.add(new_ride)
    db.commit()
    return {"message": "Ride shared!"}

@app.post("/api/rides/{ride_id}/book")
def book_ride_seat(ride_id: int, request: BookingRequest, db: Session = Depends(get_db)):
    ride = db.query(Ride).filter(Ride.id == ride_id).first()
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    if ride.owner == request.booker_email:
        raise HTTPException(status_code=400, detail="Cannot book your own ride")
    
    already_booked = db.query(Booking).filter(Booking.ride_id == ride_id, Booking.booker_email == request.booker_email).first()
    if already_booked:
        raise HTTPException(status_code=400, detail="Already booked")

    if ride.seats_available > 0:
        ride.seats_available -= 1
        db.add(Booking(ride_id=ride_id, booker_email=request.booker_email))
        db.commit()
        return {"message": "Success"}
    raise HTTPException(status_code=400, detail="Full")

# --- ACTIVITY & MESSAGING ---

@app.get("/api/my-activity/{email}")
def get_my_activity(email: str, db: Session = Depends(get_db)):
    items = db.query(Resource).filter(Resource.owner == email).all()
    offers = db.query(Ride).filter(Ride.owner == email).all()
    bookings = db.query(Ride).join(Booking).filter(Booking.booker_email == email).all()
    return {"listings": items, "offers": offers, "bookings": bookings}

@app.post("/api/messages/send")
def send_message(data: dict, db: Session = Depends(get_db)):
    new_msg = Message(
        sender_email=data['sender'],
        receiver_email=data['receiver'],
        content=data['content']
    )
    db.add(new_msg)
    db.commit()
    return {"status": "sent"}

@app.get("/api/messages/{user_email}/{other_email}")
def get_chat(user_email: str, other_email: str, db: Session = Depends(get_db)):
    # Fetches conversation history between two specific users
    return db.query(Message).filter(
        or_(
            and_(Message.sender_email == user_email, Message.receiver_email == other_email),
            and_(Message.sender_email == other_email, Message.receiver_email == user_email)
        )
    ).order_by(Message.timestamp).all()

@app.get("/api/conversations/{email}")
def get_conversations(email: str, db: Session = Depends(get_db)):
    # Returns a list of unique emails the user has chatted with
    sent_to = db.query(Message.receiver_email).filter(Message.sender_email == email).distinct().all()
    received_from = db.query(Message.sender_email).filter(Message.receiver_email == email).distinct().all()
    
    contacts = set([r[0] for r in sent_to] + [r[0] for r in received_from])
    return {"contacts": list(contacts)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)