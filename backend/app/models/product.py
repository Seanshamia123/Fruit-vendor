# backend/app/models/product.py
from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)

    name = Column(String(255), nullable=False)
    unit = Column(String(50), nullable=False)          # e.g., kg, piece, batch
    variation = Column(String(50), nullable=True)      # e.g., size, color
    sale_type = Column(String(50), nullable=False)     # quick-sell or manual
    is_active = Column(Boolean, default=True)

    # relationships
    vendor = relationship("Vendor", back_populates="products")
    sales = relationship("Sale", back_populates="product", cascade="all, delete-orphan")
    purchases = relationship("Purchase", back_populates="product", cascade="all, delete-orphan")
    inventories = relationship("Inventory", back_populates="product", cascade="all, delete-orphan")
    mpesa_transactions = relationship("MpesaTransaction", back_populates="product", cascade="all, delete-orphan")
    spoilage_entries = relationship("SpoilageEntry", back_populates="product", cascade="all, delete-orphan")

    pricings = relationship(
        "ProductPricing",
        back_populates="product",
        cascade="all, delete-orphan"
    )

    bonus_rules = relationship(
        "BonusRule",
        back_populates="product",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Product(name={self.name}, vendor_id={self.vendor_id})>"
