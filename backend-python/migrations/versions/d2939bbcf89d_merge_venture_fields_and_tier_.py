"""merge venture fields and tier subscriptions

Revision ID: d2939bbcf89d
Revises: 42_add_tier_to_subscriptions, add_venture_fields
Create Date: 2025-12-11 06:36:47.533863

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd2939bbcf89d'
down_revision = ('42_add_tier_to_subscriptions', 'add_venture_fields')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
