# backend/app/routes/mpesa.py
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session, joinedload
from app.database import SessionLocal
from app.services import mpesa as mpesa_service
from app.schemas.mpesa import STKPushRequest, STKPushResponse, MpesaHistoryOut
from app.routes.auth import get_current_vendor
from app.models.mpesa_transaction import MpesaTransaction
from app.models.sale import Sale
from app.models.inventory import Inventory
from app.models.product import Product
from app.models.vendor import Vendor
from datetime import datetime
from typing import List

router = APIRouter(prefix="/mpesa", tags=["mpesa"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -----------------------
# Initiate STK Push
# -----------------------
@router.post("/stk-push", response_model=STKPushResponse)
def initiate_stk_push(
    body: STKPushRequest,
    db: Session = Depends(get_db),
    current_vendor=Depends(get_current_vendor),
):
    """
    Vendor initiates STK push to customer's phone.
    Saves initial request in DB (with product_id).
    """
    if not body.product_id:
        raise HTTPException(status_code=400, detail="Product ID is required for M-Pesa payment.")

    account_ref = body.account_reference or f"V{current_vendor.id}"

    try:
        resp = mpesa_service.stk_push(
            phone_number=body.phone_number,
            amount=body.amount,
            account_reference=account_ref,
            transaction_desc=body.transaction_desc,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    tr = MpesaTransaction(
        vendor_id=current_vendor.id,
        product_id=body.product_id,
        amount=body.amount,
        phone_number=body.phone_number,
        account_reference=account_ref,
        response_code=resp.get("ResponseCode"),
        response_description=resp.get("ResponseDescription"),
        merchant_request_id=resp.get("MerchantRequestID"),
        checkout_request_id=resp.get("CheckoutRequestID"),
    )
    db.add(tr)
    db.commit()
    db.refresh(tr)

    return {
        "MerchantRequestID": resp.get("MerchantRequestID"),
        "CheckoutRequestID": resp.get("CheckoutRequestID"),
        "ResponseCode": resp.get("ResponseCode"),
        "ResponseDescription": resp.get("ResponseDescription"),
    }


# -----------------------
# Callback from Daraja
# -----------------------
@router.post("/callback")
async def mpesa_callback(request: Request, db: Session = Depends(get_db)):
    """
    Safaricom Daraja posts transaction result here.
    Updates MpesaTransaction.
    If payment successful (ResultCode == 0), creates a Sale + reduces inventory.
    """
    data = await request.json()
    print("CALLBACK RAW >>>", data)

    try:
        stk = data.get("Body", {}).get("stkCallback", {})
        merchant_request_id = stk.get("MerchantRequestID")
        checkout_request_id = stk.get("CheckoutRequestID")
        result_code = stk.get("ResultCode")
        result_desc = stk.get("ResultDesc")

        tx = None
        if checkout_request_id:
            tx = (
                db.query(MpesaTransaction)
                .filter(MpesaTransaction.checkout_request_id == checkout_request_id)
                .first()
            )

        # Extract metadata
        amount = None
        mpesa_receipt = None
        phone = None
        meta = stk.get("CallbackMetadata", {}).get("Item", [])
        for item in meta:
            name = item.get("Name")
            value = item.get("Value")
            if name == "Amount":
                amount = value
            elif name == "MpesaReceiptNumber":
                mpesa_receipt = value
            elif name == "PhoneNumber":
                phone = value

        # Update or insert transaction
        if tx:
            tx.result_code = result_code
            tx.result_desc = result_desc
            tx.mpesa_receipt = mpesa_receipt
            tx.amount = amount or tx.amount
            tx.phone_number = phone or tx.phone_number
            db.add(tx)
            db.commit()
        else:
            tx = MpesaTransaction(
                merchant_request_id=merchant_request_id,
                checkout_request_id=checkout_request_id,
                result_code=result_code,
                result_desc=result_desc,
                mpesa_receipt=mpesa_receipt,
                amount=amount,
                phone_number=phone,
            )
            db.add(tx)
            db.commit()

        # -------------------------------
        # Automatic Sale + Inventory
        # -------------------------------
        if result_code == 0 and tx and mpesa_receipt:
            # Idempotency: skip if already recorded
            existing_sale = (
                db.query(Sale)
                .filter(Sale.reference_no == mpesa_receipt)
                .first()
            )
            if not existing_sale:
                if tx.vendor_id and tx.product_id:
                    # Create Sale
                    new_sale = Sale(
                        vendor_id=tx.vendor_id,
                        product_id=tx.product_id,
                        quantity=1,  # Default assumption: 1 unit
                        unit_price=tx.amount,
                        total_price=tx.amount,
                        reference_no=mpesa_receipt,
                        timestamp=datetime.utcnow(),
                    )
                    db.add(new_sale)

                    # Update Inventory
                    inv = (
                        db.query(Inventory)
                        .filter(Inventory.product_id == tx.product_id)
                        .first()
                    )
                    if inv:
                        inv.stock_out += 1
                        db.add(inv)

                    db.commit()
                    print(f"✅ Sale + Inventory updated for receipt {mpesa_receipt}")
                else:
                    print("⚠️ Sale not created (missing vendor_id or product_id)")

    except Exception as e:
        print("❌ Error processing mpesa callback:", str(e))
        return {"ResultCode": 1, "ResultDesc": "Failed to process callback"}

    # Daraja requires HTTP 200 with a simple ACK
    return {"ResultCode": 0, "ResultDesc": "Accepted"}


# -----------------------
# M-Pesa Transaction History (basic)
# -----------------------
@router.get("/history", response_model=List[MpesaHistoryOut])
def get_mpesa_history(
    db: Session = Depends(get_db),
    current_vendor=Depends(get_current_vendor),
):
    """
    Show combined history of M-Pesa transactions + linked Sales
    for the current vendor.
    """
    transactions = (
        db.query(MpesaTransaction)
        .filter(MpesaTransaction.vendor_id == current_vendor.id)
        .order_by(MpesaTransaction.created_at.desc())
        .all()
    )

    history = []
    for tx in transactions:
        # try to find matching Sale (via mpesa_receipt)
        sale = (
            db.query(Sale)
            .filter(Sale.reference_no == tx.mpesa_receipt)
            .first()
        )
        history.append({
            "transaction_id": tx.id,
            "amount": tx.amount,
            "phone_number": tx.phone_number,
            "account_reference": tx.account_reference,
            "response_code": tx.response_code,
            "result_code": tx.result_code,
            "result_desc": tx.result_desc,
            "mpesa_receipt": tx.mpesa_receipt,
            "created_at": tx.created_at,
            "sale_id": sale.id if sale else None,
            "product_id": sale.product_id if sale else tx.product_id,
            "quantity": sale.quantity if sale else None,
            "unit_price": sale.unit_price if sale else None,
            "total_price": sale.total_price if sale else None,
            "sale_timestamp": sale.timestamp if sale else None,
        })

    return history


# -----------------------
# Enhanced History Endpoint
# -----------------------
@router.get("/history/enhanced")
def get_enhanced_mpesa_history(
    db: Session = Depends(get_db),
    current_vendor=Depends(get_current_vendor)
):
    """
    Return merged M-Pesa + Sale history for the logged-in vendor.
    Includes product name + vendor name for readability.
    """
    txs = (
        db.query(MpesaTransaction)
        .options(joinedload(MpesaTransaction.product), joinedload(MpesaTransaction.vendor))
        .filter(MpesaTransaction.vendor_id == current_vendor.id)
        .order_by(MpesaTransaction.created_at.desc())
        .all()
    )

    history = []
    for tx in txs:
        history.append({
            "transaction_id": tx.id,
            "merchant_request_id": tx.merchant_request_id,
            "checkout_request_id": tx.checkout_request_id,
            "amount": tx.amount,
            "phone_number": tx.phone_number,
            "account_reference": tx.account_reference,
            "response_code": tx.response_code,
            "response_description": tx.response_description,
            "result_code": tx.result_code,
            "result_desc": tx.result_desc,
            "mpesa_receipt": tx.mpesa_receipt,
            "product": tx.product.name if tx.product else None,
            "vendor": tx.vendor.name if tx.vendor else None,
            "created_at": tx.created_at,
        })

    return {"history": history}
