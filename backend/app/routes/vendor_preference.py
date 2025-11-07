from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.schemas.vendor_preference import VendorPreferenceCreate, VendorPreferenceUpdate, VendorPreferenceOut
from app.services import vendor_preference
from app.routes.auth import get_current_vendor

router = APIRouter(prefix="/vendor-preferences", tags=["Vendor Preferences"])

@router.post("/", response_model=VendorPreferenceOut)
def create_pref(
    pref: VendorPreferenceUpdate,
    db: Session = Depends(get_db),
    current_vendor = Depends(get_current_vendor)
):
    # Create preferences for the authenticated vendor
    return vendor_preference.create_vendor_preference(db, current_vendor.id, pref)

@router.get("/", response_model=VendorPreferenceOut)
def read_pref(
    db: Session = Depends(get_db),
    current_vendor = Depends(get_current_vendor)
):
    pref = vendor_preference.get_vendor_preference(db, current_vendor.id)
    if not pref:
        # Return default preferences if none exist
        return vendor_preference.create_vendor_preference(db, current_vendor.id, VendorPreferenceUpdate())
    return pref

@router.put("/", response_model=VendorPreferenceOut)
def update_pref(
    updates: VendorPreferenceUpdate,
    db: Session = Depends(get_db),
    current_vendor = Depends(get_current_vendor)
):
    pref = vendor_preference.update_vendor_preference(db, current_vendor.id, updates)
    if not pref:
        # Create if doesn't exist
        return vendor_preference.create_vendor_preference(db, current_vendor.id, updates)
    return pref
