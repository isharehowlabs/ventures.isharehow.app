"""Add budget and deadline columns to clients table

Revision ID: 43_add_budget_deadline
Revises: 41_add_google_analytics_property_key
Create Date: 2025-12-12 05:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision = '43_add_budget_deadline'
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
        return False


def upgrade():
    """Add budget and deadline columns to clients table"""
    conn = op.get_bind()
    inspector = inspect(conn)
    
    # Check if clients table exists
    if 'clients' not in inspector.get_table_names():
        print("Table 'clients' does not exist, skipping migration")
        return
    
    # Add budget column if it doesn't exist
    if not column_exists('clients', 'budget'):
        print("Adding 'budget' column to clients table...")
        op.add_column('clients',
                     sa.Column('budget', sa.Numeric(10, 2), nullable=True, server_default='0'))
        print("✓ Added 'budget' column")
    else:
        print("'budget' column already exists")
    
    # Add deadline column if it doesn't exist
    if not column_exists('clients', 'deadline'):
        print("Adding 'deadline' column to clients table...")
        op.add_column('clients',
                     sa.Column('deadline', sa.DateTime(), nullable=True))
        print("✓ Added 'deadline' column")
    else:
        print("'deadline' column already exists")


def downgrade():
    """Remove budget and deadline columns from clients table"""
    conn = op.get_bind()
    inspector = inspect(conn)
    
    if 'clients' not in inspector.get_table_names():
        print("Table 'clients' does not exist, skipping downgrade")
        return
    
    # Remove budget column if it exists
    if column_exists('clients', 'budget'):
        print("Removing 'budget' column from clients table...")
        op.drop_column('clients', 'budget')
        print("✓ Removed 'budget' column")
    
    # Remove deadline column if it exists
    if column_exists('clients', 'deadline'):
        print("Removing 'deadline' column from clients table...")
        op.drop_column('clients', 'deadline')
        print("✓ Removed 'deadline' column")
