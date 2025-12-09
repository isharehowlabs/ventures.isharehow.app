"""add_tier_to_subscriptions

Revision ID: 42_add_tier_to_subscriptions
Revises: 8b118eafbc0c
Create Date: 2025-12-09 06:55:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision = '42_add_tier_to_subscriptions'
down_revision = '8b118eafbc0c'
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
    """Add tier column to subscriptions table if it doesn't exist"""
    if table_exists('subscriptions'):
        if not column_exists('subscriptions', 'tier'):
            print("Adding 'tier' column to 'subscriptions' table...")
            # Add column as nullable first
            op.add_column('subscriptions',
                sa.Column('tier', sa.String(50), nullable=True)
            )
            # Set default value for existing rows
            op.execute("UPDATE subscriptions SET tier = 'starter' WHERE tier IS NULL")
            # Make column non-nullable with default
            op.alter_column('subscriptions', 'tier',
                existing_type=sa.String(50),
                nullable=False,
                server_default='starter'
            )
            print("✓ Added 'tier' column with default value 'starter'")
        else:
            print("'tier' column already exists in 'subscriptions' table, skipping addition.")
    else:
        print("Table 'subscriptions' does not exist, skipping 'tier' column addition.")


def downgrade():
    """Remove tier column from subscriptions table"""
    if table_exists('subscriptions') and column_exists('subscriptions', 'tier'):
        print("Removing 'tier' column from 'subscriptions' table...")
        op.drop_column('subscriptions', 'tier')
        print("✓ Removed 'tier' column")

