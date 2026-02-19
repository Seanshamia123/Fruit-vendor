from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    
    # Reward tracking fields
    original_price = Column(Float, nullable=True)
    discount_amount = Column(Float, default=0.0)
    discount_type = Column(String(50), nullable=True)  # ← Changed from String() to String(50)
    applied_bonus_rule_id = Column(Integer, ForeignKey("bonus_rules.id"), nullable=True)
    
    total_price = Column(Float, nullable=False)
    reference_no = Column(String, nullable=True)
    payment_type = Column(String, nullable=True)
    cart_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    vendor = relationship("Vendor", back_populates="sales")
    product = relationship("Product", back_populates="sales")
    applied_bonus_rule = relationship("BonusRule", foreign_keys=[applied_bonus_rule_id])
    payments = relationship("Payment", back_populates="sale", cascade="all, delete-orphan")