from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import EmailStr
from app.services.id_verification import verify_poornima_id 

router = APIRouter()

# 1. Changed route to /register-final to match your React fetch call
# 2. Added password and otp parameters to match your React FormData
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
    
    # 2. Verify OTP (Add your logic here to check against DB/Cache)
    # if not verify_otp_in_db(email, otp):
    #     raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    # 3. Read the image file content
    id_card_content = await id_card.read()
    
    # 4. Verify the physical ID Card format using OCR
    is_valid, message = verify_poornima_id(id_card_content)
    if not is_valid:
        raise HTTPException(status_code=400, detail=message)

    # 5. Success! Now hash password and save user to Database
    # hashed_pw = hash_password(password)
    # save_user_to_db(email, full_name, hashed_pw)
    
    return {
        "status": "success",
        "message": "ID Verified and Account Created!",
        "user": full_name
    }