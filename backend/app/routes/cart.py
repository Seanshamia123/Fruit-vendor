from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.schemas.cart import CartCreate, CartOut, CartUpdate
from app.services import cart as cart_service
from app.routes.auth import get_current_vendor

router = APIRouter(prefix="/carts", tags=["Carts"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=CartOut)
def create_cart(cart: CartCreate, db: Session = Depends(get_db)):
    return cart_service.create_cart(db, cart)

@router.get("/{cart_id}", response_model=CartOut)
def get_cart(cart_id: int, db: Session = Depends(get_db)):
    return cart_service.get_cart(db, cart_id)

@router.get("/", response_model=list[CartOut])
def list_carts(
    db: Session = Depends(get_db),
    current_vendor = Depends(get_current_vendor)
):
    return cart_service.list_carts(db, vendor_id=current_vendor.id)

@router.put("/{cart_id}", response_model=CartOut)
def update_cart(cart_id: int, cart: CartUpdate, db: Session = Depends(get_db)):
    return cart_service.update_cart(db, cart_id, cart)

@router.delete("/{cart_id}")
def delete_cart(cart_id: int, db: Session = Depends(get_db)):
    return cart_service.delete_cart(db, cart_id)
