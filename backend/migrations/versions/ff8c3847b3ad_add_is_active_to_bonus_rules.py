"""add_is_active_to_bonus_rules

Revision ID: ff8c3847b3ad
Revises: d314970b1ca3
Create Date: 2025-11-08 13:12:37.241266

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ff8c3847b3ad'
down_revision: Union[str, Sequence[str], None] = 'd314970b1ca3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('bonus_rules', sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('bonus_rules', 'is_active')
