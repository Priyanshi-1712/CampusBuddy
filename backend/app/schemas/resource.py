from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# --- EXISTING RESOURCE SCHEMAS ---
class ResourceBase(BaseModel):
    title: str
    description: str
    category: str 
    is_digital: bool

class ResourceCreate(ResourceBase):
    pass

# --- NEW MESSAGE SCHEMA (Fixes the NameError) ---
class MessageCreate(BaseModel):
    item_id: int
    receiver_email: str
    sender_email: str
    message: str

class ResourceResponse(ResourceBase):
    id: int
    owner_id: int
    file_url: Optional[str] = None
    ai_score: float
    created_at: datetime

    class Config:
        from_attributes = True