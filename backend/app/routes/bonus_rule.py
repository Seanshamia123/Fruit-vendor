from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.schemas.bonus_rule import BonusRuleCreate, BonusRuleOut, BonusRuleUpdate
from app.services import bonus_rule as bonus_rule_service

router = APIRouter(prefix="/bonus-rules", tags=["Bonus Rules"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=BonusRuleOut)
def create_bonus_rule(rule: BonusRuleCreate, db: Session = Depends(get_db)):
    return bonus_rule_service.create_bonus_rule(db, rule)

@router.get("/{rule_id}", response_model=BonusRuleOut)
def get_bonus_rule(rule_id: int, db: Session = Depends(get_db)):
    return bonus_rule_service.get_bonus_rule(db, rule_id)

@router.get("/product/{product_id}", response_model=list[BonusRuleOut])
def list_bonus_rules(product_id: int, db: Session = Depends(get_db)):
    return bonus_rule_service.list_bonus_rules(db, product_id)

@router.put("/{rule_id}", response_model=BonusRuleOut)
def update_bonus_rule(rule_id: int, rule: BonusRuleUpdate, db: Session = Depends(get_db)):
    return bonus_rule_service.update_bonus_rule(db, rule_id, rule)

@router.delete("/{rule_id}")
def delete_bonus_rule(rule_id: int, db: Session = Depends(get_db)):
    return bonus_rule_service.delete_bonus_rule(db, rule_id)
