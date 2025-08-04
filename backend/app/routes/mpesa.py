from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from app.services.mpesa_stk_push import initiate_stk_push

router = APIRouter(prefix="/mpesa", tags=["M-PESA"])


class STKRequest(BaseModel):
    phone_number: str
    amount: int
    reference: str
    description: str


@router.post("/stk-push")
def stk_push(data: STKRequest):
    try:
        result = initiate_stk_push(
            phone_number=data.phone_number,
            amount=data.amount,
            account_reference=data.reference,
            transaction_desc=data.description
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/callback")
async def mpesa_callback(request: Request):
    body = await request.json()
    # Optional: log or persist callback data
    print("M-PESA Callback received:", body)
    return {"status": "callback received"}
