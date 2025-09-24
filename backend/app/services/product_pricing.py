# backend/app/services/product_pricing.py
from sqlalchemy.orm import Session
from app.models.product_pricing import ProductPricing
from app.schemas.product_pricing import ProductPricingCreate

def create_product_pricing(db: Session, pricing: ProductPricingCreate) -> ProductPricing:
    new_pricing = ProductPricing(**pricing.dict())
    db.add(new_pricing)
    db.commit()
    db.refresh(new_pricing)
    return new_pricing

def get_product_pricings(db: Session, product_id: int) -> list[ProductPricing]:
    return db.query(ProductPricing).filter(ProductPricing.product_id == product_id).all()

def get_pricing_by_id(db: Session, pricing_id: int) -> ProductPricing | None:
    return db.query(ProductPricing).filter(ProductPricing.id == pricing_id).first()

def delete_product_pricing(db: Session, pricing_id: int) -> bool:
    pricing = db.query(ProductPricing).filter(ProductPricing.id == pricing_id).first()
    if not pricing:
        return False
    db.delete(pricing)
    db.commit()
    return True
