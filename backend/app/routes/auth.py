from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from datetime import timedelta
import os
from dotenv import load_dotenv

from app.database import SessionLocal
from app.models.vendor import Vendor
from app.schemas.vendor import VendorCreate, VendorOut
from app.core.security import get_password_hash, create_access_token

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

router = APIRouter(prefix="/auth", tags=["Auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", response_model=VendorOut)
def register_vendor(vendor: VendorCreate, db: Session = Depends(get_db)):
    existing = db.query(Vendor).filter(Vendor.email == vendor.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = get_password_hash(vendor.password)
    new_vendor = Vendor(
        name=vendor.name,
        email=vendor.email,
        contact=vendor.contact,
        password_hash=hashed_pw
    )
    db.add(new_vendor)
    db.commit()
    db.refresh(new_vendor)
    return new_vendor

# Add this for token-based vendor authentication
def get_current_vendor(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Vendor:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        vendor_id: int = payload.get("sub")
        if vendor_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if vendor is None:
        raise credentials_exception
    return vendor
