@router.post("/rides/confirm")
async def confirm_ride(ride_id: str, student_otp: str):
    return {"status": "Ride Started", "tracking_url": f"/track/{ride_id}"}