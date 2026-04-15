from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)
    description = Column(String, nullable=True)
    owner = Column(String, nullable=False)  
    owner_name = Column(String, default="Campus Student")
    price = Column(Float, default=0.0)
    course = Column(String, nullable=True)
    semester = Column(String, nullable=True)
    file_url = Column(String, nullable=True)
    meetup_location = Column(String, nullable=True)
    status = Column(String, default="AVAILABLE")
    created_at = Column(DateTime, default=datetime.utcnow)
    # --- BUYER INFO ---
    buyer_email = Column(String, nullable=True)
    otp_code = Column(String, nullable=True)
    is_downloaded = Column(Boolean, default=False)
    # --- AI RANKING & TRUST FIELDS ---
    trust_rank = Column(Integer, default=100)
    avg_rating = Column(Float, default=4.0)
    review_count = Column(Integer, default=0)
    expiry_date = Column(DateTime, nullable=True) 

class Purchase(Base):
    __tablename__ = "purchases"
    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, nullable=False)
    resource_id = Column(Integer, nullable=False) 
    purchase_date = Column(DateTime, default=datetime.utcnow)
    is_downloaded = Column(Boolean, default=False)

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, nullable=False)
    sender_email = Column(String, nullable=False)
    receiver_email = Column(String, nullable=False)
    content = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    is_read = Column(Boolean, default=False)

class Wishlist(Base):
    __tablename__ = "wishlist"
    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, nullable=False)
    item_id = Column(Integer, nullable=False)

class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey("resources.id"))
    user_email = Column(String, nullable=False)
    rating = Column(Integer)  # 1 to 5
    comment = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)