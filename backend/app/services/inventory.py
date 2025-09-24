# backend/app/services/inventory.py
from sqlalchemy.orm import Session
from app.models.inventory import Inventory
from app.schemas.inventory import InventoryCreate

def add_inventory(db: Session, vendor_id: int, inventory: InventoryCreate) -> Inventory:
    """Add or update inventory for a vendor/product."""
    existing = db.query(Inventory).filter(
        Inventory.vendor_id == vendor_id,
        Inventory.product_id == inventory.product_id
    ).first()

    if existing:
        existing.quantity += inventory.quantity
        db.commit()
        db.refresh(existing)
        return existing

    new_item = Inventory(
        vendor_id=vendor_id,
        product_id=inventory.product_id,
        quantity=inventory.quantity
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

def list_inventory(db: Session, vendor_id: int) -> list[Inventory]:
    """Fetch all inventory for a given vendor."""
    return db.query(Inventory).filter(Inventory.vendor_id == vendor_id).all()

def get_inventory_item(db: Session, vendor_id: int, inventory_id: int) -> Inventory | None:
    """Fetch single inventory item by ID scoped to vendor."""
    return db.query(Inventory).filter(
        Inventory.id == inventory_id,
        Inventory.vendor_id == vendor_id
    ).first()

def delete_inventory_item(db: Session, vendor_id: int, inventory_id: int) -> bool:
    """Delete inventory item if owned by vendor."""
    item = get_inventory_item(db, vendor_id, inventory_id)
    if not item:
        return False
    db.delete(item)
    db.commit()
    return True
