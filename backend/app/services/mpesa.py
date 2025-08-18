# backend/app/services/mpesa.py
import os
import base64
import requests
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

MPESA_ENV = os.getenv("MPESA_ENV", "sandbox").lower()
BASE_URL = "https://sandbox.safaricom.co.ke" if MPESA_ENV == "sandbox" else "https://api.safaricom.co.ke"

CONSUMER_KEY = os.getenv("MPESA_CONSUMER_KEY")
CONSUMER_SECRET = os.getenv("MPESA_CONSUMER_SECRET")
SHORTCODE = os.getenv("MPESA_SHORTCODE")       # BusinessShortCode / Paybill
PASSKEY = os.getenv("MPESA_PASSKEY")           # Lipa Na Mpesa passkey
CALLBACK_URL = os.getenv("MPESA_CALLBACK_URL") # https://<ngrok>.io/mpesa/callback

TIMEOUT = 20  # seconds for HTTP calls

def _timestamp() -> str:
    return datetime.utcnow().strftime("%Y%m%d%H%M%S")

def generate_password(shortcode: str = SHORTCODE, passkey: str = PASSKEY, ts: str | None = None) -> tuple[str,str]:
    """
    Returns (password_base64, timestamp)
    Password = base64(BusinessShortCode + Passkey + Timestamp)
    Timestamp format: YYYYMMDDHHMMSS
    See Daraja docs: password is base64(shortcode+passkey+timestamp).
    """
    ts = ts or _timestamp()
    raw = f"{shortcode}{passkey}{ts}"
    encoded = base64.b64encode(raw.encode()).decode()
    return encoded, ts

def get_oauth_token() -> str:
    """
    Request OAuth token from Daraja OAuth endpoint.
    Uses HTTP Basic auth (consumer_key:consumer_secret).
    Endpoint: /oauth/v1/generate?grant_type=client_credentials
    Token typically expires in ~1 hour.
    """
    url = f"{BASE_URL}/oauth/v1/generate?grant_type=client_credentials"
    resp = requests.get(url, auth=(CONSUMER_KEY, CONSUMER_SECRET), timeout=TIMEOUT)
    resp.raise_for_status()
    j = resp.json()
    return j["access_token"]

def stk_push(phone_number: str, amount: int|float, account_reference: str, transaction_desc: str = "Payment") -> dict:
    """
    Initiate an STK Push (Lipa na M-Pesa Online).
    - phone_number must be in international Kenya format without '+' e.g. 2547XXXXXXXX
    - returns Daraja response JSON (contains MerchantRequestID, CheckoutRequestID if accepted)
    """
    token = get_oauth_token()
    password, ts = generate_password()
    payload = {
        "BusinessShortCode": SHORTCODE,
        "Password": password,
        "Timestamp": ts,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": int(amount),
        "PartyA": phone_number,
        "PartyB": SHORTCODE,
        "PhoneNumber": phone_number,
        "CallBackURL": CALLBACK_URL,
        "AccountReference": account_reference,
        "TransactionDesc": transaction_desc
    }
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    url = f"{BASE_URL}/mpesa/stkpush/v1/processrequest"
    resp = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    resp.raise_for_status()
    return resp.json()
