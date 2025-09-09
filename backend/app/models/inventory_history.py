from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class InventoryHistory(Base):
    __tablename__ = "inventory_history"

    id = Column(Integer, primary_key=True, index=True)
    inventory_id = Column(Integer, ForeignKey("inventories.id"), nullable=False)
    change_type = Column(String(50), nullable=False)  # purchase / sale / spoilage / manual
    quantity_change = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    inventory = relationship("Inventory")
