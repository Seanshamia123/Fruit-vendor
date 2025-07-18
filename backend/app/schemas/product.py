from pydantic import BaseModel
from typing import Optional

class ProductBase(BaseModel):
    name: str
    unit: str
    variation: Optional[str] = None
    type: str  # "quick-sell" or "manual"

class ProductCreate(ProductBase):
    pass

class ProductOut(ProductBase):
    id: int
    is_active: bool

    class Config:
        orm_mode = True
