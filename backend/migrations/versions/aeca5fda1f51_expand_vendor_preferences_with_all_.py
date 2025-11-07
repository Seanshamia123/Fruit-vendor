"""expand vendor preferences with all settings

Revision ID: aeca5fda1f51
Revises: 7bdecb2dca43
Create Date: 2025-11-07 23:37:35.208345

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'aeca5fda1f51'
down_revision: Union[str, Sequence[str], None] = '7bdecb2dca43'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add new preference columns
    op.add_column('vendor_preferences', sa.Column('display_mode', sa.String(50), nullable=True, server_default='charts'))
    op.add_column('vendor_preferences', sa.Column('language', sa.String(10), nullable=True, server_default='en'))

    # Alert settings
    op.add_column('vendor_preferences', sa.Column('alert_low_stock', sa.Boolean(), nullable=True, server_default='1'))
    op.add_column('vendor_preferences', sa.Column('alert_daily_summary', sa.Boolean(), nullable=True, server_default='1'))
    op.add_column('vendor_preferences', sa.Column('alert_rewards', sa.Boolean(), nullable=True, server_default='0'))
    op.add_column('vendor_preferences', sa.Column('alert_spoilage', sa.Boolean(), nullable=True, server_default='1'))

    # Pricing settings
    op.add_column('vendor_preferences', sa.Column('pricing_margin', sa.Integer(), nullable=True, server_default='25'))
    op.add_column('vendor_preferences', sa.Column('pricing_quick_pricing', sa.Boolean(), nullable=True, server_default='1'))
    op.add_column('vendor_preferences', sa.Column('pricing_auto_suggest', sa.Boolean(), nullable=True, server_default='0'))

    # Quick sale products and loyalty
    op.add_column('vendor_preferences', sa.Column('quick_sale_products', sa.JSON(), nullable=True))
    op.add_column('vendor_preferences', sa.Column('loyalty_enabled', sa.Boolean(), nullable=True, server_default='1'))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('vendor_preferences', 'loyalty_enabled')
    op.drop_column('vendor_preferences', 'quick_sale_products')
    op.drop_column('vendor_preferences', 'pricing_auto_suggest')
    op.drop_column('vendor_preferences', 'pricing_quick_pricing')
    op.drop_column('vendor_preferences', 'pricing_margin')
    op.drop_column('vendor_preferences', 'alert_spoilage')
    op.drop_column('vendor_preferences', 'alert_rewards')
    op.drop_column('vendor_preferences', 'alert_daily_summary')
    op.drop_column('vendor_preferences', 'alert_low_stock')
    op.drop_column('vendor_preferences', 'language')
    op.drop_column('vendor_preferences', 'display_mode')
