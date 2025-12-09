"""add_user_id_to_support_requests_if_missing

Revision ID: 8b118eafbc0c
Revises: 3cadba303cf8
Create Date: 2025-12-09 05:33:02.596502

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision = '8b118eafbc0c'
down_revision = '3cadba303cf8'
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


def table_exists(table_name):
    """Check if a table exists"""
    bind = op.get_bind()
    inspector = inspect(bind)
    return table_name in inspector.get_table_names()


def upgrade():
    # Add user_id column to support_requests table if it doesn't exist
    # If it exists but is NOT NULL, make it nullable for backward compatibility
    if table_exists('support_requests'):
        if not column_exists('support_requests', 'user_id'):
            print("Adding user_id column to support_requests table...")
            op.add_column('support_requests',
                sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True)
            )
            # Create index if it doesn't exist
            try:
                op.create_index('ix_support_requests_user_id', 'support_requests', ['user_id'])
            except Exception as e:
                print(f"Warning: Could not create index (may already exist): {e}")
            print("✓ user_id column added to support_requests table")
        else:
            print("Column 'user_id' already exists in 'support_requests' table")
            # Check if it's NOT NULL and alter it to be nullable (for backward compatibility)
            try:
                bind = op.get_bind()
                result = bind.execute(sa.text("""
                    SELECT is_nullable 
                    FROM information_schema.columns 
                    WHERE table_name = 'support_requests' AND column_name = 'user_id'
                """))
                row = result.fetchone()
                if row and row[0] == 'NO':
                    print("Making user_id column nullable (for backward compatibility)...")
                    # First, set any NULL values to a default (if any exist, though there shouldn't be)
                    # Then make it nullable
                    op.alter_column('support_requests', 'user_id', nullable=True)
                    print("✓ user_id column is now nullable")
                else:
                    print("✓ user_id column is already nullable")
            except Exception as e:
                print(f"Warning: Could not check/alter user_id column: {e}")
                print(f"  Error details: {str(e)}")
                print("  Note: Column exists but may need manual adjustment")
    else:
        print("Table 'support_requests' does not exist, skipping column addition")


def downgrade():
    # Remove user_id column from support_requests table
    if table_exists('support_requests') and column_exists('support_requests', 'user_id'):
        print("Removing user_id column from support_requests table...")
        try:
            op.drop_index('ix_support_requests_user_id', 'support_requests')
        except Exception:
            pass  # Index might not exist
        op.drop_column('support_requests', 'user_id')
        print("✓ user_id column removed from support_requests table")
    else:
        print("Column 'user_id' does not exist in 'support_requests' table, skipping removal")
