import os
import requests
from datetime import datetime
from dotenv import load_dotenv
from base64 import b64encode
from app.services.mpesa_auth import get_mpesa_access_token

load_dotenv()

BUSINESS_SHORTCODE = os.getenv("MPESA_BUSINESS_SHORTCODE")
PASSKEY = os.getenv("MPESA_PASSKEY")
CALLBACK_URL = os.getenv("MPESA_CALLBACK_URL")
BASE_URL = os.getenv("MPESA_BASE_URL")


def generate_timestamp():
    return datetime.now().strftime('%Y%m%d%H%M%S')


def generate_password(shortcode: str, passkey: str, timestamp: str):
    raw = f"{shortcode}{passkey}{timestamp}"
    return b64encode(raw.encode()).decode()


def initiate_stk_push(phone_number: str, amount: int, account_reference: str, transaction_desc: str):
    access_token = get_mpesa_access_token()
    timestamp = generate_timestamp()
    password = generate_password(BUSINESS_SHORTCODE, PASSKEY, timestamp)

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    payload = {
        "BusinessShortCode": BUSINESS_SHORTCODE,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",  # or "CustomerBuyGoodsOnline"
        "Amount": amount,
        "PartyA": phone_number,
        "PartyB": BUSINESS_SHORTCODE,
        "PhoneNumber": phone_number,
        "CallBackURL": f"{CALLBACK_URL}/mpesa/callback",
        "AccountReference": account_reference,
        "TransactionDesc": transaction_desc
    }

    url = f"{BASE_URL}/mpesa/stkpush/v1/processrequest"
    response = requests.post(url, headers=headers, json=payload)

    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"STK push failed: {response.text}")
