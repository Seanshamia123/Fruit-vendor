from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.purchase import Purchase
from app.schemas.purchase import PurchaseCreate, PurchaseOut
from app.routes.auth import get_current_vendor

router = APIRouter(prefix="/purchases", tags=["Purchases"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=PurchaseOut)
def create_purchase(
    purchase: PurchaseCreate,
    db: Session = Depends(get_db),
    current_vendor: dict = Depends(get_current_vendor)
):
    new_purchase = Purchase(
        vendor_id=current_vendor.id,
        product_id=purchase.product_id,
        quantity=purchase.quantity,
        unit_cost=purchase.unit_cost,
        total_cost=purchase.total_cost,
        source=purchase.source
    )
    db.add(new_purchase)
    db.commit()
    db.refresh(new_purchase)
    return new_purchase

@router.get("/", response_model=list[PurchaseOut])
def get_all_purchases(
    db: Session = Depends(get_db),
    current_vendor: dict = Depends(get_current_vendor)
):
    return db.query(Purchase).filter(Purchase.vendor_id == current_vendor["id"]).all()
