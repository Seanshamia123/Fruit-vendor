"""add location and created_at to vendors

Revision ID: 7bdecb2dca43
Revises: 921588b49d06
Create Date: 2025-11-07 23:28:40.307809

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7bdecb2dca43'
down_revision: Union[str, Sequence[str], None] = '921588b49d06'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('vendors', sa.Column('location', sa.String(255), nullable=True))
    op.add_column('vendors', sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('CURRENT_TIMESTAMP')))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('vendors', 'created_at')
    op.drop_column('vendors', 'location')
