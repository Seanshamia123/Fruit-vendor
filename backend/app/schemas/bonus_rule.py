from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BonusRuleBase(BaseModel):
    rule_name: str
    condition_type: str  # "sales_value", "quantity", "visit_frequency"
    condition_value: float
    bonus_type: str  # "percentage", "fixed", "free_item"
    bonus_value: float
    is_active: bool = True

class BonusRuleCreate(BonusRuleBase):
    pass

class BonusRuleUpdate(BaseModel):
    rule_name: Optional[str] = None
    condition_type: Optional[str] = None
    condition_value: Optional[float] = None
    bonus_type: Optional[str] = None
    bonus_value: Optional[float] = None
    is_active: Optional[bool] = None

class BonusRuleOut(BonusRuleBase):
    id: int
    vendor_id: int
    created_at: datetime

    class Config:
        from_attributes = True
