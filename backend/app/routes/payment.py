# backend/app/routes/payment.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.schemas.payment import PaymentCreate, PaymentOut
from app.services import payment as payment_service
from app.routes.auth import get_current_vendor
from app.models.sale import Sale

router = APIRouter(prefix="/payments", tags=["Payments"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=PaymentOut)
def create_payment(
    payment: PaymentCreate,
    db: Session = Depends(get_db),
    current_vendor = Depends(get_current_vendor)
):
    # verify vendor owns the sale
    sale = db.query(Sale).filter(
        Sale.id == payment.sale_id,
        Sale.vendor_id == current_vendor.id
    ).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found or not yours")

    return payment_service.create_payment(db, payment)

@router.get("/sale/{sale_id}", response_model=list[PaymentOut])
def list_payments_for_sale(
    sale_id: int,
    db: Session = Depends(get_db),
    current_vendor = Depends(get_current_vendor)
):
    sale = db.query(Sale).filter(
        Sale.id == sale_id,
        Sale.vendor_id == current_vendor.id
    ).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found or not yours")

    return payment_service.get_payments_for_sale(db, sale_id)

@router.delete("/{payment_id}")
def delete_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_vendor = Depends(get_current_vendor)
):
    payment = payment_service.get_payment_by_id(db, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    if payment.sale.vendor_id != current_vendor.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    success = payment_service.delete_payment(db, payment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Failed to delete")
    return {"detail": "Deleted successfully"}
