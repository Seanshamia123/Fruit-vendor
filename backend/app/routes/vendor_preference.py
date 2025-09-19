from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.schemas.vendor_preference import VendorPreferenceCreate, VendorPreferenceUpdate, VendorPreferenceOut
from app.services import vendor_preference_service

router = APIRouter(prefix="/vendor-preferences", tags=["Vendor Preferences"])

@router.post("/", response_model=VendorPreferenceOut)
def create_pref(pref: VendorPreferenceCreate, db: Session = Depends(get_db)):
    return vendor_preference_service.create_vendor_preference(db, pref)

@router.get("/{vendor_id}", response_model=VendorPreferenceOut)
def read_pref(vendor_id: int, db: Session = Depends(get_db)):
    pref = vendor_preference_service.get_vendor_preference(db, vendor_id)
    if not pref:
        raise HTTPException(status_code=404, detail="Preferences not found")
    return pref

@router.put("/{vendor_id}", response_model=VendorPreferenceOut)
def update_pref(vendor_id: int, updates: VendorPreferenceUpdate, db: Session = Depends(get_db)):
    pref = vendor_preference_service.update_vendor_preference(db, vendor_id, updates)
    if not pref:
        raise HTTPException(status_code=404, detail="Preferences not found")
    return pref

@router.delete("/{vendor_id}")
def delete_pref(vendor_id: int, db: Session = Depends(get_db)):
    success = vendor_preference_service.delete_vendor_preference(db, vendor_id)
    if not success:
        raise HTTPException(status_code=404, detail="Preferences not found")
    return {"detail": "Preferences deleted"}
