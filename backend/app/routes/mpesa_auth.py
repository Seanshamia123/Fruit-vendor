from fastapi import APIRouter
from app.services.mpesa_auth import get_mpesa_access_token

router = APIRouter(prefix="/mpesa", tags=["M-Pesa"])

@router.get("/token")
def fetch_token():
    token = get_mpesa_access_token()
    return {"access_token": token}
