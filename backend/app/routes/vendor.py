from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.dependencies import get_db

from app.schemas.vendor import VendorCreate, VendorUpdate, VendorOut
from app.services import vendor as vendor_service
from app.dependencies import get_db

router = APIRouter(prefix="/vendors", tags=["Vendors"])


@router.post("/", response_model=VendorOut)
def create_vendor(vendor_in: VendorCreate, db: Session = Depends(get_db)):
    existing_vendor = vendor_service.get_vendor_by_email(db, vendor_in.email)
    if existing_vendor:
        raise HTTPException(status_code=400, detail="Email already registered")
    return vendor_service.create_vendor(db, vendor_in)


@router.get("/{vendor_id}", response_model=VendorOut)
def get_vendor(vendor_id: int, db: Session = Depends(get_db)):
    vendor = vendor_service.get_vendor(db, vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return vendor


@router.get("/", response_model=List[VendorOut])
def get_all_vendors(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return vendor_service.get_all_vendors(db, skip, limit)


@router.put("/{vendor_id}", response_model=VendorOut)
def update_vendor(vendor_id: int, vendor_in: VendorUpdate, db: Session = Depends(get_db)):
    updated = vendor_service.update_vendor(db, vendor_id, vendor_in)
    if not updated:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return updated


@router.delete("/{vendor_id}", response_model=VendorOut)
def delete_vendor(vendor_id: int, db: Session = Depends(get_db)):
    deleted = vendor_service.delete_vendor(db, vendor_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return deleted
