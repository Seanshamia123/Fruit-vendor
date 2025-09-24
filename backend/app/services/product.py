# backend/app/services/product.py
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.product import Product
from app.models.vendor import Vendor
from app.schemas.product import ProductCreate

def create_product(db: Session, product_in: ProductCreate, vendor_id: int) -> Product:
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor not found"
        )
    product = Product(
        vendor_id=vendor_id,
        name=product_in.name,
        unit=product_in.unit,
        variation=product_in.variation,
        sale_type=product_in.sale_type,
        is_active=True
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

def get_products_by_vendor(db: Session, vendor_id: int) -> list[Product]:
    return db.query(Product).filter(Product.vendor_id == vendor_id).all()

def get_product(db: Session, product_id: int, vendor_id: int) -> Product:
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.vendor_id == vendor_id
    ).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product

def update_product(db: Session, product_id: int, vendor_id: int, product_in: ProductCreate) -> Product:
    product = get_product(db, product_id, vendor_id)
    product.name = product_in.name
    product.unit = product_in.unit
    product.variation = product_in.variation
    product.sale_type = product_in.sale_type
    db.commit()
    db.refresh(product)
    return product

def toggle_product_status(db: Session, product_id: int, vendor_id: int, active: bool) -> Product:
    product = get_product(db, product_id, vendor_id)
    product.is_active = active
    db.commit()
    db.refresh(product)
    return product

def delete_product(db: Session, product_id: int, vendor_id: int) -> None:
    product = get_product(db, product_id, vendor_id)
    db.delete(product)
    db.commit()
