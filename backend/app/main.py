# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routes import auth, sale, mpesa
from app.routes.product import router as product_router
from app.routes.purchase import router as purchase_router
from app.routes.inventory import router as inventory_router
from dotenv import load_dotenv
from app.routes.vendor import router as vendor_router  # NEW
from app.routes import vendor_preference
from app.routes import spoilage_entry as spoilage_entry_router
from app.routes import sale as sale_router
from app.routes import product_pricing
from app.routes import payment
from app.routes import inventory_history
from app.routes import cart
from app.routes import cart_item
from app.routes import bonus_rule


# --- IMPORTANT: force import all models here ---
from app.models import product, sale as sale_model, vendor, purchase, inventory, mpesa_transaction
# This ensures SQLAlchemy registers all models (Product, Sale, etc.) before metadata.create_all

load_dotenv()  # loads .env into process env

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:5174","https://fruit-vendor-m40n.onrender.com","https://fruit-vendor.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(product_router)
app.include_router(purchase_router)
app.include_router(inventory_router)
app.include_router(mpesa.router)
app.include_router(vendor_router)   
app.include_router(vendor_preference.router)
app.include_router(spoilage_entry_router.router)
app.include_router(sale_router.router)
app.include_router(product_pricing.router)
app.include_router(payment.router)
app.include_router(inventory_history.router)
app.include_router(cart.router)
app.include_router(cart_item.router)
app.include_router(bonus_rule.router)


# DB - run after all models are imported
Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"msg": "API Live"}

@app.get("/ping")
def ping():
    return {"ok": True}

@app.get("/envcheck")
def envcheck():
    import os
    return {
        "shortcode": os.getenv("MPESA_SHORTCODE"),
        "has_passkey": bool(os.getenv("MPESA_PASSKEY")),
        "callback_set": bool(os.getenv("MPESA_CALLBACK_URL")),
        "has_keys": bool(os.getenv("MPESA_CONSUMER_KEY") and os.getenv("MPESA_CONSUMER_SECRET")),
    }