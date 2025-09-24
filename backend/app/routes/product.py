# backend/app/routes/product.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import SessionLocal
from app.schemas.product import ProductCreate, ProductOut
from app.services import product as product_service
from app.routes.auth import get_current_vendor

router = APIRouter(prefix="/products", tags=["products"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    current_vendor=Depends(get_current_vendor),
):
    return product_service.create_product(db, product_in, vendor_id=current_vendor.id)

@router.get("/", response_model=List[ProductOut])
def list_products(
    db: Session = Depends(get_db),
    current_vendor=Depends(get_current_vendor),
):
    return product_service.get_products_by_vendor(db, vendor_id=current_vendor.id)

@router.get("/{product_id}", response_model=ProductOut)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_vendor=Depends(get_current_vendor),
):
    return product_service.get_product(db, product_id, vendor_id=current_vendor.id)

@router.put("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    current_vendor=Depends(get_current_vendor),
):
    return product_service.update_product(db, product_id, current_vendor.id, product_in)

@router.patch("/{product_id}/status", response_model=ProductOut)
def toggle_product_status(
    product_id: int,
    active: bool,
    db: Session = Depends(get_db),
    current_vendor=Depends(get_current_vendor),
):
    return product_service.toggle_product_status(db, product_id, current_vendor.id, active)

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_vendor=Depends(get_current_vendor),
):
    product_service.delete_product(db, product_id, vendor_id=current_vendor.id)
    return None

# # backend/app/routes/mpesa.py
# from fastapi import APIRouter, Depends, HTTPException, Request, status
# from sqlalchemy.orm import Session
# from typing import Any, Dict
# from app.database import SessionLocal
# from app.services import mpesa as mpesa_service
# from app.schemas.mpesa import STKPushRequest, STKPushResponse
# from app.routes.auth import get_current_vendor
# from app.models.mpesa_transaction import MpesaTransaction

# router = APIRouter(prefix="/mpesa", tags=["mpesa"])

# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

# @router.post("/stk-push", response_model=STKPushResponse)
# def initiate_stk_push(
#     body: STKPushRequest,
#     db: Session = Depends(get_db),
#     current_vendor = Depends(get_current_vendor)
# ):
#     """
#     Protected: vendor initiates STK push to customer's phone.
#     Stores initial request (merchant/checkout ids) in DB for reconciliation.
#     """
#     account_ref = body.account_reference or f"V{current_vendor.id}"
#     try:
#         resp = mpesa_service.stk_push(
#             phone_number=body.phone_number,
#             amount=body.amount,
#             account_reference=account_ref,
#             transaction_desc=body.transaction_desc,
#         )
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=str(e))

#     tr = MpesaTransaction(
#         vendor_id=current_vendor.id,
#         amount=body.amount,
#         phone_number=body.phone_number,
#         account_reference=account_ref,
#         response_code=resp.get("ResponseCode"),
#         response_description=resp.get("ResponseDescription"),
#         merchant_request_id=resp.get("MerchantRequestID"),
#         checkout_request_id=resp.get("CheckoutRequestID"),
#     )
#     db.add(tr)
#     db.commit()
#     db.refresh(tr)

#     return {
#         "MerchantRequestID": resp.get("MerchantRequestID"),
#         "CheckoutRequestID": resp.get("CheckoutRequestID"),
#         "ResponseCode": resp.get("ResponseCode"),
#         "ResponseDescription": resp.get("ResponseDescription"),
#     }

# @router.post("/callback", status_code=status.HTTP_200_OK)
# async def mpesa_callback(request: Request, db: Session = Depends(get_db)):
#     """
#     Public endpoint that Daraja posts to.
#     We reconcile mpesa_transactions using CheckoutRequestID.
#     Always return 200 (Daraja retries on non-200).
#     """
#     data: Dict[str, Any] = await request.json()
#     print("CALLBACK RAW >>>", data)

#     try:
#         stk = data.get("Body", {}).get("stkCallback", {})
#         merchant_request_id = stk.get("MerchantRequestID")
#         checkout_request_id = stk.get("CheckoutRequestID")
#         result_code = stk.get("ResultCode")
#         result_desc = stk.get("ResultDesc")

#         tx = None
#         if checkout_request_id:
#             tx = db.query(MpesaTransaction).filter(
#                 MpesaTransaction.checkout_request_id == checkout_request_id
#             ).first()

#         amount = None
#         mpesa_receipt = None
#         phone = None
#         meta = stk.get("CallbackMetadata", {}).get("Item", [])
#         for item in meta:
#             name = item.get("Name")
#             value = item.get("Value")
#             if name == "Amount":
#                 amount = value
#             elif name == "MpesaReceiptNumber":
#                 mpesa_receipt = value
#             elif name == "PhoneNumber":
#                 phone = value

#         if tx:
#             tx.result_code = result_code
#             tx.result_desc = result_desc
#             tx.mpesa_receipt = mpesa_receipt
#             if amount is not None:
#                 tx.amount = amount
#             if phone is not None:
#                 tx.phone_number = str(phone)
#             db.add(tx)
#             db.commit()
#         else:
#             tx = MpesaTransaction(
#                 merchant_request_id=merchant_request_id,
#                 checkout_request_id=checkout_request_id,
#                 result_code=result_code,
#                 result_desc=result_desc,
#                 mpesa_receipt=mpesa_receipt,
#                 amount=amount,
#                 phone_number=str(phone) if phone is not None else None,
#             )
#             db.add(tx)
#             db.commit()

#         # TODO (next): if result_code == 0 -> create Sale + update inventory (idempotent)

#         return {"ResultCode": 0, "ResultDesc": "Accepted"}
#     except Exception as e:
#         print("Error processing mpesa callback:", str(e))
#         return {"ResultCode": 1, "ResultDesc": "Failed to process callback"}
