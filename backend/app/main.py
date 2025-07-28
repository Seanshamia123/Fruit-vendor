# backend/app/main.py
from fastapi import FastAPI
from app.database import Base, engine
from app.models.vendor import Vendor
from app.routes.product import router as product_router
from app.routes import auth
from app.routes.purchase import router as purchase_router

# ensures that the database tables are created
Base.metadata.create_all(bind=engine)

app = FastAPI()
app.include_router(purchase_router)


app.include_router(product_router)
app.include_router(auth.router)
app.include_router(product_router)

# TEMP — Create all tables
Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"msg": "API Live"}
