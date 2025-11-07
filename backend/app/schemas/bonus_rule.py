from pydantic import BaseModel
from typing import Optional

class BonusRuleBase(BaseModel):
    product_id: int
    rule_type: str
    threshold_qty: float
    bonus_qty: Optional[float] = None
    bonus_discount: Optional[float] = None

class BonusRuleCreate(BonusRuleBase):
    pass

class BonusRuleUpdate(BaseModel):
    rule_type: Optional[str] = None
    threshold_qty: Optional[float] = None
    bonus_qty: Optional[float] = None
    bonus_discount: Optional[float] = None

class BonusRuleOut(BonusRuleBase):
    id: int

    class Config:
        from_attributes = True
