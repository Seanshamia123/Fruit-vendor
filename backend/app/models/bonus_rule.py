from sqlalchemy import Column, Integer, Float, String, ForeignKey, Boolean, DateTime, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

# Association table for many-to-many relationship
bonus_rule_product = Table(
    'bonus_rule_product',
    Base.metadata,
    Column('bonus_rule_id', Integer, ForeignKey('bonus_rules.id', ondelete='CASCADE'), primary_key=True),
    Column('product_id', Integer, ForeignKey('products.id', ondelete='CASCADE'), primary_key=True)
)

class BonusRule(Base):
    __tablename__ = "bonus_rules"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    rule_name = Column(String(200), nullable=False)
    condition_type = Column(String(50), nullable=False)  # e.g., "sales_value", "quantity", "visit_frequency"
    condition_value = Column(Float, nullable=False)
    bonus_type = Column(String(50), nullable=False)  # e.g., "percentage", "fixed", "free_item"
    bonus_value = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    vendor = relationship("Vendor", back_populates="bonus_rules")
    products = relationship(
        "Product",
        secondary=bonus_rule_product,
        backref="bonus_rules",
        cascade="all, delete"
    )