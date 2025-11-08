from sqlalchemy import Column, Integer, String, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class VendorPreference(Base):
    __tablename__ = "vendor_preferences"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), unique=True, nullable=False)

    # Display preferences
    dashboard_metrics = Column(JSON, nullable=True)  # e.g., {"top_selling": true, "sales_trends": true}
    color_theme = Column(String(50), nullable=True, default="light")  # light/dark/custom
    display_mode = Column(String(50), nullable=True, default="charts")  # charts/text/table
    display_options = Column(JSON, nullable=True)    # any extra display preferences
    language = Column(String(10), nullable=True, default="en")  # sw/en

    # Alert settings
    alert_low_stock = Column(Boolean, nullable=True, default=True)
    alert_daily_summary = Column(Boolean, nullable=True, default=True)
    alert_rewards = Column(Boolean, nullable=True, default=False)
    alert_spoilage = Column(Boolean, nullable=True, default=True)

    # Pricing settings
    pricing_margin = Column(Integer, nullable=True, default=25)  # default margin percentage
    pricing_quick_pricing = Column(Boolean, nullable=True, default=True)
    pricing_auto_suggest = Column(Boolean, nullable=True, default=False)

    # Quick sale products
    quick_sale_products = Column(JSON, nullable=True)  # list of product names/IDs

    # Loyalty/rewards
    loyalty_enabled = Column(Boolean, nullable=True, default=True)

    # Onboarding data
    business_type = Column(String(100), nullable=True)  # retail/market/grocery/salon/home/other
    products_of_interest = Column(JSON, nullable=True)  # list of product categories selected
    challenges = Column(JSON, nullable=True)  # list of challenges selected during onboarding
    goals = Column(JSON, nullable=True)  # list of goals selected during onboarding

    vendor = relationship("Vendor", back_populates="preferences")
