from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class VendorBase(BaseModel):
    name: str
    email: EmailStr
    contact: str
    location: Optional[str] = None


class VendorCreate(VendorBase):
    password: str  # plaintext during creation


class VendorUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    contact: Optional[str] = None
    location: Optional[str] = None
    password: Optional[str] = None


class VendorOut(VendorBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
