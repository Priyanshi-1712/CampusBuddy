from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.core.database import Base # Ensure this points to your shared Base

class Subscriber(Base):
    __tablename__ = "subscribers"
    __table_args__ = {'extend_existing': True} # <-- ADD THIS LINE

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())