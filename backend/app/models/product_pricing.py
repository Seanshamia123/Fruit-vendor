from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class ProductPricing(Base):
    __tablename__ = "product_pricing"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    price_type = Column(String(50), nullable=False)   # unit / batch / time-based
    price = Column(Float, nullable=False)
    effective_from = Column(DateTime, nullable=False, default=datetime.utcnow)
    effective_to = Column(DateTime, nullable=True)

    product = relationship("Product", back_populates="pricings")
