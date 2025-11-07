from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class SpoilageEntryBase(BaseModel):
    product_id: int
    quantity: float
    reason: Optional[str] = None


class SpoilageEntryCreate(SpoilageEntryBase):
    pass


class SpoilageEntryUpdate(BaseModel):
    quantity: Optional[float] = None
    reason: Optional[str] = None


class SpoilageEntryOut(SpoilageEntryBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True
