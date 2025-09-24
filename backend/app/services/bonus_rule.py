from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.bonus_rule import BonusRule
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

def update_bonus_rule(db: Session, rule_id: int, rule_data: BonusRuleUpdate):
    rule = get_bonus_rule(db, rule_id)
    for field, value in rule_data.dict(exclude_unset=True).items():
        setattr(rule, field, value)
    db.commit()
    db.refresh(rule)
    return rule

def delete_bonus_rule(db: Session, rule_id: int):
    rule = get_bonus_rule(db, rule_id)
    db.delete(rule)
    db.commit()
    return {"detail": "Bonus rule deleted"}
