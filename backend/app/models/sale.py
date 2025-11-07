# backend/app/models/sale.py
from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime, String
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)

    quantity = Column(Float, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)

    reference_no = Column(String(64), unique=True, index=True, nullable=True)  
    # ↑ stores MpesaReceiptNumber or internal reference
    #   unique=True → no duplicates ever
    #   index=True → fast lookups during callback reconciliation

    timestamp = Column(DateTime, default=datetime.utcnow)

    payment_type = Column(String(50), nullable=False, default="Cash")  # Cash / Mpesa / Other
    cart_id = Column(Integer, ForeignKey("carts.id"), nullable=True)

    # Relationships
    vendor = relationship("Vendor", back_populates="sales")
    product = relationship("Product", back_populates="sales")
    payments = relationship("Payment", back_populates="sale", cascade="all, delete-orphan")
