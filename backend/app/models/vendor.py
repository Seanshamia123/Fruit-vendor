# backend/app/models/vendor.py
from sqlalchemy import Column, String, Integer
from sqlalchemy.orm import relationship
from app.database import Base

class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    contact = Column(String(20))
    password_hash = Column(String(255), nullable=False)

    # relationships
    products = relationship("Product", back_populates="vendor", cascade="all, delete-orphan")
    purchases = relationship("Purchase", back_populates="vendor", cascade="all, delete-orphan")
    sales = relationship("Sale", back_populates="vendor", cascade="all, delete-orphan")
    inventories = relationship("Inventory", back_populates="vendor", cascade="all, delete-orphan")
    mpesa_transactions = relationship("MpesaTransaction", back_populates="vendor", cascade="all, delete-orphan")
