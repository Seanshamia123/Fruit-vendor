from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class SpoilageEntry(Base):
    __tablename__ = "spoilage_entries"

    id = Column(Integer, primary_key=True, index=True)
    inventory_id = Column(Integer, ForeignKey("inventories.id"), nullable=False)
    quantity_spoiled = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    converted_to = Column(String(50), nullable=True)  # discount / giveaway

    inventory = relationship("Inventory", back_populates="spoilage_entries")
