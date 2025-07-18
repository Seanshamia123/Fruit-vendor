# backend/app/main.py

from fastapi import FastAPI
from app.database import Base, engine
from app.models.vendor import Vendor

app = FastAPI()

# TEMP — Create all tables
Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"msg": "API Live"}
