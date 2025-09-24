from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class SpoilageEntryBase(BaseModel):
    inventory_id: int
    quantity_spoiled: float
    converted_to: Optional[str] = None  # discount / giveaway


class SpoilageEntryCreate(SpoilageEntryBase):
    pass


class SpoilageEntryUpdate(BaseModel):
    quantity_spoiled: Optional[float] = None
    converted_to: Optional[str] = None


class SpoilageEntryOut(SpoilageEntryBase):
    id: int
    timestamp: datetime

    class Config:
        orm_mode = True
