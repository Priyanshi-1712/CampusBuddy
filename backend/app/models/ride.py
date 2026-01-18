from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.core.database import Base
from sqlalchemy import Column, Integer, String, DateTime, func
from app.core.database import Base

class Ride(Base):
    __tablename__ = "rides"

    id = Column(Integer, primary_key=True, index=True)
    destination = Column(String)
    departure_time = Column(String)
    seats_available = Column(Integer)
    price_per_seat = Column(Integer)
    driver_name = Column(String)
    contact_number = Column(String)
    owner = Column(String)  # This is the driver's email

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    ride_id = Column(Integer, ForeignKey("rides.id"))
    booker_email = Column(String)  # This is the passenger's email
    booking_time = Column(DateTime(timezone=True), server_default=func.now())

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    sender_email = Column(String, index=True)
    receiver_email = Column(String, index=True)
    content = Column(String)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())