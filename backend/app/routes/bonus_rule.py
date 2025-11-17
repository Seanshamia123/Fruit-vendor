from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.schemas.bonus_rule import BonusRuleCreate, BonusRuleOut, BonusRuleUpdate
from app.services import bonus_rule as bonus_rule_service
from app.models.vendor import Vendor
from app.routes.auth import get_current_vendor

router = APIRouter(prefix="/bonus-rules", tags=["Bonus Rules"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=BonusRuleOut)
def create_bonus_rule(
    rule: BonusRuleCreate,
    current_vendor: Vendor = Depends(get_current_vendor),
    db: Session = Depends(get_db)
):
    return bonus_rule_service.create_bonus_rule(db, rule, current_vendor.id)

@router.get("/", response_model=list[BonusRuleOut])
def list_all_bonus_rules(
    current_vendor: Vendor = Depends(get_current_vendor),
    db: Session = Depends(get_db)
):
    """List all bonus rules for the authenticated vendor's products."""
    return bonus_rule_service.list_all_vendor_bonus_rules(db, current_vendor.id)

@router.get("/{rule_id}", response_model=BonusRuleOut)
def get_bonus_rule(rule_id: int, db: Session = Depends(get_db)):
    return bonus_rule_service.get_bonus_rule(db, rule_id)

@router.get("/product/{product_id}", response_model=list[BonusRuleOut])
def list_bonus_rules(product_id: int, db: Session = Depends(get_db)):
    return bonus_rule_service.list_bonus_rules(db, product_id)

@router.patch("/{rule_id}/toggle", response_model=BonusRuleOut)
def toggle_bonus_rule(
    rule_id: int,
    current_vendor: Vendor = Depends(get_current_vendor),
    db: Session = Depends(get_db)
):
    """Toggle the is_active status of a bonus rule."""
    return bonus_rule_service.toggle_bonus_rule(db, rule_id, current_vendor.id)

@router.put("/{rule_id}", response_model=BonusRuleOut)
def update_bonus_rule(
    rule_id: int,
    rule: BonusRuleUpdate,
    current_vendor: Vendor = Depends(get_current_vendor),
    db: Session = Depends(get_db)
):
    return bonus_rule_service.update_bonus_rule(db, rule_id, rule, current_vendor.id)

@router.delete("/{rule_id}")
def delete_bonus_rule(
    rule_id: int,
    current_vendor: Vendor = Depends(get_current_vendor),
    db: Session = Depends(get_db)
):
    """Delete a bonus rule, ensuring it belongs to the authenticated vendor."""
    return bonus_rule_service.delete_bonus_rule(db, rule_id, current_vendor.id)
