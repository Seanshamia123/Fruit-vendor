from pydantic import BaseModel
from typing import Optional, Dict, List

class VendorPreferenceBase(BaseModel):
    # Display preferences
    dashboard_metrics: Optional[Dict] = None
    color_theme: Optional[str] = "light"
    display_mode: Optional[str] = "charts"  # charts/text/table
    display_options: Optional[Dict] = None
    language: Optional[str] = "en"  # sw/en

    # Alert settings
    alert_low_stock: Optional[bool] = True
    alert_daily_summary: Optional[bool] = True
    alert_rewards: Optional[bool] = False
    alert_spoilage: Optional[bool] = True

    # Pricing settings
    pricing_margin: Optional[int] = 25
    pricing_quick_pricing: Optional[bool] = True
    pricing_auto_suggest: Optional[bool] = False

    # Quick sale products
    quick_sale_products: Optional[List[str]] = None

    # Loyalty/rewards
    loyalty_enabled: Optional[bool] = True

    # Onboarding data
    business_type: Optional[str] = None
    products_of_interest: Optional[List[str]] = None
    challenges: Optional[List[str]] = None
    goals: Optional[List[str]] = None

class VendorPreferenceCreate(VendorPreferenceBase):
    vendor_id: int

class VendorPreferenceUpdate(VendorPreferenceBase):
    pass

class VendorPreferenceOut(VendorPreferenceBase):
    id: int
    vendor_id: int

    class Config:
        from_attributes = True
