from sqlalchemy import Column, Integer, String, Boolean
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String)
    college_email = Column(String, unique=True, index=True)
    hashed_password = Column(String) # <--- This must match main.py
    is_verified = Column(Boolean, default=False)
    current_otp = Column(String, nullable=True)
    id_card_url = Column(String, nullable=True)