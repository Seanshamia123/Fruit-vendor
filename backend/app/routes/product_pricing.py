# backend/app/routes/product_pricing.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.schemas.product_pricing import ProductPricingCreate, ProductPricingOut
from app.services import product_pricing as pricing_service
from app.routes.auth import get_current_vendor
from app.models.product import Product

router = APIRouter(prefix="/product-pricings", tags=["Product Pricing"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=ProductPricingOut)
def create_product_pricing(
    pricing: ProductPricingCreate,
    db: Session = Depends(get_db),
    current_vendor = Depends(get_current_vendor)
):
    # ensure vendor owns product
    product = db.query(Product).filter(
        Product.id == pricing.product_id,
        Product.vendor_id == current_vendor.id
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found or not yours")

    return pricing_service.create_product_pricing(db, pricing)

@router.get("/{product_id}", response_model=list[ProductPricingOut])
def get_pricings_for_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_vendor = Depends(get_current_vendor)
):
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.vendor_id == current_vendor.id
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found or not yours")

    return pricing_service.get_product_pricings(db, product_id)

@router.delete("/{pricing_id}")
def delete_product_pricing(
    pricing_id: int,
    db: Session = Depends(get_db),
    current_vendor = Depends(get_current_vendor)
):
    pricing = pricing_service.get_pricing_by_id(db, pricing_id)
    if not pricing:
        raise HTTPException(status_code=404, detail="Pricing not found")

    # vendor must own product
    if pricing.product.vendor_id != current_vendor.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    success = pricing_service.delete_product_pricing(db, pricing_id)
    if not success:
        raise HTTPException(status_code=404, detail="Failed to delete")
    return {"detail": "Deleted successfully"}
