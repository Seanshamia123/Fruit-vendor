# backend/app/schemas/product_pricing.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProductPricingBase(BaseModel):
    product_id: int
    price_type: str
    price: float
    effective_from: Optional[datetime] = None
    effective_to: Optional[datetime] = None

class ProductPricingCreate(ProductPricingBase):
    pass

class ProductPricingOut(ProductPricingBase):
    id: int

    class Config:
        from_attributes = True
