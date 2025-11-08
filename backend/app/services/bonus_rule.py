from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.bonus_rule import BonusRule
from app.models.product import Product
from app.schemas.bonus_rule import BonusRuleCreate, BonusRuleUpdate

def create_bonus_rule(db: Session, rule: BonusRuleCreate):
    new_rule = BonusRule(**rule.dict())
    db.add(new_rule)
    db.commit()
    db.refresh(new_rule)
    return new_rule

def get_bonus_rule(db: Session, rule_id: int):
    rule = db.query(BonusRule).filter(BonusRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Bonus rule not found")
    return rule

def list_bonus_rules(db: Session, product_id: int):
    return db.query(BonusRule).filter(BonusRule.product_id == product_id).all()

def list_all_vendor_bonus_rules(db: Session, vendor_id: int):
    """List all bonus rules for a vendor's products."""
    return db.query(BonusRule).join(Product).filter(Product.vendor_id == vendor_id).all()

def update_bonus_rule(db: Session, rule_id: int, rule_data: BonusRuleUpdate):
    rule = get_bonus_rule(db, rule_id)
    for field, value in rule_data.dict(exclude_unset=True).items():
        setattr(rule, field, value)
    db.commit()
    db.refresh(rule)
    return rule

def toggle_bonus_rule(db: Session, rule_id: int, vendor_id: int):
    """Toggle the is_active status of a bonus rule."""
    rule = db.query(BonusRule).join(Product).filter(
        BonusRule.id == rule_id,
        Product.vendor_id == vendor_id
    ).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Bonus rule not found")
    rule.is_active = not rule.is_active
    db.commit()
    db.refresh(rule)
    return rule

def delete_bonus_rule(db: Session, rule_id: int, vendor_id: int):
    """Delete a bonus rule, ensuring it belongs to the vendor."""
    rule = db.query(BonusRule).join(Product).filter(
        BonusRule.id == rule_id,
        Product.vendor_id == vendor_id
    ).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Bonus rule not found")
    db.delete(rule)
    db.commit()
    return {"detail": "Bonus rule deleted"}
