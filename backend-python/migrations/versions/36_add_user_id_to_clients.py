"""Add user_id column to clients table

Revision ID: 36_add_user_id_clients
Revises: 35_add_client_id_support
Create Date: 2025-12-06 20:15:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

# revision identifiers, used by Alembic.
revision = '36_add_user_id_clients'
down_revision = '35_add_client_id_support'
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
    # Add user_id column to clients table if it doesn't exist
    if table_exists('clients'):
        if not column_exists('clients', 'user_id'):
            print("Adding user_id column to clients table...")
            op.add_column('clients',
                sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True)
            )
            # Create index if it doesn't exist
            try:
                op.create_index('ix_clients_user_id', 'clients', ['user_id'])
            except Exception as e:
                print(f"Warning: Could not create index (may already exist): {e}")
            print("✓ user_id column added to clients table")
        else:
            print("Column 'user_id' already exists in 'clients' table, skipping")
    else:
        print("Table 'clients' does not exist, skipping column addition")


def downgrade():
    # Remove user_id column from clients table
    if table_exists('clients') and column_exists('clients', 'user_id'):
        try:
            op.drop_index('ix_clients_user_id', 'clients')
        except Exception:
            pass  # Index might not exist
        op.drop_column('clients', 'user_id')

