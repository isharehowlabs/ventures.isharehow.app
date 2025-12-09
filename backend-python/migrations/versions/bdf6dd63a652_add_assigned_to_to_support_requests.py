"""add_assigned_to_to_support_requests

Revision ID: bdf6dd63a652
Revises: 41_add_ga_property_key
Create Date: 2025-12-09 05:09:42.628984

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision = 'bdf6dd63a652'
down_revision = '41_add_ga_property_key'
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
    # Add assigned_to column to support_requests table if it doesn't exist
    if table_exists('support_requests'):
        if not column_exists('support_requests', 'assigned_to'):
            print("Adding assigned_to column to support_requests table...")
            op.add_column('support_requests',
                sa.Column('assigned_to', sa.String(200), nullable=True)
            )
            print("✓ assigned_to column added to support_requests table")
        else:
            print("Column 'assigned_to' already exists in 'support_requests' table, skipping")
    else:
        print("Table 'support_requests' does not exist, skipping column addition")


def downgrade():
    # Remove assigned_to column from support_requests table
    if table_exists('support_requests') and column_exists('support_requests', 'assigned_to'):
        print("Removing assigned_to column from support_requests table...")
        op.drop_column('support_requests', 'assigned_to')
        print("✓ assigned_to column removed from support_requests table")
    else:
        print("Column 'assigned_to' does not exist in 'support_requests' table, skipping removal")
