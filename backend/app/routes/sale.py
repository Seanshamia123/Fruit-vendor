# backend/app/routes/sale.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from app.schemas.sale import SaleCreate, SaleOut, SaleUpdate
from app.services import sale as sale_service
from app.dependencies import get_db
from app.routes.auth import get_current_vendor

router = APIRouter(prefix="/sales", tags=["Sales"])

# New Pydantic models for sale completion with cart
class SaleLineInput(BaseModel):
    itemId: str
    quantity: int
    unitPrice: float
    subtotal: float
    discountAmount: float = 0
    discountType: Optional[str] = None
    appliedRuleId: Optional[int] = None

class CompleteSaleRequest(BaseModel):
    lines: List[SaleLineInput]
    method: str  # 'cash', 'mpesa', 'card'
    totalDiscount: float = 0
    finalTotal: float
    referenceNo: Optional[str] = None
    phoneNumber: Optional[str] = None
    mpesaCode: Optional[str] = None
    cartId: Optional[str] = None

class CompleteSaleResponse(BaseModel):
    success: bool
    message: str
    totalSales: int
    totalDiscount: float
    finalTotal: float

@router.post("/", response_model=SaleOut)
def create_sale(
    sale: SaleCreate,
    db: Session = Depends(get_db),
    current_vendor=Depends(get_current_vendor)
):
    """Create a single sale (legacy endpoint)"""
    return sale_service.create_sale(db, vendor_id=current_vendor.id, sale=sale)


@router.post("/complete", response_model=CompleteSaleResponse)
def complete_sale(
    request: CompleteSaleRequest,
    db: Session = Depends(get_db),
    current_vendor=Depends(get_current_vendor)
):
    """
    Complete a full sale with multiple line items and reward calculations.
    This is called from the frontend checkout process.
    """
    try:
        result = sale_service.complete_sale_with_rewards(
            db=db,
            vendor_id=current_vendor.id,
            lines=request.lines,
            method=request.method,
            total_discount=request.totalDiscount,
            final_total=request.finalTotal,
            reference_no=request.referenceNo,
            phone_number=request.phoneNumber,
            mpesa_code=request.mpesaCode,
            cart_id=request.cartId,
        )
        
        return CompleteSaleResponse(
            success=True,
            message="Sale completed successfully",
            totalSales=len(request.lines),
            totalDiscount=request.totalDiscount,
            finalTotal=request.finalTotal,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=List[SaleOut])
def get_sales(
    db: Session = Depends(get_db),
    current_vendor=Depends(get_current_vendor)
):
    """Get all sales for the vendor"""
    return sale_service.get_sales_by_vendor(db, vendor_id=current_vendor.id)


@router.get("/{sale_id}", response_model=SaleOut)
def get_sale(sale_id: int, db: Session = Depends(get_db)):
    """Get a specific sale by ID"""
    db_sale = sale_service.get_sale(db, sale_id)
    if not db_sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    return db_sale


@router.put("/{sale_id}", response_model=SaleOut)
def update_sale(sale_id: int, sale_update: SaleUpdate, db: Session = Depends(get_db)):
    """Update a sale"""
    updated = sale_service.update_sale(db, sale_id, sale_update)
    if not updated:
        raise HTTPException(status_code=404, detail="Sale not found")
    return updated


@router.delete("/{sale_id}", response_model=dict)
def delete_sale(sale_id: int, db: Session = Depends(get_db)):
    """Delete a sale"""
    deleted = sale_service.delete_sale(db, sale_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Sale not found")
    return {"ok": True}