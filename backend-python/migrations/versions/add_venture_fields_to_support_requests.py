"""Add venture fields to support_requests table

Revision ID: add_venture_fields
Revises: 32_add_creative_dashboard
Create Date: 2025-12-11

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers, used by Alembic.
revision = 'add_venture_fields'
down_revision = '32_add_creative_dashboard'
branch_labels = None
depends_on = None

def upgrade():
    # Add new columns to support_requests table
    with op.batch_alter_table('support_requests', schema=None) as batch_op:
        batch_op.add_column(sa.Column('budget', sa.Numeric(10, 2), nullable=True, server_default='0'))
        batch_op.add_column(sa.Column('spent', sa.Numeric(10, 2), nullable=True, server_default='0'))
        batch_op.add_column(sa.Column('delivery_date', sa.DateTime, nullable=True))
        batch_op.add_column(sa.Column('start_date', sa.DateTime, nullable=True, server_default=sa.text('CURRENT_TIMESTAMP')))
        batch_op.add_column(sa.Column('progress', sa.Integer, nullable=True, server_default='0'))

def downgrade():
    # Remove columns if needed to rollback
    with op.batch_alter_table('support_requests', schema=None) as batch_op:
        batch_op.drop_column('progress')
        batch_op.drop_column('start_date')
        batch_op.drop_column('delivery_date')
        batch_op.drop_column('spent')
        batch_op.drop_column('budget')
