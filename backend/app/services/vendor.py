from sqlalchemy.orm import Session
from app.models.vendor import Vendor
from app.schemas.vendor import VendorCreate, VendorUpdate
from app.core.security import get_password_hash


def create_vendor(db: Session, vendor_in: VendorCreate):
    hashed_pw = get_password_hash(vendor_in.password)
    db_vendor = Vendor(
        name=vendor_in.name,
        email=vendor_in.email,
        contact=vendor_in.contact,
        location=vendor_in.location,
        password_hash=hashed_pw,
    )
    db.add(db_vendor)
    db.commit()
    db.refresh(db_vendor)
    return db_vendor


def get_vendor(db: Session, vendor_id: int):
    return db.query(Vendor).filter(Vendor.id == vendor_id).first()


def get_vendor_by_email(db: Session, email: str):
    return db.query(Vendor).filter(Vendor.email == email).first()


def get_all_vendors(db: Session, skip: int = 0, limit: int = 10):
    return db.query(Vendor).offset(skip).limit(limit).all()


def update_vendor(db: Session, vendor_id: int, vendor_update: VendorUpdate):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        return None

    update_data = vendor_update.dict(exclude_unset=True)
    if "password" in update_data:
        update_data["password_hash"] = get_password_hash(update_data.pop("password"))

    for key, value in update_data.items():
        setattr(vendor, key, value)

    db.commit()
    db.refresh(vendor)
    return vendor


def delete_vendor(db: Session, vendor_id: int):
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        return None
    db.delete(vendor)
    db.commit()
    return vendor
