"""Add google_analytics_property_key column to clients table

Revision ID: 41_add_google_analytics_property_key
Revises: 40_add_marketing_budget
Create Date: 2025-01-XX XX:XX:XX.XXXXXX

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '41_add_google_analytics_property_key'
down_revision = '40_add_marketing_budget'
branch_labels = None
depends_on = None


def upgrade():
    """Add google_analytics_property_key column to clients table"""
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    # Check if clients table exists
    if 'clients' not in inspector.get_table_names():
        print("Table 'clients' does not exist, skipping migration")
        return
    
    columns = {col['name']: col for col in inspector.get_columns('clients')}
    
    # Add google_analytics_property_key column if it doesn't exist
    if 'google_analytics_property_key' not in columns:
        print("Adding 'google_analytics_property_key' column to clients table...")
        op.add_column('clients',
                     sa.Column('google_analytics_property_key', sa.String(length=100), nullable=True))
        print("✓ Added 'google_analytics_property_key' column")
    else:
        print("'google_analytics_property_key' column already exists")


def downgrade():
    """Remove google_analytics_property_key column from clients table"""
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    if 'clients' not in inspector.get_table_names():
        print("Table 'clients' does not exist, skipping downgrade")
        return
    
    columns = {col['name']: col for col in inspector.get_columns('clients')}
    
    # Remove google_analytics_property_key column if it exists
    if 'google_analytics_property_key' in columns:
        print("Removing 'google_analytics_property_key' column from clients table...")
        op.drop_column('clients', 'google_analytics_property_key')
        print("✓ Removed 'google_analytics_property_key' column")

