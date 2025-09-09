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
    Saves initial request in DB (with product_id).
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

    # Always save with product_id
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


@router.post("/callback")
async def mpesa_callback(request: Request, db: Session = Depends(get_db)):
    """
    Callback from Safaricom Daraja.
    Updates MpesaTransaction with final status.
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
            if name == "MpesaReceiptNumber":
                mpesa_receipt = value
            if name == "PhoneNumber":
                phone = value

        if tx:
            # update existing record
            tx.result_code = result_code
            tx.result_desc = result_desc
            tx.mpesa_receipt = mpesa_receipt
            tx.amount = amount or tx.amount
            tx.phone_number = phone or tx.phone_number
            db.add(tx)
            db.commit()
        else:
            # create record but ensure product_id is not lost
            tx = MpesaTransaction(
                vendor_id=None,  # callback has no vendor context
                product_id=None, # callback doesn’t include product_id
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

    return {"ResultCode": 0, "ResultDesc": "Accepted"}
