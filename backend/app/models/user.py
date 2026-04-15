from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, func, Float, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)
    college_email = Column(String, unique=True, index=True)
    hashed_password = Column(String) 
    phone_number = Column(String, nullable=True)
    registration_no = Column(String, nullable=True) # <-- ADD THIS LINE
    is_verified = Column(Boolean, default=False)
    current_otp = Column(String, nullable=True)
    id_card_url = Column(String, nullable=True)
    
    # Cleaned up driver fields
    is_driver_verified = Column(Boolean, default=False)
    license_no = Column(String, nullable=True)
    license_name = Column(String, nullable=True)
    
    # Missing fields that Profile.jsx expects:
    points = Column(Integer, default=0) 
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # OTP Helpers
    hashed_otp = Column(String, nullable=True)
    otp_created_at = Column(DateTime(timezone=True), server_default=func.now())

class SOSAlert(Base):
    __tablename__ = "sos_alerts"

    id = Column(Integer, primary_key=True, index=True)
    student_email = Column(String, index=True)
    student_name = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    ride_info = Column(String) 
    status = Column(String, default="ACTIVE") # Can be ACTIVE or RESOLVED
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Wallet(Base):
    __tablename__ = "wallets"
    
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    balance = Column(Float, default=0.0) 
    pending_earnings = Column(Float, default=0.0)
    # Total revenue generated (100% amount) for reporting
    total_revenue = Column(Float, default=0.0)

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float)
    type = Column(String) # 'EARNING', 'SETTLEMENT', 'WITHDRAWAL'
    description = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

class Subscriber(Base):
    __tablename__ = "subscribers"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    joined_at = Column(DateTime, default=func.now())
class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    reporter_email = Column(String, index=True)
    reported_email = Column(String, index=True)
    reason = Column(String)  # e.g., "Suspicious Activity", "Spam", "Fake Item"
    description = Column(Text, nullable=True)
    category = Column(String) # "Marketplace" or "Ride"
    item_id = Column(Integer, nullable=True) # ID of the post or ride
    status = Column(String, default="PENDING") # PENDING, REVIEWED, ACTION_TAKEN
    timestamp = Column(DateTime, default=func.now())