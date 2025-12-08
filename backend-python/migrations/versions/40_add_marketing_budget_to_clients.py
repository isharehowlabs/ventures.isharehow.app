"""Add marketing_budget column to clients table

Revision ID: 40_add_marketing_budget
Revises: 39_company_opt_phone_req
Create Date: 2025-01-XX XX:XX:XX.XXXXXX

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '40_add_marketing_budget'
down_revision = '39_company_opt_phone_req'
branch_labels = None
depends_on = None


def upgrade():
    """Add marketing_budget column to clients table"""
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    # Check if clients table exists
    if 'clients' not in inspector.get_table_names():
        print("Table 'clients' does not exist, skipping migration")
        return
    
    columns = {col['name']: col for col in inspector.get_columns('clients')}
    
    # Add marketing_budget column if it doesn't exist
    if 'marketing_budget' not in columns:
        print("Adding 'marketing_budget' column to clients table...")
        op.add_column('clients',
                     sa.Column('marketing_budget', sa.String(length=500), nullable=True))
        print("✓ Added 'marketing_budget' column")
    else:
        print("'marketing_budget' column already exists")


def downgrade():
    """Remove marketing_budget column from clients table"""
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    if 'clients' not in inspector.get_table_names():
        print("Table 'clients' does not exist, skipping downgrade")
        return
    
    columns = {col['name']: col for col in inspector.get_columns('clients')}
    
    # Remove marketing_budget column if it exists
    if 'marketing_budget' in columns:
        print("Removing 'marketing_budget' column from clients table...")
        op.drop_column('clients', 'marketing_budget')
        print("✓ Removed 'marketing_budget' column")

