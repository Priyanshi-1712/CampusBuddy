from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ResourceBase(BaseModel):
    title: str
    description: str
    category: str # e.g., "B.Tech Notes", "Lab Equipment"
    is_digital: bool

class ResourceCreate(ResourceBase):
    pass

class ResourceResponse(ResourceBase):
    id: int
    owner_id: int
    file_url: Optional[str] = None
    ai_score: float
    created_at: datetime

    class Config:
        from_attributes = True