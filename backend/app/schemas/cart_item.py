from pydantic import BaseModel
from typing import Optional

class CartItemBase(BaseModel):
    product_id: int
    quantity: float
    unit_price: float
    total_price: float

class CartItemCreate(CartItemBase):
    cart_id: int

class CartItemUpdate(BaseModel):
    quantity: Optional[float] = None
    unit_price: Optional[float] = None
    total_price: Optional[float] = None

class CartItemOut(CartItemBase):
    id: int
    cart_id: int

    class Config:
        from_attributes = True
