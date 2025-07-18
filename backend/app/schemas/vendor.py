from pydantic import BaseModel, EmailStr

class VendorCreate(BaseModel):
    name: str
    email: EmailStr
    contact: str
    password: str

class VendorOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    contact: str

    class Config:
        orm_mode = True
