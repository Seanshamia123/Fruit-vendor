# backend/app/routes/mpesa.py
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.services import mpesa as mpesa_service
from app.schemas.mpesa import STKPushRequest, STKPushResponse
from app.routes.auth import get_current_vendor
from app.models.mpesa_transaction import MpesaTransaction

router = APIRouter(prefix="/mpesa", tags=["mpesa"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/stk-push", response_model=STKPushResponse)
def initiate_stk_push(
    body: STKPushRequest,
    db: Session = Depends(get_db),
    current_vendor=Depends(get_current_vendor),
):
    """
    Vendor initiates STK push to customer's phone.
    Saves initial request in DB (for reconciliation when callback arrives).
    """
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

    # Save initial transaction with product_id included
    tr = MpesaTransaction(
        vendor_id=current_vendor.id,
        product_id=body.product_id,  # ensure product is linked
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


@router.post("/callback")
async def mpesa_callback(request: Request, db: Session = Depends(get_db)):
    """
    Public endpoint for Safaricom Daraja to POST callback.
    Updates the matching MpesaTransaction row with final status.
    """
    data = await request.json()
    print("CALLBACK RAW >>>", data)  # Debug log

    try:
        stk = data.get("Body", {}).get("stkCallback", {})
        merchant_request_id = stk.get("MerchantRequestID")
        checkout_request_id = stk.get("CheckoutRequestID")
        result_code = stk.get("ResultCode")
        result_desc = stk.get("ResultDesc")

        # Look up transaction using CheckoutRequestID
        tx = None
        if checkout_request_id:
            tx = (
                db.query(MpesaTransaction)
                .filter(MpesaTransaction.checkout_request_id == checkout_request_id)
                .first()
            )

        # Extract metadata if present
        amount = None
        mpesa_receipt = None
        phone = None
        meta = stk.get("CallbackMetadata", {}).get("Item", [])
        for item in meta:
            name = item.get("Name")
            value = item.get("Value")
            if name == "Amount":
                amount = value
            if name == "MpesaReceiptNumber":
                mpesa_receipt = value
            if name == "PhoneNumber":
                phone = value

        # Update existing record
        if tx:
            tx.result_code = result_code
            tx.result_desc = result_desc
            tx.mpesa_receipt = mpesa_receipt
            tx.amount = amount or tx.amount
            tx.phone_number = phone or tx.phone_number
            db.add(tx)
            db.commit()
        else:
            # If no record exists, create one (rare case)
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

    except Exception as e:
        print("Error processing mpesa callback:", str(e))
        return {"ResultCode": 1, "ResultDesc": "Failed to process callback"}

    # Safaricom expects a 200 with ResultCode 0
    return {"ResultCode": 0, "ResultDesc": "Accepted"}
