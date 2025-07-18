from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.product import ProductCreate, ProductOut
from app.models.product import Product
from app.database import SessionLocal
from app.routes.auth import get_current_vendor  # token-based vendor extractor

router = APIRouter(prefix="/products", tags=["Products"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=ProductOut)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_vendor: dict = Depends(get_current_vendor)
):
    new_product = Product(
        vendor_id=current_vendor["id"],
        name=product.name,
        unit=product.unit,
        variation=product.variation,
        type=product.type
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@router.get("/", response_model=list[ProductOut])
def get_products(
    db: Session = Depends(get_db),
    current_vendor: dict = Depends(get_current_vendor)
):
    return db.query(Product).filter(Product.vendor_id == current_vendor["id"]).all()
