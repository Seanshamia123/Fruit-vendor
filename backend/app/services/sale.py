from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.sale import Sale
from app.schemas.sale import SaleCreate, SaleUpdate


def create_sale(db: Session, vendor_id: int, sale: SaleCreate) -> Sale:
    db_sale = Sale(
        vendor_id=vendor_id,
        product_id=sale.product_id,
        quantity=sale.quantity,
        unit_price=sale.unit_price,
        total_price=sale.total_price,
        reference_no=sale.reference_no,
        payment_type=sale.payment_type,
        cart_id=sale.cart_id,
    )
    db.add(db_sale)
    db.commit()
    db.refresh(db_sale)
    return db_sale


def get_sales_by_vendor(db: Session, vendor_id: int) -> List[Sale]:
    return db.query(Sale).filter(Sale.vendor_id == vendor_id).all()


def get_sale(db: Session, sale_id: int) -> Optional[Sale]:
    return db.query(Sale).filter(Sale.id == sale_id).first()


def update_sale(db: Session, sale_id: int, sale_update: SaleUpdate) -> Optional[Sale]:
    db_sale = get_sale(db, sale_id)
    if not db_sale:
        return None
    update_data = sale_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_sale, key, value)
    db.commit()
    db.refresh(db_sale)
    return db_sale


def delete_sale(db: Session, sale_id: int) -> bool:
    db_sale = get_sale(db, sale_id)
    if not db_sale:
        return False
    db.delete(db_sale)
    db.commit()
    return True
