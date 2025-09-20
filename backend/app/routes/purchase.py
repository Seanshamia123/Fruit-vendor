from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.schemas.purchase import PurchaseCreate, PurchaseOut, PurchaseUpdate
from app.services import purchase as purchase_service
from app.dependencies import get_db
from app.routes.auth import get_current_vendor

router = APIRouter(prefix="/purchases", tags=["Purchases"])


@router.post("/", response_model=PurchaseOut)
def create_purchase(
    purchase: PurchaseCreate,
    db: Session = Depends(get_db),
    current_vendor=Depends(get_current_vendor)
):
    return purchase_service.create_purchase(db, vendor_id=current_vendor.id, purchase=purchase)


@router.get("/", response_model=List[PurchaseOut])
def get_all_purchases(
    db: Session = Depends(get_db),
    current_vendor=Depends(get_current_vendor)
):
    return purchase_service.get_purchases_by_vendor(db, vendor_id=current_vendor.id)


@router.get("/{purchase_id}", response_model=PurchaseOut)
def get_purchase(purchase_id: int, db: Session = Depends(get_db)):
    db_purchase = purchase_service.get_purchase(db, purchase_id)
    if not db_purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")
    return db_purchase


@router.put("/{purchase_id}", response_model=PurchaseOut)
def update_purchase(purchase_id: int, purchase_update: PurchaseUpdate, db: Session = Depends(get_db)):
    updated = purchase_service.update_purchase(db, purchase_id, purchase_update)
    if not updated:
        raise HTTPException(status_code=404, detail="Purchase not found")
    return updated


@router.delete("/{purchase_id}", response_model=dict)
def delete_purchase(purchase_id: int, db: Session = Depends(get_db)):
    deleted = purchase_service.delete_purchase(db, purchase_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Purchase not found")
    return {"ok": True}
