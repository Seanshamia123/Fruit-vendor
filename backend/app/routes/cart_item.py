from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.schemas.cart_item import CartItemCreate, CartItemOut, CartItemUpdate
from app.services import cart_item as cart_item_service

router = APIRouter(prefix="/cart-items", tags=["Cart Items"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=CartItemOut)
def create_cart_item(item: CartItemCreate, db: Session = Depends(get_db)):
    return cart_item_service.create_cart_item(db, item)

@router.get("/{item_id}", response_model=CartItemOut)
def get_cart_item(item_id: int, db: Session = Depends(get_db)):
    return cart_item_service.get_cart_item(db, item_id)

@router.get("/cart/{cart_id}", response_model=list[CartItemOut])
def list_cart_items(cart_id: int, db: Session = Depends(get_db)):
    return cart_item_service.list_cart_items(db, cart_id)

@router.put("/{item_id}", response_model=CartItemOut)
def update_cart_item(item_id: int, item: CartItemUpdate, db: Session = Depends(get_db)):
    return cart_item_service.update_cart_item(db, item_id, item)

@router.delete("/{item_id}")
def delete_cart_item(item_id: int, db: Session = Depends(get_db)):
    return cart_item_service.delete_cart_item(db, item_id)
