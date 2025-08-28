import os
import base64
import datetime as dt
import requests
from typing import Dict, Any
from urllib.parse import urlparse

# ---- ENV ----
DARAJA_BASE = os.getenv("MPESA_BASE_URL", "https://sandbox.safaricom.co.ke")
CONSUMER_KEY = os.getenv("MPESA_CONSUMER_KEY")
CONSUMER_SECRET = os.getenv("MPESA_CONSUMER_SECRET")
SHORTCODE = os.getenv("MPESA_SHORTCODE", "174379")
PASSKEY = os.getenv("MPESA_PASSKEY")
CALLBACK_URL = os.getenv("MPESA_CALLBACK_URL")
TIMEOUT = int(os.getenv("MPESA_TIMEOUT", "30"))

# ---- ENDPOINTS ----
OAUTH_URL = f"{DARAJA_BASE}/oauth/v1/generate?grant_type=client_credentials"
STK_URL = f"{DARAJA_BASE}/mpesa/stkpush/v1/processrequest"

def _now_ts() -> str:
    return dt.datetime.now().strftime("%Y%m%d%H%M%S")  # YYYYMMDDHHMMSS

def _password(ts: str) -> str:
    raw = f"{SHORTCODE}{PASSKEY}{ts}".encode()
    return base64.b64encode(raw).decode()

def _token() -> str:
    r = requests.get(OAUTH_URL, auth=(CONSUMER_KEY, CONSUMER_SECRET), timeout=TIMEOUT)
    r.raise_for_status()
    return r.json()["access_token"]

def _normalize_msisdn(msisdn: str) -> str:
    s = str(msisdn).strip().replace(" ", "")
    if s.startswith("+"): s = s[1:]
    if s.startswith("07"): s = "254" + s[1:]
    return s

def _validated_callback() -> str:
    """Ensure callback URL is https and well-formed; trim stray spaces."""
    cb = (CALLBACK_URL or "").strip()
    if not cb:
        raise ValueError("MPESA_CALLBACK_URL is not set")
    p = urlparse(cb)
    if p.scheme.lower() != "https" or not p.netloc:
        raise ValueError(f"MPESA_CALLBACK_URL must be https and public. Got: {cb!r}")
    # optional: enforce path ends with /mpesa/callback to match your router
    if not p.path.endswith("/mpesa/callback"):
        raise ValueError(f"MPESA_CALLBACK_URL path should end with /mpesa/callback. Got: {cb!r}")
    return cb

def stk_push(
    phone: str | None = None,
    phone_number: str | None = None,
    amount: int = 1,
    account_ref: str | None = None,
    account_reference: str | None = None,
    desc: str | None = None,
    transaction_desc: str | None = None,
) -> Dict[str, Any]:
    # Accept both router shapes
    phone_val = phone or phone_number
    if not phone_val:
        raise ValueError("Missing phone / phone_number")
    phone_val = _normalize_msisdn(phone_val)

    acc_ref = (account_ref or account_reference or "FRUITS")[:12]
    descr  = (desc or transaction_desc or "Payment")[:13]
    cb_url = _validated_callback()

    ts = _now_ts()
    payload = {
        "BusinessShortCode": SHORTCODE,
        "Password": _password(ts),
        "Timestamp": ts,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": int(amount),
        "PartyA": phone_val,
        "PartyB": SHORTCODE,
        "PhoneNumber": phone_val,
        "CallBackURL": cb_url,
        "AccountReference": acc_ref,
        "TransactionDesc": descr,
    }

    headers = {
        "Authorization": f"Bearer {_token()}",
        "Content-Type": "application/json",
    }

    # Helpful debug
    print("STK DEBUG:", {"CallBackURL": cb_url, "Timestamp": ts})

    r = requests.post(STK_URL, json=payload, headers=headers, timeout=TIMEOUT)

    # Log Daraja response (no secrets)
    try:
        dbg_body = r.json()
    except Exception:
        dbg_body = r.text
    print("DARAJA DEBUG:", {"status": r.status_code, "body": dbg_body})

    if r.status_code != 200:
        try:
            err = r.json()
        except Exception:
            err = r.text
        raise RuntimeError(f"Daraja {r.status_code}: {err}")

    return r.json()
