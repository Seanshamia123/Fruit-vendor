from sqlalchemy import Column, Integer, Float, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=False)
    amount = Column(Float, nullable=False)
    payment_type = Column(String(50), nullable=False)  # Cash / Mpesa
    status = Column(String(50), default="pending")     # pending / completed / failed
    mpesa_receipt = Column(String(64), unique=True, nullable=True)

    sale = relationship("Sale", back_populates="payments")
