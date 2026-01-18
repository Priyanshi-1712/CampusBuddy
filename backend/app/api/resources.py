from fastapi import APIRouter, Depends, UploadFile, File
from typing import List
from app.services.ai_ranking import ResourceRanker
# Assuming models and database sessions are imported here

router = APIRouter()

@router.get("/resources/search")
async def search_resources(query: str, category: str = None):
    """
    Fetches resources and applies the AI ranking before returning to the student.
    """
    # 1. Fetch resources from PostgreSQL based on query
    # raw_resources = db.query(Resource).filter(Resource.title.contains(query)).all()
    
    # 2. Example: Applying the AI Ranking Logic
    ranked_list = []
    for res in raw_resources:
        score = ResourceRanker.calculate_score(
            avg_rating=res.avg_rating,
            total_reviews=res.review_count,
            uploader_trust=res.owner.trust_score,
            upload_date=res.created_at
        )
        ranked_list.append({"resource": res, "ai_score": score})

    # 3. Sort by the highest AI score
    ranked_list.sort(key=lambda x: x["ai_score"], reverse=True)
    
    return ranked_list

@router.post("/resources/upload")
async def upload_resource(title: str, file: UploadFile = File(...)):
    # Logic to save to AWS S3 or Local Storage
    # file_url = upload_to_s3(file)
    return {"message": "Resource uploaded successfully. Awaiting campus verification."}