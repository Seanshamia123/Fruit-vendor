# backend/app/services/sale.py
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from app.models.sale import Sale
from app.models.bonus_rule import BonusRule
from app.models.product import Product
from app.schemas.sale import SaleCreate, SaleUpdate
from decimal import Decimal


def calculate_applicable_rewards(
    db: Session, 
    product_id: int, 
    quantity: int, 
    unit_price: float,
    vendor_id: int
) -> Dict:
    """
    Calculate applicable rewards for a sale based on active bonus rules.
    Returns dict with discount_amount, discount_type, and applied_rule_id.
    """
    # Get active bonus rules for this product
    bonus_rules = db.query(BonusRule).join(
        BonusRule.products
    ).filter(
        Product.id == product_id,
        BonusRule.vendor_id == vendor_id,
        BonusRule.is_active == True
    ).all()
    
    if not bonus_rules:
        return {
            'discount_amount': 0,
            'discount_type': None,
            'applied_rule_id': None,
            'applied_rule_name': None
        }
    
    # Calculate sale metrics
    total_value = quantity * unit_price
    
    best_discount = 0
    best_rule = None
    
    for rule in bonus_rules:
        rule_applies = False
        
        # Check if condition is met
        if rule.condition_type == 'sales_value':
            if total_value >= rule.condition_value:
                rule_applies = True
        elif rule.condition_type == 'quantity':
            if quantity >= rule.condition_value:
                rule_applies = True
        elif rule.condition_type == 'visit_frequency':
            # For visit frequency, we'd need additional logic to track visits
            # For now, we'll skip this condition type in automatic application
            pass
        
        if rule_applies:
            discount = 0
            if rule.bonus_type == 'percentage':
                discount = total_value * (rule.bonus_value / 100)
            elif rule.bonus_type == 'fixed':
                discount = rule.bonus_value
            elif rule.bonus_type == 'free_item':
                # For free item, calculate value of free items
                discount = rule.bonus_value * unit_price
            
            # Keep track of best discount
            if discount > best_discount:
                best_discount = discount
                best_rule = rule
    
    if best_rule:
        return {
            'discount_amount': float(best_discount),
            'discount_type': best_rule.bonus_type,
            'applied_rule_id': best_rule.id,
            'applied_rule_name': best_rule.rule_name
        }
    
    return {
        'discount_amount': 0,
        'discount_type': None,
        'applied_rule_id': None,
        'applied_rule_name': None
    }


def create_sale(db: Session, vendor_id: int, sale: SaleCreate) -> Sale:
    """Create a single sale with automatic reward calculation"""
    # Calculate applicable rewards
    reward_info = calculate_applicable_rewards(
        db=db,
        product_id=sale.product_id,
        quantity=sale.quantity,
        unit_price=sale.unit_price,
        vendor_id=vendor_id
    )
    
    # Calculate final price after discount
    original_total = sale.total_price
    discount_amount = reward_info['discount_amount']
    final_total = max(0, original_total - discount_amount)
    
    db_sale = Sale(
        vendor_id=vendor_id,
        product_id=sale.product_id,
        quantity=sale.quantity,
        unit_price=sale.unit_price,
        total_price=final_total,
        original_price=original_total,
        discount_amount=discount_amount,
        discount_type=reward_info['discount_type'],
        applied_bonus_rule_id=reward_info['applied_rule_id'],
        reference_no=sale.reference_no,
        payment_type=sale.payment_type,
        cart_id=sale.cart_id,
    )
    db.add(db_sale)
    db.commit()
    db.refresh(db_sale)
    return db_sale


def complete_sale_with_rewards(
    db: Session,
    vendor_id: int,
    lines: List,
    method: str,
    total_discount: float,
    final_total: float,
    reference_no: Optional[str] = None,
    phone_number: Optional[str] = None,
    mpesa_code: Optional[str] = None,
    cart_id: Optional[str] = None,
) -> List[Sale]:
    """
    Complete a full sale with multiple line items.
    Creates individual sale records for each line item.
    Rewards have already been calculated on the frontend, but we recalculate
    to ensure server-side validation.
    """
    created_sales = []
    total_discount_recalculated = 0
    
    for line in lines:
        # Recalculate rewards server-side for validation
        product_id = int(line.itemId) if isinstance(line.itemId, str) else line.itemId
        
        reward_info = calculate_applicable_rewards(
            db=db,
            product_id=product_id,
            quantity=line.quantity,
            unit_price=line.unitPrice,
            vendor_id=vendor_id
        )
        
        # Use recalculated discount (server-side validation)
        discount_amount = reward_info['discount_amount']
        original_subtotal = line.subtotal
        final_subtotal = max(0, original_subtotal - discount_amount)
        
        db_sale = Sale(
            vendor_id=vendor_id,
            product_id=product_id,
            quantity=line.quantity,
            unit_price=line.unitPrice,
            total_price=final_subtotal,
            original_price=original_subtotal,
            discount_amount=discount_amount,
            discount_type=reward_info['discount_type'],
            applied_bonus_rule_id=reward_info['applied_rule_id'],
            reference_no=reference_no,
            payment_type=method,
            cart_id=cart_id,
        )
        
        db.add(db_sale)
        created_sales.append(db_sale)
        total_discount_recalculated += discount_amount
    
    # Commit all sales at once
    db.commit()
    
    # Refresh to get IDs
    for sale in created_sales:
        db.refresh(sale)
    
    return created_sales


def get_sales_by_vendor(db: Session, vendor_id: int) -> List[Sale]:
    """Get all sales for a vendor"""
    return db.query(Sale).filter(Sale.vendor_id == vendor_id).all()


def get_sale(db: Session, sale_id: int) -> Optional[Sale]:
    """Get a specific sale by ID"""
    return db.query(Sale).filter(Sale.id == sale_id).first()


def update_sale(db: Session, sale_id: int, sale_update: SaleUpdate) -> Optional[Sale]:
    """Update a sale"""
    db_sale = get_sale(db, sale_id)
    if not db_sale:
        return None
    update_data = sale_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_sale, key, value)
    db.commit()
    db.refresh(db_sale)
    return db_sale


def delete_sale(db: Session, sale_id: int) -> bool:
    """Delete a sale"""
    db_sale = get_sale(db, sale_id)
    if not db_sale:
        return False
    db.delete(db_sale)
    db.commit()
    return True