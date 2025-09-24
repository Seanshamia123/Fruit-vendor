from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.schemas.sale import SaleCreate, SaleOut, SaleUpdate
from app.services import sale as sale_service
from app.dependencies import get_db
from app.routes.auth import get_current_vendor

router = APIRouter(prefix="/sales", tags=["Sales"])


@router.post("/", response_model=SaleOut)
def create_sale(
    sale: SaleCreate,
    db: Session = Depends(get_db),
    current_vendor=Depends(get_current_vendor)
):
    return sale_service.create_sale(db, vendor_id=current_vendor.id, sale=sale)


@router.get("/", response_model=List[SaleOut])
def get_sales(
    db: Session = Depends(get_db),
    current_vendor=Depends(get_current_vendor)
):
    return sale_service.get_sales_by_vendor(db, vendor_id=current_vendor.id)


@router.get("/{sale_id}", response_model=SaleOut)
def get_sale(sale_id: int, db: Session = Depends(get_db)):
    db_sale = sale_service.get_sale(db, sale_id)
    if not db_sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    return db_sale


@router.put("/{sale_id}", response_model=SaleOut)
def update_sale(sale_id: int, sale_update: SaleUpdate, db: Session = Depends(get_db)):
    updated = sale_service.update_sale(db, sale_id, sale_update)
    if not updated:
        raise HTTPException(status_code=404, detail="Sale not found")
    return updated


@router.delete("/{sale_id}", response_model=dict)
def delete_sale(sale_id: int, db: Session = Depends(get_db)):
    deleted = sale_service.delete_sale(db, sale_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Sale not found")
    return {"ok": True}
