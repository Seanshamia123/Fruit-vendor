from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class MpesaTransaction(Base):
    __tablename__ = "mpesa_transactions"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)

    merchant_request_id = Column(String(128), nullable=True)
    checkout_request_id = Column(String(128), index=True, nullable=True)

    amount = Column(Float, nullable=True)
    phone_number = Column(String(20), nullable=True)
    account_reference = Column(String(64), nullable=True)

    response_code = Column(String(50), nullable=True)
    response_description = Column(String(255), nullable=True)

    result_code = Column(Integer, nullable=True)   # from callback
    result_desc = Column(String(255), nullable=True)
    mpesa_receipt = Column(String(64), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # relationships
    vendor = relationship("Vendor", back_populates="mpesa_transactions")
    product = relationship("Product", back_populates="mpesa_transactions")
