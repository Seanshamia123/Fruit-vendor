from pydantic import BaseModel
from typing import Optional, Dict

class VendorPreferenceBase(BaseModel):
    dashboard_metrics: Optional[Dict] = None
    color_theme: Optional[str] = None
    display_options: Optional[Dict] = None

class VendorPreferenceCreate(VendorPreferenceBase):
    vendor_id: int

class VendorPreferenceUpdate(VendorPreferenceBase):
    pass

class VendorPreferenceOut(VendorPreferenceBase):
    id: int
    vendor_id: int

    class Config:
        orm_mode = True
