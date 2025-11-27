"""Add is_employee field and Support/Subscription models

Revision ID: 33_add_is_employee_support
Revises: 32_add_creative_dashboard
Create Date: 2024-11-27 01:40:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '33_add_is_employee_support'
down_revision = '32_add_creative_dashboard'
branch_labels = None
depends_on = None


def upgrade():
    # Add is_employee field to users table
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('is_employee', sa.Boolean(), nullable=False, server_default='false'))
        batch_op.create_index('ix_users_is_employee', ['is_employee'])

    # Create support_requests table
    op.create_table('support_requests',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('client_id', sa.String(36), sa.ForeignKey('clients.id'), nullable=True),
        sa.Column('client_name', sa.String(200), nullable=True),
        sa.Column('subject', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('priority', sa.String(20), nullable=False, server_default='medium'),
        sa.Column('status', sa.String(20), nullable=False, server_default='open'),
        sa.Column('assigned_to', sa.String(200), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_support_requests_client_id', 'support_requests', ['client_id'])

    # Create subscriptions table
    op.create_table('subscriptions',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), nullable=False),
        sa.Column('tier', sa.String(50), nullable=False),
        sa.Column('billing_cycle', sa.String(20), nullable=False),
        sa.Column('status', sa.String(20), nullable=False, server_default='active'),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('currency', sa.String(10), nullable=False, server_default='USD'),
        sa.Column('payment_method', sa.String(50), nullable=True),
        sa.Column('payment_method_id', sa.String(255), nullable=True),
        sa.Column('started_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('expires_at', sa.DateTime(), nullable=True),
        sa.Column('cancelled_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_subscriptions_user_id', 'subscriptions', ['user_id'])


def downgrade():
    op.drop_table('subscriptions')
    op.drop_table('support_requests')
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_index('ix_users_is_employee')
        batch_op.drop_column('is_employee')

