from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import EmailStr
from app.services.id_verification import verify_poornima_id 
router = APIRouter()
@router.post("/register-final")
async def register_final(
    email: EmailStr = Form(...),
    full_name: str = Form(...),
    password: str = Form(...),
    otp: str = Form(...),
    id_card: UploadFile = File(...) 
):
    # 1. Strict University Domain Check
    if not email.endswith("@poornima.edu.in"):
        raise HTTPException(
            status_code=400, 
            detail="Only Poornima University emails allowed"
        )
    # 3. Read the image file content
    id_card_content = await id_card.read()
    # 4. Verify the physical ID Card format using OCR
    is_valid, message = verify_poornima_id(id_card_content)
    if not is_valid:
        raise HTTPException(status_code=400, detail=message)    
    return {
        "status": "success",
        "message": "ID Verified and Account Created!",
        "user": full_name
    }