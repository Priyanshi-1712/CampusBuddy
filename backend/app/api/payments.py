@app.post("/api/payments/initiate")
async def create_payment_order(ride_id: int, method: str, db: Session = Depends(get_db)):
    ride = db.query(Ride).get(ride_id)
    new_payment = Payment(ride_id=ride_id, amount=ride.fare, method=method)
    db.add(new_payment)
    db.commit()
    return {"order_id": f"ORD_{uuid.uuid4().hex[:8]}", "payment_id": new_payment.id}

@app.post("/api/payments/verify")
async def verify_payment(payment_id: int, db: Session = Depends(get_db)):
    payment = db.query(Payment).get(payment_id)
    ride = db.query(Ride).get(payment.ride_id)
    
    # SIMULATED SUCCESS LOGIC
    payment.status = "success"
    
    # COMMISSION LOGIC (20%)
    commission = payment.amount * 0.20
    driver_earnings = payment.amount - commission
    
    driver_wallet = db.query(Wallet).filter(Wallet.user_id == ride.driver_id).first()
    
    if payment.method == "CASH":
        # Driver already has the cash, so we deduct the commission from their wallet balance
        driver_wallet.balance -= commission
    else:
        # Online payment goes to Admin first, we credit the driver's share to wallet
        driver_wallet.balance += driver_earnings
        
    db.commit()
    return {"status": "verified", "txn_id": payment.transaction_id}