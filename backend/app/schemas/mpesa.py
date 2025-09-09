# backend/app/schemas/mpesa.py
from pydantic import BaseModel, Field

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
