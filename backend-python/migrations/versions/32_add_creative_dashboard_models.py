"""Add Creative Dashboard Models

Revision ID: 32_add_creative_dashboard
Revises: 31d306e1285f
Create Date: 2024-11-26 21:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy import inspect

# revision identifiers, used by Alembic.
revision = '32_add_creative_dashboard'
down_revision = '31d306e1285f'
branch_labels = None
depends_on = None


def table_exists(table_name):
    """Check if a table exists in the database"""
    bind = op.get_bind()
    inspector = inspect(bind)
    return table_name in inspector.get_table_names()


def upgrade():
    # Create clients table (only if it doesn't exist)
    if not table_exists('clients'):
        op.create_table('clients',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('company', sa.String(200), nullable=False),
        sa.Column('phone', sa.String(50), nullable=True),
        sa.Column('status', sa.String(20), nullable=False, server_default='pending'),
        sa.Column('tier', sa.String(50), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('tags', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now(), onupdate=sa.func.now()),
        )
        op.create_index('ix_clients_email', 'clients', ['email'])
    else:
        print("Table 'clients' already exists, skipping creation")

    # Create client_employee_assignments table (only if it doesn't exist)
    if not table_exists('client_employee_assignments'):
        op.create_table('client_employee_assignments',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('client_id', sa.String(36), sa.ForeignKey('clients.id', ondelete='CASCADE'), nullable=False),
        sa.Column('employee_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('employee_name', sa.String(200), nullable=True),
        sa.Column('assigned_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        )
        op.create_index('ix_client_employee_assignments_client_id', 'client_employee_assignments', ['client_id'])
        op.create_index('ix_client_employee_assignments_employee_id', 'client_employee_assignments', ['employee_id'])
    else:
        print("Table 'client_employee_assignments' already exists, skipping creation")

    # Create client_dashboard_connections table (only if it doesn't exist)
    if not table_exists('client_dashboard_connections'):
        op.create_table('client_dashboard_connections',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('client_id', sa.String(36), sa.ForeignKey('clients.id', ondelete='CASCADE'), nullable=False),
        sa.Column('dashboard_type', sa.String(50), nullable=False),
        sa.Column('enabled', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('connected_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        )
        op.create_index('ix_client_dashboard_connections_client_id', 'client_dashboard_connections', ['client_id'])
    else:
        print("Table 'client_dashboard_connections' already exists, skipping creation")


def downgrade():
    op.drop_table('client_dashboard_connections')
    op.drop_table('client_employee_assignments')
    op.drop_table('clients')

