from sqlalchemy import Column, Integer, Float, ForeignKey
from app.database import Base
from sqlalchemy.orm import relationship

class Inventory(Base):
    __tablename__ = "inventories"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)

    quantity = Column(Float, nullable=False)

    product = relationship("Product", backref="inventory_items")
