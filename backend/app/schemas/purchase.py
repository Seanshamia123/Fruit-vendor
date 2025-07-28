from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PurchaseBase(BaseModel):
    product_id: int
    quantity: float
    unit_cost: float
    total_cost: float
    source: Optional[str] = None

class PurchaseCreate(PurchaseBase):
    pass

class PurchaseOut(PurchaseBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True  # for SQLAlchemy models
