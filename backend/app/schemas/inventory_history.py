from pydantic import BaseModel
from datetime import datetime

class InventoryHistoryBase(BaseModel):
    inventory_id: int
    change_type: str
    quantity_change: float

class InventoryHistoryCreate(InventoryHistoryBase):
    pass

class InventoryHistoryOut(InventoryHistoryBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True
