from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from datetime import datetime
import uuid

class PaymentStatus(str, Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"

class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True)
    ride_id = Column(Integer, ForeignKey("rides.id"))
    transaction_id = Column(String, default=lambda: f"TXN-{uuid.uuid4().hex[:10].upper()}")
    amount = Column(Float)
    method = Column(String) # 'UPI', 'CARD', 'CASH'
    status = Column(String, default=PaymentStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)

class Wallet(Base):
    __tablename__ = "wallets"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    balance = Column(Float, default=0.0)