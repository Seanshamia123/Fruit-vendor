from pydantic import BaseModel
from typing import Optional

class InventoryBase(BaseModel):
    product_id: int
    quantity: float

class InventoryCreate(InventoryBase):
    pass

class InventoryOut(InventoryBase):
    id: int

    class Config:
        from_attributes = True
