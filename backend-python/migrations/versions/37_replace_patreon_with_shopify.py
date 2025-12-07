"""Replace Patreon fields with Shopify subscription fields

Revision ID: 37_replace_patreon_with_shopify
Revises: 36_add_user_id_clients
Create Date: 2025-12-06 21:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

# revision identifiers, used by Alembic.
revision = '37_replace_patreon_with_shopify'
down_revision = '36_add_user_id_clients'
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
    if not table_exists('users'):
        print("Table 'users' does not exist, skipping migration")
        return
    
    print("Migrating users table: Replacing Patreon fields with Shopify subscription fields...")
    
    # Add new Shopify subscription columns
    new_columns = [
        ('has_subscription_update', sa.Boolean(), False),
        ('subscription_update_active', sa.Boolean(), False),
        ('shopify_customer_id', sa.String(50), True),
        ('bold_subscription_id', sa.String(50), True),
    ]
    
    for col_name, col_type, nullable in new_columns:
        if not column_exists('users', col_name):
            print(f"  Adding column: {col_name}")
            op.add_column('users', sa.Column(col_name, col_type, nullable=nullable))
        else:
            print(f"  Column {col_name} already exists, skipping")
    
    # Create indexes for new columns
    try:
        if not column_exists('users', 'shopify_customer_id') or not any(
            idx['name'] == 'ix_users_shopify_customer_id' 
            for idx in inspect(op.get_bind()).get_indexes('users')
        ):
            op.create_index('ix_users_shopify_customer_id', 'users', ['shopify_customer_id'])
    except Exception as e:
        print(f"  Warning: Could not create index for shopify_customer_id: {e}")
    
    try:
        if not column_exists('users', 'bold_subscription_id') or not any(
            idx['name'] == 'ix_users_bold_subscription_id' 
            for idx in inspect(op.get_bind()).get_indexes('users')
        ):
            op.create_index('ix_users_bold_subscription_id', 'users', ['bold_subscription_id'])
    except Exception as e:
        print(f"  Warning: Could not create index for bold_subscription_id: {e}")
    
    # Note: We're keeping the old Patreon columns for now (deprecated) to avoid data loss
    # They can be removed in a future migration after data migration is complete
    print("  ✓ Migration complete. Old Patreon columns kept as deprecated (will be removed later)")
    print("  ✓ New Shopify subscription columns added")


def downgrade():
    if not table_exists('users'):
        return
    
    # Remove new columns
    columns_to_remove = [
        'has_subscription_update',
        'subscription_update_active',
        'shopify_customer_id',
        'bold_subscription_id',
    ]
    
    for col_name in columns_to_remove:
        if column_exists('users', col_name):
            try:
                op.drop_index(f'ix_users_{col_name}', 'users')
            except Exception:
                pass
            op.drop_column('users', col_name)
            print(f"  Removed column: {col_name}")

