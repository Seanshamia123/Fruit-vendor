from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.cart_item import CartItem
from app.schemas.cart_item import CartItemCreate, CartItemUpdate

def create_cart_item(db: Session, item: CartItemCreate):
    new_item = CartItem(**item.dict())
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

def get_cart_item(db: Session, item_id: int):
    item = db.query(CartItem).filter(CartItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    return item

def list_cart_items(db: Session, cart_id: int):
    return db.query(CartItem).filter(CartItem.cart_id == cart_id).all()

def update_cart_item(db: Session, item_id: int, item_data: CartItemUpdate):
    item = get_cart_item(db, item_id)
    for field, value in item_data.dict(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item

def delete_cart_item(db: Session, item_id: int):
    item = get_cart_item(db, item_id)
    db.delete(item)
    db.commit()
    return {"detail": "Cart item deleted"}
