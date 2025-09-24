from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.schemas.inventory_history import InventoryHistoryCreate, InventoryHistoryOut
from app.services import inventory_history

router = APIRouter(prefix="/inventory-history", tags=["InventoryHistory"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=InventoryHistoryOut)
def add_inventory_history(history: InventoryHistoryCreate, db: Session = Depends(get_db)):
    return inventory_history_service.create_inventory_history(db, history)

@router.get("/{inventory_id}", response_model=list[InventoryHistoryOut])
def get_inventory_history(inventory_id: int, db: Session = Depends(get_db)):
    return inventory_history_service.list_inventory_history(db, inventory_id)
