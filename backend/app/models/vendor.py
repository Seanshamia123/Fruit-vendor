# backend/app/models/vendor.py
from sqlalchemy import Column, String, Integer, DateTime, Boolean
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    contact = Column(String(20))
    location = Column(String(255), nullable=True)
    password_hash = Column(String(255), nullable=False)
    onboarding_completed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # relationships
    products = relationship("Product", back_populates="vendor", cascade="all, delete-orphan")
    purchases = relationship("Purchase", back_populates="vendor", cascade="all, delete-orphan")
    sales = relationship("Sale", back_populates="vendor", cascade="all, delete-orphan")
    inventories = relationship("Inventory", back_populates="vendor", cascade="all, delete-orphan")
    mpesa_transactions = relationship("MpesaTransaction", back_populates="vendor", cascade="all, delete-orphan")
    spoilage_entries = relationship("SpoilageEntry", back_populates="vendor", cascade="all, delete-orphan")
    carts = relationship("Cart", back_populates="vendor", cascade="all, delete-orphan")
    bonus_rules = relationship("BonusRule", back_populates="vendor", cascade="all, delete-orphan")

    preferences = relationship(
        "VendorPreference",
        back_populates="vendor",
        cascade="all, delete-orphan",
        uselist=False  # one preference set per vendor
    )
