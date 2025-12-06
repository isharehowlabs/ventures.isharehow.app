"""Add client_id column to support_requests if missing

Revision ID: 35_add_client_id_support
Revises: 34_add_support_request_id
Create Date: 2025-12-06 19:55:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

# revision identifiers, used by Alembic.
revision = '35_add_client_id_support'
down_revision = '34_add_support_request_id'
branch_labels = None
depends_on = None


def column_exists(table_name, column_name):
    """Check if a column exists in a table"""
    bind = op.get_bind()
    inspector = inspect(bind)
    try:
        columns = [col['name'] for col in inspector.get_columns(table_name)]
        return column_name in columns
    except Exception:
        # Table doesn't exist
        return False


def table_exists(table_name):
    """Check if a table exists"""
    bind = op.get_bind()
    inspector = inspect(bind)
    return table_name in inspector.get_table_names()


def upgrade():
    # Add client_id column to support_requests table if it doesn't exist
    if table_exists('support_requests'):
        if not column_exists('support_requests', 'client_id'):
            print("Adding client_id column to support_requests table...")
            op.add_column('support_requests',
                sa.Column('client_id', sa.String(36), sa.ForeignKey('clients.id'), nullable=True)
            )
            # Create index if it doesn't exist
            try:
                op.create_index('ix_support_requests_client_id', 'support_requests', ['client_id'])
            except Exception as e:
                print(f"Warning: Could not create index (may already exist): {e}")
            print("✓ client_id column added to support_requests table")
        else:
            print("Column 'client_id' already exists in 'support_requests' table, skipping")
    else:
        print("Table 'support_requests' does not exist, skipping column addition")


def downgrade():
    # Remove client_id column from support_requests table
    if table_exists('support_requests') and column_exists('support_requests', 'client_id'):
        try:
            op.drop_index('ix_support_requests_client_id', 'support_requests')
        except Exception:
            pass  # Index might not exist
        op.drop_column('support_requests', 'client_id')

