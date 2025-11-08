from sqlalchemy import Column, Integer, Float, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class BonusRule(Base):
    __tablename__ = "bonus_rules"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    rule_type = Column(String(50), nullable=False)      # e.g., "buy_x_get_y", "discount"
    threshold_qty = Column(Float, nullable=False)
    bonus_qty = Column(Float, nullable=True)
    bonus_discount = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    product = relationship("Product", back_populates="bonus_rules")
