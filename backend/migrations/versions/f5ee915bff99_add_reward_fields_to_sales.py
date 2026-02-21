"""Add reward tracking fields to sales table

Revision ID: f5ee915bff99
Revises: 75626e99a036
Create Date: 2024-XX-XX XX:XX:XX

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision = 'f5ee915bff99'
down_revision = '75626e99a036'
branch_labels = None
depends_on = None


def upgrade():
    """Add reward tracking columns to sales table."""
    # Get the current database connection to check existing columns
    conn = op.get_bind()
    inspector = inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('sales')]
    
    # Add new columns only if they don't already exist
    if 'original_price' not in columns:
        op.add_column('sales', sa.Column('original_price', sa.Float(), nullable=True))
    
    if 'discount_amount' not in columns:
        op.add_column('sales', sa.Column('discount_amount', sa.Float(), server_default='0.0', nullable=False))
    
    if 'discount_type' not in columns:
        op.add_column('sales', sa.Column('discount_type', sa.String(50), nullable=True))
    
    if 'applied_bonus_rule_id' not in columns:
        op.add_column('sales', sa.Column('applied_bonus_rule_id', sa.Integer(), nullable=True))
    
    # Add foreign key constraint if it doesn't exist
    try:
        # Check if foreign key already exists
        constraints = inspector.get_foreign_keys('sales')
        fk_exists = any(fk['name'] == 'fk_sales_bonus_rule' for fk in constraints)
        
        if not fk_exists:
            op.create_foreign_key(
                'fk_sales_bonus_rule',
                'sales',
                'bonus_rules',
                ['applied_bonus_rule_id'],
                ['id']
            )
    except Exception as e:
        print(f"Warning: Could not create foreign key: {e}")
    
    # Update existing records to set original_price = total_price where null
    op.execute("UPDATE sales SET original_price = total_price WHERE original_price IS NULL")


def downgrade():
    """Remove reward tracking columns from sales table."""
    # Drop foreign key constraint
    try:
        op.drop_constraint('fk_sales_bonus_rule', 'sales', type_='foreignkey')
    except Exception as e:
        print(f"Warning: Could not drop foreign key: {e}")
    
    # Drop columns
    op.drop_column('sales', 'applied_bonus_rule_id')
    op.drop_column('sales', 'discount_type')
    op.drop_column('sales', 'discount_amount')
    op.drop_column('sales', 'original_price')