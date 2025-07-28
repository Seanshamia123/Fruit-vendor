from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.inventory import Inventory
from app.schemas.inventory import InventoryCreate, InventoryOut
from app.routes.auth import get_current_vendor

router = APIRouter(prefix="/inventory", tags=["Inventory"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=InventoryOut)
def add_inventory(
    inventory: InventoryCreate,
    db: Session = Depends(get_db),
    current_vendor = Depends(get_current_vendor)
):
    existing = db.query(Inventory).filter(
        Inventory.vendor_id == current_vendor.id,
        Inventory.product_id == inventory.product_id
    ).first()

    if existing:
        existing.quantity += inventory.quantity
        db.commit()
        db.refresh(existing)
        return existing

    new_item = Inventory(
        vendor_id=current_vendor.id,
        product_id=inventory.product_id,
        quantity=inventory.quantity
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.get("/", response_model=list[InventoryOut])
def list_inventory(
    db: Session = Depends(get_db),
    current_vendor = Depends(get_current_vendor)
):
    return db.query(Inventory).filter(Inventory.vendor_id == current_vendor.id).all()
