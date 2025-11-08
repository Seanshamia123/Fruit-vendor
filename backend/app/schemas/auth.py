from pydantic import BaseModel
from app.schemas.vendor import VendorOut


class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    vendor: VendorOut

    class Config:
        from_attributes = True
