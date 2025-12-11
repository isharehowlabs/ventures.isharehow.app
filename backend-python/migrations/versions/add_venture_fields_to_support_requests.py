"""Add venture fields to support_requests table

Revision ID: add_venture_fields
Revises: 32_add_creative_dashboard
Create Date: 2025-12-11

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime
from sqlalchemy import inspect, text

# revision identifiers, used by Alembic.
revision = 'add_venture_fields'
down_revision = '32_add_creative_dashboard'
branch_labels = None
depends_on = None

def column_exists(table_name, column_name):
    """Check if a column exists in a table"""
    bind = op.get_bind()
    inspector = inspect(bind)
    columns = [col['name'] for col in inspector.get_columns(table_name)]
    return column_name in columns

def upgrade():
    # Add new columns to support_requests table only if they don't exist
    # (They may have been added by the direct script)
    
    if not column_exists('support_requests', 'budget'):
        op.add_column('support_requests', sa.Column('budget', sa.Numeric(10, 2), nullable=True, server_default='0'))
    
    if not column_exists('support_requests', 'spent'):
        op.add_column('support_requests', sa.Column('spent', sa.Numeric(10, 2), nullable=True, server_default='0'))
    
    if not column_exists('support_requests', 'delivery_date'):
        op.add_column('support_requests', sa.Column('delivery_date', sa.DateTime(), nullable=True))
    
    if not column_exists('support_requests', 'start_date'):
        op.add_column('support_requests', sa.Column('start_date', sa.DateTime(), nullable=True, server_default=sa.text('CURRENT_TIMESTAMP')))
    
    if not column_exists('support_requests', 'progress'):
        op.add_column('support_requests', sa.Column('progress', sa.Integer(), nullable=True, server_default='0'))

def downgrade():
    # Remove columns if needed to rollback
    with op.batch_alter_table('support_requests', schema=None) as batch_op:
        batch_op.drop_column('progress')
        batch_op.drop_column('start_date')
        batch_op.drop_column('delivery_date')
        batch_op.drop_column('spent')
        batch_op.drop_column('budget')
