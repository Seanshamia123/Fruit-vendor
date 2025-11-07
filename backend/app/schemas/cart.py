from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CartBase(BaseModel):
    session_id: str
    status: Optional[str] = "active"

class CartCreate(CartBase):
    vendor_id: int

class CartUpdate(BaseModel):
    status: Optional[str] = None

class CartOut(CartBase):
    id: int
    vendor_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
