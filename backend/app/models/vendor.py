# backend/app/models/vendor.py

from sqlalchemy import Column, String, Integer
from app.database import Base

class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    contact = Column(String(20))
    password_hash = Column(String(255), nullable=False)
