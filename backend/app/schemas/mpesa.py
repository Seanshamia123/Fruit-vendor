# backend/app/schemas/mpesa.py
from pydantic import BaseModel

class STKPushRequest(BaseModel):
    phone_number: str   # e.g. "2547XXXXXXXX"
    amount: float
    account_reference: str | None = None
    transaction_desc: str | None = "Payment"

class STKPushResponse(BaseModel):
    MerchantRequestID: str | None = None
    CheckoutRequestID: str | None = None
    ResponseCode: str | None = None
    ResponseDescription: str | None = None
