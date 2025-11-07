from sqlalchemy.orm import Session
from app.models.vendor_preference import VendorPreference
from app.schemas.vendor_preference import VendorPreferenceCreate, VendorPreferenceUpdate

def create_vendor_preference(db: Session, vendor_id: int, pref: VendorPreferenceUpdate):
    db_pref = VendorPreference(
        vendor_id=vendor_id,
        dashboard_metrics=pref.dashboard_metrics,
        color_theme=pref.color_theme,
        display_options=pref.display_options,
    )
    db.add(db_pref)
    db.commit()
    db.refresh(db_pref)
    return db_pref

def get_vendor_preference(db: Session, vendor_id: int):
    return db.query(VendorPreference).filter(VendorPreference.vendor_id == vendor_id).first()

def update_vendor_preference(db: Session, vendor_id: int, updates: VendorPreferenceUpdate):
    db_pref = db.query(VendorPreference).filter(VendorPreference.vendor_id == vendor_id).first()
    if not db_pref:
        return None
    for field, value in updates.dict(exclude_unset=True).items():
        setattr(db_pref, field, value)
    db.commit()
    db.refresh(db_pref)
    return db_pref

def delete_vendor_preference(db: Session, vendor_id: int):
    db_pref = db.query(VendorPreference).filter(VendorPreference.vendor_id == vendor_id).first()
    if not db_pref:
        return None
    db.delete(db_pref)
    db.commit()
    return True
