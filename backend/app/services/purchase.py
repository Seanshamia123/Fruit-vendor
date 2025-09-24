from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.purchase import Purchase
from app.schemas.purchase import PurchaseCreate, PurchaseUpdate


def create_purchase(db: Session, vendor_id: int, purchase: PurchaseCreate) -> Purchase:
    db_purchase = Purchase(
        vendor_id=vendor_id,
        product_id=purchase.product_id,
        quantity=purchase.quantity,
        unit_cost=purchase.unit_cost,
        total_cost=purchase.total_cost,
        source=purchase.source,
    )
    db.add(db_purchase)
    db.commit()
    db.refresh(db_purchase)
    return db_purchase


def get_purchases_by_vendor(db: Session, vendor_id: int) -> List[Purchase]:
    return db.query(Purchase).filter(Purchase.vendor_id == vendor_id).all()


def get_purchase(db: Session, purchase_id: int) -> Optional[Purchase]:
    return db.query(Purchase).filter(Purchase.id == purchase_id).first()


def update_purchase(db: Session, purchase_id: int, purchase_update: PurchaseUpdate) -> Optional[Purchase]:
    db_purchase = get_purchase(db, purchase_id)
    if not db_purchase:
        return None

    update_data = purchase_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_purchase, key, value)

    db.commit()
    db.refresh(db_purchase)
    return db_purchase


def delete_purchase(db: Session, purchase_id: int) -> bool:
    db_purchase = get_purchase(db, purchase_id)
    if not db_purchase:
        return False
    db.delete(db_purchase)
    db.commit()
    return True
