"""Add is_employee field and Support/Subscription models

Revision ID: 33_add_is_employee_support
Revises: 32_add_creative_dashboard
Create Date: 2024-11-27 01:40:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

# revision identifiers, used by Alembic.
revision = '33_add_is_employee_support'
down_revision = '32_add_creative_dashboard'
branch_labels = None
depends_on = None


def column_exists(table_name, column_name):
    """Check if a column exists in a table"""
    bind = op.get_bind()
    inspector = inspect(bind)
    columns = [col['name'] for col in inspector.get_columns(table_name)]
    return column_name in columns


def table_exists(table_name):
    """Check if a table exists in the database"""
    bind = op.get_bind()
    inspector = inspect(bind)
    return table_name in inspector.get_table_names()


def upgrade():
    # Add is_employee field to users table (only if it doesn't exist)
    if not column_exists('users', 'is_employee'):
        with op.batch_alter_table('users', schema=None) as batch_op:
            batch_op.add_column(sa.Column('is_employee', sa.Boolean(), nullable=False, server_default='false'))
            batch_op.create_index('ix_users_is_employee', ['is_employee'])
    else:
        print("Column 'is_employee' already exists in 'users' table, skipping")
        # Still try to create index if it doesn't exist
        try:
            # Check if index exists by querying pg_indexes
            bind = op.get_bind()
            result = bind.execute(sa.text("""
                SELECT 1 FROM pg_indexes 
                WHERE tablename = 'users' AND indexname = 'ix_users_is_employee'
            """))
            if not result.fetchone():
                op.create_index('ix_users_is_employee', 'users', ['is_employee'])
        except Exception:
            pass  # Index might already exist or error checking

    # Create support_requests table (only if it doesn't exist)
    if not table_exists('support_requests'):
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
    else:
        print("Table 'support_requests' already exists, skipping creation")

    # Create subscriptions table (only if it doesn't exist)
    if not table_exists('subscriptions'):
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
    else:
        print("Table 'subscriptions' already exists, skipping creation")


def downgrade():
    # Only drop if they exist
    if table_exists('subscriptions'):
        op.drop_table('subscriptions')
    if table_exists('support_requests'):
        op.drop_table('support_requests')
    if column_exists('users', 'is_employee'):
        with op.batch_alter_table('users', schema=None) as batch_op:
            try:
                batch_op.drop_index('ix_users_is_employee')
            except Exception:
                pass  # Index might not exist
            batch_op.drop_column('is_employee')

