from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class BonusRuleBase(BaseModel):
    rule_name: str
    condition_type: str  # "sales_value", "quantity", "visit_frequency"
    condition_value: float
    bonus_type: str  # "percentage", "fixed", "free_item"
    bonus_value: float
    is_active: bool = True

class BonusRuleCreate(BonusRuleBase):
    product_ids: List[int] = Field(default_factory=list)  # NEW: List of product IDs to apply rule to

class BonusRuleUpdate(BaseModel):
    rule_name: Optional[str] = None
    condition_type: Optional[str] = None
    condition_value: Optional[float] = None
    bonus_type: Optional[str] = None
    bonus_value: Optional[float] = None
    is_active: Optional[bool] = None
    product_ids: Optional[List[int]] = None  # NEW: Update which products this applies to

class BonusRuleOut(BonusRuleBase):
    id: int
    vendor_id: int
    product_ids: List[int]  # NEW: Return which products this rule applies to
    created_at: datetime

    class Config:
        from_attributes = True