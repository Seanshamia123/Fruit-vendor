from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.cart import Cart
from app.schemas.cart import CartCreate, CartUpdate

def create_cart(db: Session, cart: CartCreate):
    new_cart = Cart(**cart.dict())
    db.add(new_cart)
    db.commit()
    db.refresh(new_cart)
    return new_cart

def get_cart(db: Session, cart_id: int):
    cart = db.query(Cart).filter(Cart.id == cart_id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    return cart

def list_carts(db: Session, vendor_id: int):
    return db.query(Cart).filter(Cart.vendor_id == vendor_id).all()

def update_cart(db: Session, cart_id: int, cart_data: CartUpdate):
    cart = get_cart(db, cart_id)
    for field, value in cart_data.dict(exclude_unset=True).items():
        setattr(cart, field, value)
    db.commit()
    db.refresh(cart)
    return cart

def delete_cart(db: Session, cart_id: int):
    cart = get_cart(db, cart_id)
    db.delete(cart)
    db.commit()
    return {"detail": "Cart deleted"}
