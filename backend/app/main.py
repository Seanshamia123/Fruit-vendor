# backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine

# Import routers
from app.routes import auth
from app.routes import sale
from app.routes import mpesa
from app.routes import mpesa_auth
from app.routes.product import router as product_router
from app.routes.purchase import router as purchase_router
from app.routes.inventory import router as inventory_router


# Init app
app = FastAPI()

# CORS (allow frontend access)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(product_router)
app.include_router(purchase_router)
app.include_router(inventory_router)
app.include_router(sale.router)
app.include_router(mpesa_auth.router)
app.include_router(mpesa.router)

# Create all DB tables
Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"msg": "API Live"}
