from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductOut
from app.routes.auth import get_current_vendor
from app.dependencies.db import get_db

router = APIRouter(prefix="/products", tags=["Products"])

@router.post("/", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_vendor=Depends(get_current_vendor)
):
    new_product = Product(
        vendor_id=current_vendor.id,
        name=product.name,
        unit=product.unit,
        variation=product.variation,
        sale_type=product.sale_type
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@router.get("/", response_model=list[ProductOut])
def get_products(
    db: Session = Depends(get_db),
    current_vendor=Depends(get_current_vendor)
):
    return db.query(Product).filter(Product.vendor_id == current_vendor.id).all()

@router.get("/{product_id}", response_model=ProductOut)
def get_product_by_id(
    product_id: int,
    db: Session = Depends(get_db),
    current_vendor=Depends(get_current_vendor)
):
    product = db.query(Product).filter(Product.id == product_id, Product.vendor_id == current_vendor.id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.put("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    updated: ProductCreate,
    db: Session = Depends(get_db),
    current_vendor=Depends(get_current_vendor)
):
    product = db.query(Product).filter(Product.id == product_id, Product.vendor_id == current_vendor.id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.name = updated.name
    product.unit = updated.unit
    product.variation = updated.variation
    product.sale_type = updated.sale_type

    db.commit()
    db.refresh(product)
    return product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_vendor=Depends(get_current_vendor)
):
    product = db.query(Product).filter(Product.id == product_id, Product.vendor_id == current_vendor.id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return
