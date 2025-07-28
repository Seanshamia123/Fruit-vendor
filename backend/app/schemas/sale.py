from pydantic import BaseModel
from datetime import datetime

class SaleBase(BaseModel):
    product_id: int
    quantity: float
    unit_price: float
    total_price: float

class SaleCreate(SaleBase):
    pass

class SaleOut(SaleBase):
    id: int
    timestamp: datetime

    class Config:
        orm_mode = True
