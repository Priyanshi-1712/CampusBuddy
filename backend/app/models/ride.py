from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from app.core.database import Base
from datetime import datetime

class Ride(Base):
    __tablename__ = "rides"

    id = Column(Integer, primary_key=True, index=True)
    destination = Column(String, nullable=False)
    departure_time = Column(DateTime, nullable=False)
    seats_available = Column(Integer, default=1)
    price_per_seat = Column(Integer, default=0)
    driver_name = Column(String)
    contact = Column(String)
    owner = Column(String)  
    license_number = Column(String, nullable=True)
    status = Column(String, default="SCHEDULED") 
    

class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    ride_id = Column(Integer, ForeignKey("rides.id", ondelete="CASCADE"))
    booker_email = Column(String, nullable=False)
    status = Column(String, default="CONFIRMED")
    created_at = Column(DateTime, default=datetime.utcnow)
    otp_code = Column(String, nullable=True)
    status = Column(String, default="SCHEDULED")