"""Initial baseline migration

Revision ID: 001_initial_baseline
Revises: 
Create Date: 2025-11-21 05:40:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision = '001_initial_baseline'
down_revision = None
branch_labels = None
depends_on = None


def table_exists(table_name):
    """Check if a table exists in the database"""
    bind = op.get_bind()
    inspector = inspect(bind)
    return table_name in inspector.get_table_names()


def upgrade():
    """
    Create all tables for the wellness application.
    This is the baseline migration capturing the current schema.
    Skips tables that already exist to handle databases with existing tables.
    """
    # Create task table (only if it doesn't exist)
    if not table_exists('task'):
        op.create_table('task',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('hyperlinks', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
        )
    else:
        print("Table 'task' already exists, skipping creation")

    # Create user_profiles table (only if it doesn't exist)
    if not table_exists('user_profiles'):
        op.create_table('user_profiles',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('name', sa.String(length=200), nullable=True),
        sa.Column('avatar_url', sa.Text(), nullable=True),
        sa.Column('patreon_id', sa.String(length=50), nullable=True),
        sa.Column('membership_tier', sa.String(length=50), nullable=True),
        sa.Column('is_paid_member', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
        )
    else:
        print("Table 'user_profiles' already exists, skipping creation")

    # Create aura_progress table (only if it doesn't exist)
    if not table_exists('aura_progress'):
        op.create_table('aura_progress',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('aura_type', sa.String(length=50), nullable=False),
        sa.Column('value', sa.Integer(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['user_profiles.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'aura_type', name='unique_user_aura')
        )
    else:
        print("Table 'aura_progress' already exists, skipping creation")

    # Create wellness_activities table (only if it doesn't exist)
    if not table_exists('wellness_activities'):
        op.create_table('wellness_activities',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('activity_type', sa.String(length=100), nullable=False),
        sa.Column('activity_name', sa.String(length=200), nullable=False),
        sa.Column('completed', sa.Boolean(), nullable=True),
        sa.Column('completion_date', sa.DateTime(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['user_profiles.id'], ),
        sa.PrimaryKeyConstraint('id')
        )
    else:
        print("Table 'wellness_activities' already exists, skipping creation")

    # Create wellness_goals table (only if it doesn't exist)
    if not table_exists('wellness_goals'):
        op.create_table('wellness_goals',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category', sa.String(length=50), nullable=True),
        sa.Column('target_value', sa.Integer(), nullable=True),
        sa.Column('current_progress', sa.Integer(), nullable=True),
        sa.Column('deadline', sa.DateTime(), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['user_profiles.id'], ),
        sa.PrimaryKeyConstraint('id')
        )
    else:
        print("Table 'wellness_goals' already exists, skipping creation")

    # Create wellness_achievements table (only if it doesn't exist)
    if not table_exists('wellness_achievements'):
        op.create_table('wellness_achievements',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.String(length=36), nullable=False),
        sa.Column('achievement_key', sa.String(length=100), nullable=False),
        sa.Column('unlocked_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['user_profiles.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'achievement_key', name='unique_user_achievement')
        )
    else:
        print("Table 'wellness_achievements' already exists, skipping creation")


def downgrade():
    """
    Drop all tables.
    """
    op.drop_table('wellness_achievements')
    op.drop_table('wellness_goals')
    op.drop_table('wellness_activities')
    op.drop_table('aura_progress')
    op.drop_table('user_profiles')
    op.drop_table('task')
