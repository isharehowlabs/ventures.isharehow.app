"""add auth providers and payment fields

Revision ID: 38_add_auth_providers
Revises: 37_replace_patreon_with_shopify
Create Date: 2025-12-07 01:06:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '38_add_auth_providers'
down_revision = '37_replace_patreon_with_shopify'
branch_labels = None
depends_on = None


def upgrade():
    # Check if columns already exist before adding them
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('users')]
    
    # Add google_id column if it doesn't exist
    if 'google_id' not in columns:
        op.add_column('users', sa.Column('google_id', sa.String(length=100), nullable=True))
        op.create_index(op.f('ix_users_google_id'), 'users', ['google_id'], unique=True)
    
    # Add auth_provider column if it doesn't exist
    if 'auth_provider' not in columns:
        op.add_column('users', sa.Column('auth_provider', sa.String(length=20), server_default='email', nullable=False))
    
    # Add ETH payment verification fields
    if 'eth_payment_verified' not in columns:
        op.add_column('users', sa.Column('eth_payment_verified', sa.Boolean(), server_default='false', nullable=False))
    
    if 'eth_payment_amount' not in columns:
        op.add_column('users', sa.Column('eth_payment_amount', sa.Numeric(precision=18, scale=8), nullable=True))
    
    if 'eth_payment_tx_hash' not in columns:
        op.add_column('users', sa.Column('eth_payment_tx_hash', sa.String(length=66), nullable=True))
        op.create_index(op.f('ix_users_eth_payment_tx_hash'), 'users', ['eth_payment_tx_hash'], unique=False)
    
    if 'eth_payment_date' not in columns:
        op.add_column('users', sa.Column('eth_payment_date', sa.DateTime(), nullable=True))
    
    # Make password_hash nullable (for wallet-only and OAuth accounts)
    try:
        op.alter_column('users', 'password_hash',
                       existing_type=sa.VARCHAR(length=255),
                       nullable=True)
    except Exception as e:
        print(f"Note: Could not alter password_hash nullable status: {e}")
        # Column might already be nullable
    
    # Add trial tracking field
    if 'trial_start_date' not in columns:
        op.add_column('users', sa.Column('trial_start_date', sa.DateTime(), nullable=True))


def downgrade():
    # Remove added columns
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('users')]
    
    if 'eth_payment_date' in columns:
        op.drop_column('users', 'eth_payment_date')
    
    if 'eth_payment_tx_hash' in columns:
        op.drop_index(op.f('ix_users_eth_payment_tx_hash'), table_name='users')
        op.drop_column('users', 'eth_payment_tx_hash')
    
    if 'eth_payment_amount' in columns:
        op.drop_column('users', 'eth_payment_amount')
    
    if 'eth_payment_verified' in columns:
        op.drop_column('users', 'eth_payment_verified')
    
    if 'auth_provider' in columns:
        op.drop_column('users', 'auth_provider')
    
    if 'google_id' in columns:
        op.drop_index(op.f('ix_users_google_id'), table_name='users')
        op.drop_column('users', 'google_id')
    
    # Remove trial tracking field
    if 'trial_start_date' in columns:
        op.drop_column('users', 'trial_start_date')
