from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from app.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)

    name = Column(String(255), nullable=False)
    unit = Column(String(50), nullable=False)          # e.g., kg, piece, batch
    variation = Column(String(50), nullable=True)      # e.g., size, color
    sale_type = Column(String(50), nullable=False)  # quick-sell or manual
    is_active = Column(Boolean, default=True)

    def __repr__(self):
        return f"<Product(name={self.name}, vendor={self.vendor_id})>"
