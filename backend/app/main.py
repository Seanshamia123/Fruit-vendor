# backend/app/main.py

from fastapi import FastAPI
from app.database import Base, engine
from app.models.vendor import Vendor
from app.routes.product import router as product_router
from app.routes import auth

app = FastAPI()


app.include_router(product_router)
app.include_router(auth.router)

# TEMP — Create all tables
Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"msg": "API Live"}
