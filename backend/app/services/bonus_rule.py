from sqlalchemy.orm import Session
from sqlalchemy import and_
from fastapi import HTTPException
from app.models.bonus_rule import BonusRule
from app.models.product import Product
from app.schemas.bonus_rule import BonusRuleCreate, BonusRuleUpdate

def create_bonus_rule(db: Session, rule: BonusRuleCreate, vendor_id: int):
    """Create a new bonus rule for the vendor."""
    # Verify all products belong to this vendor
    if rule.product_ids:
        products = db.query(Product).filter(
            and_(
                Product.id.in_(rule.product_ids),
                Product.vendor_id == vendor_id
            )
        ).all()
        
        if len(products) != len(rule.product_ids):
            raise HTTPException(status_code=400, detail="Some products do not belong to your vendor")
    
    rule_data = rule.dict(exclude={'product_ids'})
    rule_data['vendor_id'] = vendor_id
    new_rule = BonusRule(**rule_data)
    
    # Associate products
    if rule.product_ids:
        products = db.query(Product).filter(Product.id.in_(rule.product_ids)).all()
        new_rule.products = products
    
    db.add(new_rule)
    db.commit()
    db.refresh(new_rule)
    return new_rule

def get_bonus_rule(db: Session, rule_id: int):
    """Get a bonus rule by ID."""
    rule = db.query(BonusRule).filter(BonusRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Bonus rule not found")
    return rule

def list_all_vendor_bonus_rules(db: Session, vendor_id: int):
    """List all bonus rules for a vendor."""
    return db.query(BonusRule).filter(BonusRule.vendor_id == vendor_id).all()

def list_bonus_rules(db: Session, product_id: int):
    """List all bonus rules for a specific product."""
    rules = db.query(BonusRule).join(
        BonusRule.products
    ).filter(Product.id == product_id).all()
    
    return rules

def update_bonus_rule(db: Session, rule_id: int, rule_data: BonusRuleUpdate, vendor_id: int):
    """Update a bonus rule, ensuring it belongs to the vendor."""
    rule = db.query(BonusRule).filter(
        BonusRule.id == rule_id,
        BonusRule.vendor_id == vendor_id
    ).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Bonus rule not found")

    # Handle product_ids separately
    update_dict = rule_data.dict(exclude_unset=True, exclude={'product_ids'})
    
    # Update regular fields
    for field, value in update_dict.items():
        setattr(rule, field, value)
    
    # Update products if provided
    if rule_data.product_ids is not None:
        if rule_data.product_ids:
            # Verify all products belong to this vendor
            products = db.query(Product).filter(
                and_(
                    Product.id.in_(rule_data.product_ids),
                    Product.vendor_id == vendor_id
                )
            ).all()
            
            if len(products) != len(rule_data.product_ids):
                raise HTTPException(status_code=400, detail="Some products do not belong to your vendor")
            
            rule.products = products
        else:
            # Clear products if empty list provided
            rule.products = []
    
    db.commit()
    db.refresh(rule)
    return rule

def toggle_bonus_rule(db: Session, rule_id: int, vendor_id: int):
    """Toggle the is_active status of a bonus rule."""
    rule = db.query(BonusRule).filter(
        BonusRule.id == rule_id,
        BonusRule.vendor_id == vendor_id
    ).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Bonus rule not found")
    rule.is_active = not rule.is_active
    db.commit()
    db.refresh(rule)
    return rule

def delete_bonus_rule(db: Session, rule_id: int, vendor_id: int):
    """Delete a bonus rule, ensuring it belongs to the vendor."""
    rule = db.query(BonusRule).filter(
        BonusRule.id == rule_id,
        BonusRule.vendor_id == vendor_id
    ).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Bonus rule not found")
    db.delete(rule)
    db.commit()
    return {"detail": "Bonus rule deleted"}

def format_bonus_rule_response(db_rule: BonusRule) -> dict:
    """Format bonus rule with product IDs for response."""
    product_ids = [product.id for product in db_rule.products] if db_rule.products else []
    
    return {
        "id": db_rule.id,
        "vendor_id": db_rule.vendor_id,
        "rule_name": db_rule.rule_name,
        "condition_type": db_rule.condition_type,
        "condition_value": db_rule.condition_value,
        "bonus_type": db_rule.bonus_type,
        "bonus_value": db_rule.bonus_value,
        "product_ids": product_ids,
        "is_active": db_rule.is_active,
        "created_at": db_rule.created_at,
    }