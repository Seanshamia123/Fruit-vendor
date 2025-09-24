from sqlalchemy.orm import Session
from app.models.inventory_history import InventoryHistory
from app.schemas.inventory_history import InventoryHistoryCreate

def create_inventory_history(db: Session, history: InventoryHistoryCreate):
    new_record = InventoryHistory(
        inventory_id=history.inventory_id,
        change_type=history.change_type,
        quantity_change=history.quantity_change,
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record

def list_inventory_history(db: Session, inventory_id: int):
    return db.query(InventoryHistory).filter(
        InventoryHistory.inventory_id == inventory_id
    ).order_by(InventoryHistory.timestamp.desc()).all()
