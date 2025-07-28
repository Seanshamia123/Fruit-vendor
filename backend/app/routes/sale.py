from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.sale import Sale
from app.schemas.sale import SaleCreate, SaleOut
from app.database import SessionLocal
from app.routes.auth import get_current_vendor

router = APIRouter(prefix="/sales", tags=["Sales"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=SaleOut)
def create_sale(
    sale: SaleCreate,
    db: Session = Depends(get_db),
    current_vendor = Depends(get_current_vendor)
):
    new_sale = Sale(
        vendor_id=current_vendor.id,
        product_id=sale.product_id,
        quantity=sale.quantity,
        unit_price=sale.unit_price,
        total_price=sale.total_price
    )
    db.add(new_sale)
    db.commit()
    db.refresh(new_sale)
    return new_sale

@router.get("/", response_model=list[SaleOut])
def get_sales(
    db: Session = Depends(get_db),
    current_vendor = Depends(get_current_vendor)
):
    return db.query(Sale).filter(Sale.vendor_id == current_vendor.id).all()

