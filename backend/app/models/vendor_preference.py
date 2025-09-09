from sqlalchemy import Column, Integer, String, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class VendorPreference(Base):
    __tablename__ = "vendor_preferences"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), unique=True, nullable=False)
    dashboard_metrics = Column(JSON, nullable=True)  # e.g., {"top_selling": true, "sales_trends": true}
    color_theme = Column(String(50), nullable=True)  # light/dark/custom
    display_options = Column(JSON, nullable=True)    # any extra display preferences

    vendor = relationship("Vendor", back_populates="preferences")
