# backend/app/schemas/mpesa.py
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class STKPushRequest(BaseModel):
    phone_number: str = Field(..., description="07..., +2547..., or 2547...")
    amount: int = Field(..., gt=0, description="Integer KES")
    account_reference: str | None = Field(None, max_length=12)
    transaction_desc: str | None = Field("Payment", max_length=13)
    product_id: int | None = None   # NEW


class STKPushResponse(BaseModel):
    MerchantRequestID: str | None = None
    CheckoutRequestID: str | None = None
    ResponseCode: str | None = None
    ResponseDescription: str | None = None


class MpesaHistoryOut(BaseModel):
    # MpesaTransaction fields
    transaction_id: int
    amount: Optional[float]
    phone_number: Optional[str]
    account_reference: Optional[str]
    response_code: Optional[str]
    result_code: Optional[int]
    result_desc: Optional[str]
    mpesa_receipt: Optional[str]
    created_at: datetime

    # Sale fields
    sale_id: Optional[int]
    product_id: Optional[int]
    quantity: Optional[float]
    unit_price: Optional[float]
    total_price: Optional[float]
    sale_timestamp: Optional[datetime]

    class Config:
        from_attributes = True  # ✅ Pydantic v2 replacement for orm_mode
