from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class SaleBase(BaseModel):
    product_id: int
    quantity: float
    unit_price: float
    total_price: float
    reference_no: Optional[str] = None
    payment_type: str = "Cash"
    cart_id: Optional[int] = None


class SaleCreate(SaleBase):
    pass


class SaleUpdate(BaseModel):
    quantity: Optional[float] = None
    unit_price: Optional[float] = None
    total_price: Optional[float] = None
    reference_no: Optional[str] = None
    payment_type: Optional[str] = None
    cart_id: Optional[int] = None


class SaleOut(SaleBase):
    id: int
    timestamp: datetime

    class Config:
        orm_mode = True
