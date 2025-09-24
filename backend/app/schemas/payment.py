# backend/app/schemas/payment.py
from pydantic import BaseModel
from typing import Optional

class PaymentBase(BaseModel):
    sale_id: int
    amount: float
    payment_type: str
    status: Optional[str] = "pending"
    mpesa_receipt: Optional[str] = None

class PaymentCreate(PaymentBase):
    pass

class PaymentOut(PaymentBase):
    id: int

    class Config:
        from_attributes = True
