from pydantic import BaseModel, Field
from typing import Optional

class ProductBase(BaseModel):
    name: str = Field(..., example="Apples")
    unit: str = Field(..., example="kg")
    variation: Optional[str] = Field(None, example="Large")
    sale_type: str

class ProductCreate(ProductBase):
    pass

class ProductOut(ProductBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True
