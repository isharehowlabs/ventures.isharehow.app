"""Merge auth_providers and rise_journey branches

Revision ID: fc4d8a813095
Revises: 38_add_auth_providers, 20251204_add_rise_journey
Create Date: 2025-12-07 06:32:38.976473

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'fc4d8a813095'
down_revision = ('38_add_auth_providers', '20251204_add_rise_journey')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
