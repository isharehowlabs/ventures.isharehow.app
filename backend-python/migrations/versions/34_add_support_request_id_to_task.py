"""Add support_request_id column to task table

Revision ID: 34_add_support_request_id
Revises: 33_add_is_employee_support
Create Date: 2024-11-29 15:40:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

# revision identifiers, used by Alembic.
revision = '34_add_support_request_id'
down_revision = '33_add_is_employee_support'
branch_labels = None
depends_on = None


def column_exists(table_name, column_name):
    """Check if a column exists in a table"""
    bind = op.get_bind()
    inspector = inspect(bind)
    columns = [col['name'] for col in inspector.get_columns(table_name)]
    return column_name in columns


def table_exists(table_name):
    """Check if a table exists in the database"""
    bind = op.get_bind()
    inspector = inspect(bind)
    return table_name in inspector.get_table_names()


def upgrade():
    # Add support_request_id column to task table (only if it doesn't exist)
    if not table_exists('task'):
        print("Table 'task' does not exist, skipping column addition")
        return
    
    if not column_exists('task', 'support_request_id'):
        with op.batch_alter_table('task', schema=None) as batch_op:
            # Add the column with foreign key constraint
            batch_op.add_column(sa.Column('support_request_id', sa.String(length=36), nullable=True))
            # Create foreign key constraint if support_requests table exists
            if table_exists('support_requests'):
                try:
                    batch_op.create_foreign_key(
                        'fk_task_support_request_id',
                        'support_requests',
                        ['support_request_id'],
                        ['id']
                    )
                except Exception as e:
                    print(f"Warning: Could not create foreign key constraint: {e}")
            # Create index for better query performance
            batch_op.create_index('ix_task_support_request_id', ['support_request_id'])
        print("Added 'support_request_id' column to 'task' table")
    else:
        print("Column 'support_request_id' already exists in 'task' table, skipping")
        # Still try to create index if it doesn't exist
        try:
            bind = op.get_bind()
            result = bind.execute(sa.text("""
                SELECT 1 FROM pg_indexes 
                WHERE tablename = 'task' AND indexname = 'ix_task_support_request_id'
            """))
            if not result.fetchone():
                op.create_index('ix_task_support_request_id', 'task', ['support_request_id'])
        except Exception as e:
            print(f"Warning: Could not create index: {e}")


def downgrade():
    # Remove support_request_id column from task table
    if table_exists('task') and column_exists('task', 'support_request_id'):
        with op.batch_alter_table('task', schema=None) as batch_op:
            try:
                batch_op.drop_index('ix_task_support_request_id')
            except Exception:
                pass  # Index might not exist
            try:
                batch_op.drop_constraint('fk_task_support_request_id', type_='foreignkey')
            except Exception:
                pass  # Foreign key might not exist
            batch_op.drop_column('support_request_id')
        print("Removed 'support_request_id' column from 'task' table")

