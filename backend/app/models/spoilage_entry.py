from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class SpoilageEntry(Base):
    __tablename__ = "spoilage_entries"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Float, nullable=False)
    reason = Column(String(255), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    # relationships
    vendor = relationship("Vendor", back_populates="spoilage_entries")
    product = relationship("Product", back_populates="spoilage_entries")
