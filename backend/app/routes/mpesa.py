# backend/app/routes/mpesa.py
from fastapi import APIRouter, Depends, HTTPException, Request, status
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
def initiate_stk_push(body: STKPushRequest, db: Session = Depends(get_db), current_vendor = Depends(get_current_vendor)):
    """
    Protected: vendor initiates STK push to customer's phone.
    Stores initial request (merchant/checkout ids) in db for reconciliation.
    """
    # normalize phone format validation should be added (see notes below)
    account_ref = body.account_reference or f"V{current_vendor.id}"
    try:
        resp = mpesa_service.stk_push(phone_number=body.phone_number, amount=body.amount,
                                      account_reference=account_ref, transaction_desc=body.transaction_desc)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # store a transaction record (best-effort)
    tr = MpesaTransaction(
        vendor_id=current_vendor.id,
        amount=body.amount,
        phone_number=body.phone_number,
        account_reference=account_ref,
        response_code=resp.get("ResponseCode"),
        response_description=resp.get("ResponseDescription"),
        merchant_request_id=resp.get("MerchantRequestID"),
        checkout_request_id=resp.get("CheckoutRequestID")
    )
    db.add(tr)
    db.commit()
    db.refresh(tr)

    return {
        "MerchantRequestID": resp.get("MerchantRequestID"),
        "CheckoutRequestID": resp.get("CheckoutRequestID"),
        "ResponseCode": resp.get("ResponseCode"),
        "ResponseDescription": resp.get("ResponseDescription")
    }

@router.post("/callback")
async def mpesa_callback(request: Request, db: Session = Depends(get_db)):
    """
    Public endpoint that Daraja will POST to.
    Daraja will post JSON where the payload sits under Body.stkCallback...
    We parse and update the MpesaTransaction record, then (optionally) create Sale and update inventory.
    """
    data = await request.json()
    # Best practice: log full payload to file for initial troubleshooting
    try:
        stk = data.get("Body", {}).get("stkCallback", {})
        merchant_request_id = stk.get("MerchantRequestID")
        checkout_request_id = stk.get("CheckoutRequestID")
        result_code = stk.get("ResultCode")
        result_desc = stk.get("ResultDesc")

        # find the transaction we earlier inserted
        tx = None
        if checkout_request_id:
            tx = db.query(MpesaTransaction).filter(MpesaTransaction.checkout_request_id == checkout_request_id).first()

        # If callback contains CallbackMetadata, extract meaningful fields
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

        # update or create transaction record
        if tx:
            tx.result_code = result_code
            tx.result_desc = result_desc
            tx.mpesa_receipt = mpesa_receipt
            tx.amount = amount or tx.amount
            tx.phone_number = phone or tx.phone_number
            db.add(tx)
            db.commit()
        else:
            # create a record if none exists
            tx = MpesaTransaction(
                merchant_request_id=merchant_request_id,
                checkout_request_id=checkout_request_id,
                result_code=result_code,
                result_desc=result_desc,
                mpesa_receipt=mpesa_receipt,
                amount=amount,
                phone_number=phone
            )
            db.add(tx)
            db.commit()

        # TODO: if result_code == 0 -> create Sale entry and update inventory (idempotent)
        #       Implement checks to avoid duplicate sale on replayed callbacks.

    except Exception as e:
        # always return 200 to Daraja (it will retry on non-200)
        # but log the error internally for debugging
        print("Error processing mpesa callback:", str(e))
        return {"ResultCode": 1, "ResultDesc": "Failed to process callback"}

    # Daraja expects you to respond with HTTP 200. Return a small JSON as acknowledgement.
    return {"ResultCode": 0, "ResultDesc": "Accepted"}
