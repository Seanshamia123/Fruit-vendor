# backend/app/routes/mpesa_auth.py
"""
M-Pesa authentication and token management module.
Handles OAuth token generation and caching for Daraja API.
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.dependencies.db import get_db
from app.services.mpesa import get_oauth_token
from app.routes.auth import get_current_vendor
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/mpesa/auth", tags=["M-Pesa Auth"])

@router.get("/token")
def get_mpesa_token(
    db: Session = Depends(get_db),
    current_vendor = Depends(get_current_vendor)
):
    """
    Get M-Pesa OAuth token for testing purposes.
    In production, tokens should be cached and managed internally.
    """
    try:
        token = get_oauth_token()
        logger.info(f"Token generated successfully for vendor {current_vendor.id}")
        return {"access_token": token, "token_type": "Bearer"}
    except Exception as e:
        logger.error(f"Failed to generate M-Pesa token: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate M-Pesa access token")

# backend/app/services/mpesa.py
"""
Enhanced M-Pesa Daraja API integration service.
Provides secure, robust M-Pesa payment processing with comprehensive error handling.
"""
import os
import base64
import requests
import logging
from datetime import datetime, timedelta
from typing import Dict, Tuple, Optional
from dotenv import load_dotenv
import re

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Environment Configuration with Validation
class MpesaConfig:
    """Centralized M-Pesa configuration with validation."""
    
    def __init__(self):
        self.env = os.getenv("MPESA_ENV", "sandbox").lower()
        self.consumer_key = os.getenv("MPESA_CONSUMER_KEY")
        self.consumer_secret = os.getenv("MPESA_CONSUMER_SECRET")
        self.shortcode = os.getenv("MPESA_SHORTCODE")
        self.passkey = os.getenv("MPESA_PASSKEY")
        self.callback_url = os.getenv("MPESA_CALLBACK_URL")
        
        # Validate required configuration
        self._validate_config()
        
        # Set base URL based on environment
        self.base_url = (
            "https://sandbox.safaricom.co.ke" 
            if self.env == "sandbox" 
            else "https://api.safaricom.co.ke"
        )
        
        self.timeout = int(os.getenv("MPESA_TIMEOUT", "30"))
    
    def _validate_config(self):
        """Validate that all required M-Pesa configuration is present."""
        required_configs = {
            'MPESA_CONSUMER_KEY': self.consumer_key,
            'MPESA_CONSUMER_SECRET': self.consumer_secret,
            'MPESA_SHORTCODE': self.shortcode,
            'MPESA_PASSKEY': self.passkey,
            'MPESA_CALLBACK_URL': self.callback_url,
        }
        
        missing_configs = [key for key, value in required_configs.items() if not value]
        
        if missing_configs:
            raise ValueError(f"Missing required M-Pesa configuration: {', '.join(missing_configs)}")
        
        # Validate callback URL format
        if not self.callback_url.startswith(('http://', 'https://')):
            raise ValueError("MPESA_CALLBACK_URL must be a valid HTTP/HTTPS URL")
        
        logger.info(f"M-Pesa configuration validated successfully for {self.env} environment")

# Initialize configuration
config = MpesaConfig()

class MpesaError(Exception):
    """Custom exception for M-Pesa related errors."""
    def __init__(self, message: str, error_code: Optional[str] = None, response_data: Optional[Dict] = None):
        self.message = message
        self.error_code = error_code
        self.response_data = response_data
        super().__init__(self.message)

def validate_phone_number(phone_number: str) -> str:
    """
    Validate and format Kenyan phone number for M-Pesa.
    
    Args:
        phone_number: Phone number in various formats
        
    Returns:
        Formatted phone number (2547XXXXXXXX)
        
    Raises:
        ValueError: If phone number format is invalid
    """
    # Remove all non-digit characters
    digits_only = re.sub(r'\D', '', phone_number)
    
    # Handle different input formats
    if digits_only.startswith('2547') and len(digits_only) == 12:
        # Already in correct format: 2547XXXXXXXX
        return digits_only
    elif digits_only.startswith('07') and len(digits_only) == 10:
        # Format: 07XXXXXXXX -> 2547XXXXXXXX
        return '254' + digits_only[1:]
    elif digits_only.startswith('7') and len(digits_only) == 9:
        # Format: 7XXXXXXXX -> 2547XXXXXXXX
        return '254' + digits_only
    elif digits_only.startswith('254707') or digits_only.startswith('254701') or digits_only.startswith('254710'):
        # Handle common Kenyan prefixes
        return digits_only
    else:
        raise ValueError(f"Invalid Kenyan phone number format: {phone_number}")

def _generate_timestamp() -> str:
    """Generate timestamp in M-Pesa required format: YYYYMMDDHHMMSS"""
    return datetime.utcnow().strftime("%Y%m%d%H%M%S")

def generate_password(timestamp: Optional[str] = None) -> Tuple[str, str]:
    """
    Generate M-Pesa API password and timestamp.
    
    Password format: base64(BusinessShortCode + Passkey + Timestamp)
    
    Args:
        timestamp: Optional timestamp, current time if not provided
        
    Returns:
        Tuple of (base64_password, timestamp)
    """
    timestamp = timestamp or _generate_timestamp()
    
    # Create password string: shortcode + passkey + timestamp
    password_string = f"{config.shortcode}{config.passkey}{timestamp}"
    
    # Encode to base64
    password_bytes = password_string.encode('utf-8')
    password_base64 = base64.b64encode(password_bytes).decode('utf-8')
    
    logger.debug(f"Generated password for timestamp: {timestamp}")
    return password_base64, timestamp

def get_oauth_token() -> str:
    """
    Get OAuth access token from M-Pesa Daraja API.
    
    Returns:
        OAuth access token string
        
    Raises:
        MpesaError: If token generation fails
    """
    url = f"{config.base_url}/oauth/v1/generate?grant_type=client_credentials"
    
    try:
        logger.info("Requesting M-Pesa OAuth token")
        
        response = requests.get(
            url,
            auth=(config.consumer_key, config.consumer_secret),
            timeout=config.timeout,
            headers={'Content-Type': 'application/json'}
        )
        
        response.raise_for_status()
        response_data = response.json()
        
        if 'access_token' not in response_data:
            raise MpesaError("Invalid OAuth response: missing access_token", response_data=response_data)
        
        logger.info("M-Pesa OAuth token obtained successfully")
        return response_data['access_token']
        
    except requests.exceptions.RequestException as e:
        logger.error(f"HTTP error during OAuth token request: {str(e)}")
        raise MpesaError(f"Failed to get OAuth token: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error during OAuth token request: {str(e)}")
        raise MpesaError(f"Unexpected error getting OAuth token: {str(e)}")

def stk_push(
    phone_number: str, 
    amount: float, 
    account_reference: str, 
    transaction_desc: str = "Payment"
) -> Dict:
    """
    Initiate STK Push (Lipa na M-Pesa Online) payment request.
    
    Args:
        phone_number: Customer phone number (will be validated and formatted)
        amount: Payment amount
        account_reference: Account reference for the transaction
        transaction_desc: Description of the transaction
        
    Returns:
        Dict containing M-Pesa API response
        
    Raises:
        MpesaError: If STK push fails
        ValueError: If input validation fails
    """
    try:
        # Validate and format phone number
        formatted_phone = validate_phone_number(phone_number)
        
        # Validate amount
        if amount <= 0:
            raise ValueError("Amount must be greater than 0")
        
        if amount > 999999:  # M-Pesa limit
            raise ValueError("Amount exceeds M-Pesa transaction limit")
        
        # Generate OAuth token
        access_token = get_oauth_token()
        
        # Generate password and timestamp
        password, timestamp = generate_password()
        
        # Prepare STK Push payload
        payload = {
            "BusinessShortCode": config.shortcode,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": int(amount),  # M-Pesa expects integer
            "PartyA": formatted_phone,
            "PartyB": config.shortcode,
            "PhoneNumber": formatted_phone,
            "CallBackURL": config.callback_url,
            "AccountReference": account_reference[:12],  # M-Pesa limit
            "TransactionDesc": transaction_desc[:13]  # M-Pesa limit
        }
        
        # Prepare headers
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        # Make STK Push request
        url = f"{config.base_url}/mpesa/stkpush/v1/processrequest"
        
        logger.info(f"Initiating STK Push: Phone={formatted_phone}, Amount={amount}, Ref={account_reference}")
        
        response = requests.post(
            url,
            json=payload,
            headers=headers,
            timeout=config.timeout
        )
        
        response.raise_for_status()
        response_data = response.json()
        
        # Log response for debugging
        logger.info(f"STK Push response: {response_data}")
        
        # Check for M-Pesa specific errors
        if response_data.get('ResponseCode') != '0':
            error_msg = response_data.get('ResponseDescription', 'Unknown M-Pesa error')
            raise MpesaError(
                f"STK Push failed: {error_msg}",
                error_code=response_data.get('ResponseCode'),
                response_data=response_data
            )
        
        return response_data
        
    except ValueError as e:
        logger.error(f"Validation error in STK Push: {str(e)}")
        raise
    except MpesaError:
        raise
    except requests.exceptions.RequestException as e:
        logger.error(f"HTTP error during STK Push: {str(e)}")
        raise MpesaError(f"STK Push request failed: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error during STK Push: {str(e)}")
        raise MpesaError(f"Unexpected STK Push error: {str(e)}")

def query_stk_status(checkout_request_id: str) -> Dict:
    """
    Query the status of an STK Push transaction.
    
    Args:
        checkout_request_id: CheckoutRequestID from STK Push response
        
    Returns:
        Dict containing transaction status
        
    Raises:
        MpesaError: If status query fails
    """
    try:
        access_token = get_oauth_token()
        password, timestamp = generate_password()
        
        payload = {
            "BusinessShortCode": config.shortcode,
            "Password": password,
            "Timestamp": timestamp,
            "CheckoutRequestID": checkout_request_id
        }
        
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        url = f"{config.base_url}/mpesa/stkpushquery/v1/query"
        
        logger.info(f"Querying STK status for CheckoutRequestID: {checkout_request_id}")
        
        response = requests.post(
            url,
            json=payload,
            headers=headers,
            timeout=config.timeout
        )
        
        response.raise_for_status()
        response_data = response.json()
        
        logger.info(f"STK status response: {response_data}")
        return response_data
        
    except requests.exceptions.RequestException as e:
        logger.error(f"HTTP error during STK status query: {str(e)}")
        raise MpesaError(f"STK status query failed: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error during STK status query: {str(e)}")
        raise MpesaError(f"Unexpected STK status query error: {str(e)}")

# backend/app/routes/mpesa.py
"""
Enhanced M-Pesa payment processing routes with comprehensive error handling and logging.
"""
from fastapi import APIRouter, Depends, HTTPException, Request, status, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.dependencies.db import get_db
from app.services import mpesa as mpesa_service
from app.services.mpesa import MpesaError
from app.schemas.mpesa import STKPushRequest, STKPushResponse, CallbackResponse
from app.routes.auth import get_current_vendor
from app.models.mpesa_transaction import MpesaTransaction
from app.models.sale import Sale
from app.models.inventory import Inventory
from typing import Dict, Any
import logging
import json

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/mpesa", tags=["M-Pesa Payments"])

@router.post("/stk-push", response_model=STKPushResponse)
async def initiate_stk_push(
    request: STKPushRequest, 
    db: Session = Depends(get_db), 
    current_vendor = Depends(get_current_vendor)
):
    """
    Initiate STK Push payment request to customer's phone.
    Creates transaction record for callback reconciliation.
    """
    try:
        # Set default account reference if not provided
        account_ref = request.account_reference or f"V{current_vendor.id}_{request.amount}"
        
        logger.info(f"Vendor {current_vendor.id} initiating STK Push: "
                   f"Phone={request.phone_number}, Amount={request.amount}")
        
        # Call M-Pesa service
        response = mpesa_service.stk_push(
            phone_number=request.phone_number,
            amount=request.amount,
            account_reference=account_ref,
            transaction_desc=request.transaction_desc or "Payment"
        )
        
        # Create transaction record for callback reconciliation
        transaction = MpesaTransaction(
            vendor_id=current_vendor.id,
            product_id=request.product_id,  # Optional: link to specific product
            amount=request.amount,
            phone_number=request.phone_number,
            account_reference=account_ref,
            merchant_request_id=response.get("MerchantRequestID"),
            checkout_request_id=response.get("CheckoutRequestID"),
            response_code=response.get("ResponseCode"),
            response_description=response.get("ResponseDescription")
        )
        
        try:
            db.add(transaction)
            db.commit()
            db.refresh(transaction)
            logger.info(f"Transaction record created: ID={transaction.id}")
        except IntegrityError as e:
            db.rollback()
            logger.error(f"Database error creating transaction: {str(e)}")
            # Continue execution - STK push was successful even if DB save failed
        
        return STKPushResponse(
            MerchantRequestID=response.get("MerchantRequestID"),
            CheckoutRequestID=response.get("CheckoutRequestID"),
            ResponseCode=response.get("ResponseCode"),
            ResponseDescription=response.get("ResponseDescription")
        )
        
    except ValueError as e:
        logger.error(f"Validation error in STK Push: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid input: {str(e)}"
        )
    except MpesaError as e:
        logger.error(f"M-Pesa error in STK Push: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"M-Pesa service error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error in STK Push: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during payment initiation"
        )

@router.post("/callback", response_model=CallbackResponse)
async def mpesa_callback(
    request: Request, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Handle M-Pesa payment callback from Daraja API.
    Processes payment confirmation and updates transaction records.
    """
    try:
        # Parse callback data
        callback_data = await request.json()
        
        # Log full callback for debugging (remove in production)
        logger.info(f"M-Pesa callback received: {json.dumps(callback_data, indent=2)}")
        
        # Extract STK callback data
        stk_callback = callback_data.get("Body", {}).get("stkCallback", {})
        
        if not stk_callback:
            logger.warning("Invalid callback format: missing stkCallback")
            return CallbackResponse(ResultCode=1, ResultDesc="Invalid callback format")
        
        # Extract basic transaction info
        merchant_request_id = stk_callback.get("MerchantRequestID")
        checkout_request_id = stk_callback.get("CheckoutRequestID")
        result_code = stk_callback.get("ResultCode")
        result_desc = stk_callback.get("ResultDesc")
        
        logger.info(f"Processing callback: CheckoutID={checkout_request_id}, "
                   f"ResultCode={result_code}")
        
        # Find existing transaction record
        transaction = None
        if checkout_request_id:
            transaction = db.query(MpesaTransaction).filter(
                MpesaTransaction.checkout_request_id == checkout_request_id
            ).first()
        
        # Extract callback metadata for successful transactions
        amount = None
        mpesa_receipt = None
        phone_number = None
        
        if result_code == 0:  # Successful transaction
            callback_metadata = stk_callback.get("CallbackMetadata", {})
            metadata_items = callback_metadata.get("Item", [])
            
            for item in metadata_items:
                name = item.get("Name")
                value = item.get("Value")
                
                if name == "Amount":
                    amount = float(value) if value else None
                elif name == "MpesaReceiptNumber":
                    mpesa_receipt = str(value) if value else None
                elif name == "PhoneNumber":
                    phone_number = str(value) if value else None
        
        # Update or create transaction record
        if transaction:
            # Update existing transaction
            transaction.result_code = result_code
            transaction.result_desc = result_desc
            transaction.mpesa_receipt = mpesa_receipt
            if amount:
                transaction.amount = amount
            if phone_number:
                transaction.phone_number = phone_number
            
            logger.info(f"Updated transaction {transaction.id} with callback data")
        else:
            # Create new transaction record (shouldn't happen normally)
            transaction = MpesaTransaction(
                merchant_request_id=merchant_request_id,
                checkout_request_id=checkout_request_id,
                result_code=result_code,
                result_desc=result_desc,
                mpesa_receipt=mpesa_receipt,
                amount=amount,
                phone_number=phone_number
            )
            db.add(transaction)
            logger.warning(f"Created new transaction from callback: {checkout_request_id}")
        
        # Commit transaction updates
        try:
            db.commit()
            db.refresh(transaction)
        except Exception as e:
            db.rollback()
            logger.error(f"Database error updating transaction: {str(e)}")
            return CallbackResponse(ResultCode=1, ResultDesc="Database error")
        
        # Process successful payment
        if result_code == 0 and transaction.vendor_id and transaction.product_id:
            # Schedule background task to create sale and update inventory
            background_tasks.add_task(
                process_successful_payment,
                transaction.id,
                db_session_factory=lambda: SessionLocal()
            )
        
        return CallbackResponse(ResultCode=0, ResultDesc="Callback processed successfully")
        
    except json.JSONDecodeError:
        logger.error("Invalid JSON in M-Pesa callback")
        return CallbackResponse(ResultCode=1, ResultDesc="Invalid JSON format")
    except Exception as e:
        logger.error(f"Error processing M-Pesa callback: {str(e)}")
        return CallbackResponse(ResultCode=1, ResultDesc="Internal processing error")

async def process_successful_payment(transaction_id: int, db_session_factory):
    """
    Background task to process successful M-Pesa payment.
    Creates sale record and updates inventory.
    """
    db = db_session_factory()
    try:
        transaction = db.query(MpesaTransaction).filter(
            MpesaTransaction.id == transaction_id
        ).first()
        
        if not transaction or transaction.result_code != 0:
            logger.warning(f"Transaction {transaction_id} not found or not successful")
            return
        
        # Check if sale already exists (idempotency)
        existing_sale = db.query(Sale).filter(
            Sale.vendor_id == transaction.vendor_id,
            Sale.product_id == transaction.product_id
        ).filter(
            # Additional check could be based on mpesa_receipt or timestamp
            Sale.total_price == transaction.amount
        ).first()
        
        if existing_sale:
            logger.info(f"Sale already exists for transaction {transaction_id}")
            return
        
        # Create sale record
        # Note: This assumes quantity=1 and unit_price=total_amount
        # You may need to modify this logic based on your business requirements
        sale = Sale(
            vendor_id=transaction.vendor_id,
            product_id=transaction.product_id,
            quantity=1.0,  # Default quantity - you might want to store this in transaction
            unit_price=transaction.amount,
            total_price=transaction.amount
        )
        
        db.add(sale)
        
        # Update inventory
        inventory = db.query(Inventory).filter(
            Inventory.vendor_id == transaction.vendor_id,
            Inventory.product_id == transaction.product_id
        ).first()
        
        if inventory and inventory.quantity >= 1.0:
            inventory.quantity -= 1.0
            logger.info(f"Updated inventory for product {transaction.product_id}: "
                       f"new quantity = {inventory.quantity}")
        else:
            logger.warning(f"Insufficient inventory for product {transaction.product_id}")
        
        db.commit()
        logger.info(f"Successfully processed payment for transaction {transaction_id}")
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error processing successful payment {transaction_id}: {str(e)}")
    finally:
        db.close()

@router.get("/transaction/{checkout_request_id}")
async def get_transaction_status(
    checkout_request_id: str,
    db: Session = Depends(get_db),
    current_vendor = Depends(get_current_vendor)
):
    """
    Get transaction status by CheckoutRequestID.
    """
    transaction = db.query(MpesaTransaction).filter(
        MpesaTransaction.checkout_request_id == checkout_request_id,
        MpesaTransaction.vendor_id == current_vendor.id
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    return {
        "transaction_id": transaction.id,
        "checkout_request_id": transaction.checkout_request_id,
        "amount": transaction.amount,
        "result_code": transaction.result_code,
        "result_desc": transaction.result_desc,
        "mpesa_receipt": transaction.mpesa_receipt,
        "status": "completed" if transaction.result_code == 0 else "failed" if transaction.result_code else "pending"
    }

@router.get("/transactions")
async def list_transactions(
    db: Session = Depends(get_db),
    current_vendor = Depends(get_current_vendor),
    limit: int = 50,
    offset: int = 0
):
    """
    List M-Pesa transactions for current vendor.
    """
    transactions = db.query(MpesaTransaction).filter(
        MpesaTransaction.vendor_id == current_vendor.id
    ).order_by(MpesaTransaction.created_at.desc()).offset(offset).limit(limit).all()
    
    return [
        {
            "id": t.id,
            "checkout_request_id": t.checkout_request_id,
            "amount": t.amount,
            "phone_number": t.phone_number,
            "result_code": t.result_code,
            "result_desc": t.result_desc,
            "mpesa_receipt": t.mpesa_receipt,
            "created_at": t.created_at,
            "status": "completed" if t.result_code == 0 else "failed" if t.result_code else "pending"
        }
        for t in transactions
    ]