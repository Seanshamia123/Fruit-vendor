# backend/app/services/payment.py
from sqlalchemy.orm import Session
from app.models.payment import Payment
from app.schemas.payment import PaymentCreate

def create_payment(db: Session, payment: PaymentCreate) -> Payment:
    new_payment = Payment(**payment.dict())
    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)
    return new_payment

def get_payment_by_id(db: Session, payment_id: int) -> Payment | None:
    return db.query(Payment).filter(Payment.id == payment_id).first()

def get_payments_for_sale(db: Session, sale_id: int) -> list[Payment]:
    return db.query(Payment).filter(Payment.sale_id == sale_id).all()

def delete_payment(db: Session, payment_id: int) -> bool:
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        return False
    db.delete(payment)
    db.commit()
    return True
