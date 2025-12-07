"""Make company optional and phone required in clients table

Revision ID: 39_make_company_optional_phone_required
Revises: 38_add_auth_providers
Create Date: 2025-01-XX XX:XX:XX.XXXXXX

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '39_make_company_optional_phone_required'
down_revision = '38_add_auth_providers'
branch_labels = None
depends_on = None


def upgrade():
    """Make company nullable and phone NOT NULL in clients table"""
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    # Check if clients table exists
    if 'clients' not in inspector.get_table_names():
        print("Table 'clients' does not exist, skipping migration")
        return
    
    columns = {col['name']: col for col in inspector.get_columns('clients')}
    
    # Make company nullable
    if 'company' in columns:
        if not columns['company']['nullable']:
            print("Making 'company' column nullable...")
            op.alter_column('clients', 'company',
                          existing_type=sa.String(length=200),
                          nullable=True)
            print("✓ Made 'company' column nullable")
        else:
            print("'company' column is already nullable")
    else:
        print("Warning: 'company' column does not exist")
    
    # Make phone NOT NULL
    if 'phone' in columns:
        if columns['phone']['nullable']:
            # First, set phone for any existing NULL values to a default
            # This is important to avoid constraint violations
            conn.execute(sa.text("""
                UPDATE clients 
                SET phone = 'N/A' 
                WHERE phone IS NULL OR phone = ''
            """))
            conn.commit()
            
            print("Making 'phone' column NOT NULL...")
            op.alter_column('clients', 'phone',
                          existing_type=sa.String(length=50),
                          nullable=False)
            print("✓ Made 'phone' column NOT NULL")
        else:
            print("'phone' column is already NOT NULL")
    else:
        print("Warning: 'phone' column does not exist")


def downgrade():
    """Revert: make company NOT NULL and phone nullable"""
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    if 'clients' not in inspector.get_table_names():
        print("Table 'clients' does not exist, skipping downgrade")
        return
    
    columns = {col['name']: col for col in inspector.get_columns('clients')}
    
    # Make company NOT NULL (set default for NULL values first)
    if 'company' in columns:
        if columns['company']['nullable']:
            conn.execute(sa.text("""
                UPDATE clients 
                SET company = 'N/A' 
                WHERE company IS NULL
            """))
            conn.commit()
            
            print("Making 'company' column NOT NULL...")
            op.alter_column('clients', 'company',
                          existing_type=sa.String(length=200),
                          nullable=False)
            print("✓ Made 'company' column NOT NULL")
    
    # Make phone nullable
    if 'phone' in columns:
        if not columns['phone']['nullable']:
            print("Making 'phone' column nullable...")
            op.alter_column('clients', 'phone',
                          existing_type=sa.String(length=50),
                          nullable=True)
            print("✓ Made 'phone' column nullable")

