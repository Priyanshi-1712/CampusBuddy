from sqlalchemy import or_ 
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from app.core.database import get_db
from app.models.resource import Resource, Message
from app.services.ai_ranking import ResourceRanker
from app.models.user import User
from fastapi import APIRouter, Depends, HTTPException 
router = APIRouter(prefix="/api/marketplace", tags=["Marketplace"])

class MessageCreate(BaseModel):
    item_id: int
    sender_email: str
    receiver_email: str
    content: str

@router.get("/search")
async def search_resources(query: str, category: Optional[str] = None, db: Session = Depends(get_db)):
    query_builder = db.query(Resource).filter(Resource.title.ilike(f"%{query}%"))
    if category and category != "All":
        query_builder = query_builder.filter(Resource.category == category)
    
    raw_resources = query_builder.all()
    
    ranked_list = []
    for res in raw_resources:
        score = ResourceRanker.calculate_score(
            avg_rating=res.avg_rating or 4.0,
            total_reviews=res.review_count or 0,
            uploader_trust=5.0,
            upload_date=res.created_at or res.id
        )
        ranked_list.append({
            "id": res.id,
            "title": res.title,
            "price": res.price,
            "category": res.category,
            "owner": res.owner,
            "is_claimed": res.is_claimed,
            "status": res.status,
            "ai_score": round(score, 2)
        })

    ranked_list.sort(key=lambda x: x["ai_score"], reverse=True)
    return ranked_list


@router.post("/messages/send")
async def send_message(data: MessageCreate, db: Session = Depends(get_db)):
    new_msg = Message(
        item_id=data.item_id,
        sender_email=data.sender_email,
        receiver_email=data.receiver_email,
        content=data.content
    )
    db.add(new_msg)
    db.commit()
    return {"status": "success"}


@router.get("/messages/history/{item_id}")
async def get_history(item_id: int, user1: str, user2: str, db: Session = Depends(get_db)):
    messages = db.query(Message).filter(
        Message.item_id == item_id,
        or_(
            (Message.sender_email == user1) & (Message.receiver_email == user2),
            (Message.sender_email == user2) & (Message.receiver_email == user1)
        )
    ).order_by(Message.timestamp.asc()).all()


@router.get("/inbox/{user_email:path}")
def get_inbox(user_email: str, db: Session = Depends(get_db)):
    user_email = user_email.lower().strip()

    messages = (
        db.query(Message, User.full_name)
        .join(User, Message.sender_email == User.college_email)
        .filter(Message.receiver_email == user_email)
        .order_by(Message.timestamp.desc())
        .all()
    )

    result = []
    for m, full_name in messages:
        result.append({
            "id": m.id,
            "sender_email": m.sender_email,
            "sender_name": full_name if full_name else m.sender_email.split('@')[0],
            "content": m.content,
            "is_read": m.is_read,
            "timestamp": m.timestamp.isoformat() if m.timestamp else None
        })

    return result