"""add_onboarding_fields_to_vendor_and_preferences

Revision ID: d314970b1ca3
Revises: aeca5fda1f51
Create Date: 2025-11-08 10:59:23.771950

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd314970b1ca3'
down_revision: Union[str, Sequence[str], None] = 'aeca5fda1f51'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add onboarding_completed to vendors table
    op.add_column('vendors', sa.Column('onboarding_completed', sa.Boolean(), nullable=False, server_default='0'))

    # Add onboarding fields to vendor_preferences table
    op.add_column('vendor_preferences', sa.Column('business_type', sa.String(length=100), nullable=True))
    op.add_column('vendor_preferences', sa.Column('products_of_interest', sa.JSON(), nullable=True))
    op.add_column('vendor_preferences', sa.Column('challenges', sa.JSON(), nullable=True))
    op.add_column('vendor_preferences', sa.Column('goals', sa.JSON(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    # Remove onboarding fields from vendor_preferences table
    op.drop_column('vendor_preferences', 'goals')
    op.drop_column('vendor_preferences', 'challenges')
    op.drop_column('vendor_preferences', 'products_of_interest')
    op.drop_column('vendor_preferences', 'business_type')

    # Remove onboarding_completed from vendors table
    op.drop_column('vendors', 'onboarding_completed')
