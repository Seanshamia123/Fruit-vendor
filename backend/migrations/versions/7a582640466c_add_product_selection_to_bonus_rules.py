"""Add product selection to bonus rules

Revision ID: 7a582640466c
Revises: 0a82b67a0134
Create Date: [your date here]

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '7a582640466c'
down_revision = '0a82b67a0134'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create the association table for bonus_rule_product
    op.create_table(
        'bonus_rule_product',
        sa.Column('bonus_rule_id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['bonus_rule_id'], ['bonus_rules.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('bonus_rule_id', 'product_id')
    )


def downgrade() -> None:
    # Drop the association table
    op.drop_table('bonus_rule_product')