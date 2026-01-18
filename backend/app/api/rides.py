@router.post("/rides/confirm")
async def confirm_ride(ride_id: str, student_otp: str):
    # 1. Fetch ride from DB
    # 2. Verify OTP matches the one sent to student
    # 3. Update ride status to 'In-Progress'
    # 4. Trigger Live Tracking via WebSockets
    return {"status": "Ride Started", "tracking_url": f"/track/{ride_id}"}