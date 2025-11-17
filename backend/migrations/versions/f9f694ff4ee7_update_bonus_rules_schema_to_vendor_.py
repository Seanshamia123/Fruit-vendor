"""update_bonus_rules_schema_to_vendor_level

Revision ID: f9f694ff4ee7
Revises: ff8c3847b3ad
Create Date: 2025-11-16 22:23:14.001859

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f9f694ff4ee7'
down_revision: Union[str, Sequence[str], None] = 'ff8c3847b3ad'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema to vendor-level bonus rules."""
    # Drop old table (product-level bonus rules)
    op.drop_table('bonus_rules')

    # Create new vendor-level bonus rules table
    op.create_table(
        'bonus_rules',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('vendor_id', sa.Integer(), nullable=False),
        sa.Column('rule_name', sa.String(length=200), nullable=False),
        sa.Column('condition_type', sa.String(length=50), nullable=False),
        sa.Column('condition_value', sa.Float(), nullable=False),
        sa.Column('bonus_type', sa.String(length=50), nullable=False),
        sa.Column('bonus_value', sa.Float(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['vendor_id'], ['vendors.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_bonus_rules_id'), 'bonus_rules', ['id'], unique=False)


def downgrade() -> None:
    """Downgrade schema back to product-level bonus rules."""
    # Drop new table
    op.drop_index(op.f('ix_bonus_rules_id'), table_name='bonus_rules')
    op.drop_table('bonus_rules')

    # Recreate old product-level bonus rules table
    op.create_table(
        'bonus_rules',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('rule_type', sa.String(length=50), nullable=False),
        sa.Column('threshold_qty', sa.Float(), nullable=False),
        sa.Column('bonus_qty', sa.Float(), nullable=True),
        sa.Column('bonus_discount', sa.Float(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_bonus_rules_id'), 'bonus_rules', ['id'], unique=False)
