"""ensure_support_requests_table_exists

Revision ID: 3cadba303cf8
Revises: bdf6dd63a652
Create Date: 2025-12-09 05:16:27.088704

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision = '3cadba303cf8'
down_revision = 'bdf6dd63a652'
branch_labels = None
depends_on = None


def table_exists(table_name):
    """Check if a table exists"""
    bind = op.get_bind()
    inspector = inspect(bind)
    return table_name in inspector.get_table_names()


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
    # Create support_requests table if it doesn't exist
    if not table_exists('support_requests'):
        print("Creating support_requests table...")
        op.create_table('support_requests',
            sa.Column('id', sa.String(36), primary_key=True),
            sa.Column('client_id', sa.String(36), sa.ForeignKey('clients.id'), nullable=True),
            sa.Column('subject', sa.String(255), nullable=False),
            sa.Column('description', sa.Text(), nullable=False),
            sa.Column('priority', sa.String(20), nullable=False, server_default='medium'),
            sa.Column('status', sa.String(20), nullable=False, server_default='open'),
            sa.Column('assigned_to', sa.String(200), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now(), onupdate=sa.func.now()),
        )
        # Create index if clients table exists
        try:
            op.create_index('ix_support_requests_client_id', 'support_requests', ['client_id'])
        except Exception as e:
            print(f"Warning: Could not create index (may already exist): {e}")
        print("✓ support_requests table created")
    else:
        print("Table 'support_requests' already exists")
        # Ensure assigned_to column exists (in case table was created before migration bdf6dd63a652)
        if not column_exists('support_requests', 'assigned_to'):
            print("Adding assigned_to column to existing support_requests table...")
            op.add_column('support_requests',
                sa.Column('assigned_to', sa.String(200), nullable=True)
            )
            print("✓ assigned_to column added")
        else:
            print("✓ assigned_to column already exists")


def downgrade():
    # Only drop if it exists
    if table_exists('support_requests'):
        print("Dropping support_requests table...")
        op.drop_table('support_requests')
        print("✓ support_requests table dropped")
