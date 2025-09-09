# migrate.py
from app.database import Base, engine
from app.models import vendor, product, inventory, sale, purchase
from app.models import vendor_preference, cart, cart_item, payment
from app.models import inventory_history, product_pricing, bonus_rule, spoilage_entry

# Create all tables
Base.metadata.create_all(bind=engine)

print("All tables created successfully!")
