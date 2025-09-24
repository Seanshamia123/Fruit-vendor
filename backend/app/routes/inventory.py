# backend/app/routes/inventory.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.schemas.inventory import InventoryCreate, InventoryOut
from app.services import inventory as inventory_service
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
    return inventory_service.add_inventory(db, current_vendor.id, inventory)

@router.get("/", response_model=list[InventoryOut])
def list_inventory(
    db: Session = Depends(get_db),
    current_vendor = Depends(get_current_vendor)
):
    return inventory_service.list_inventory(db, current_vendor.id)
