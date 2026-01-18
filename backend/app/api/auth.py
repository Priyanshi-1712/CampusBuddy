from fastapi import APIRouter, HTTPException
from pydantic import EmailStr, BaseModel

router = APIRouter()

class UserSignup(BaseModel):
    email: EmailStr
    full_name: str

@router.post("/signup")
async def signup(user: UserSignup):
    # Strict University Domain Check
    if not user.email.endswith("@poornima.edu.in"):
        raise HTTPException(status_code=400, detail="Only Poornima University emails allowed")
    
    # Logic to send 6-digit OTP via SMTP or Twilio
    # otp = generate_random_otp()
    # send_email(user.email, f"Your CampusBuddy OTP is {otp}")
    return {"message": "OTP sent to your university email"}