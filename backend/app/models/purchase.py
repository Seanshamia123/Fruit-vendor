from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)

    quantity = Column(Float, nullable=False)  # e.g., 70.5
    unit_cost = Column(Float, nullable=False)  # cost per unit
    total_cost = Column(Float, nullable=False)  # derived or entered

    source = Column(String(255), nullable=True)  # optional supplier or location
    timestamp = Column(DateTime, default=datetime.utcnow)

    # relationships
    vendor = relationship("Vendor", back_populates="purchases")
    product = relationship("Product", back_populates="purchases")
