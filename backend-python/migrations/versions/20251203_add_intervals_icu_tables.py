"""Add Intervals.icu integration tables

Revision ID: add_intervals_icu
Revises: previous_revision
Create Date: 2025-12-03

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql
from sqlalchemy import inspect

# revision identifiers
revision = 'add_intervals_icu'
down_revision = '34_add_support_request_id'  # Chain after support_request_id migration
branch_labels = None
depends_on = None


def table_exists(table_name):
    """Check if a table exists in the database"""
    bind = op.get_bind()
    inspector = inspect(bind)
    return table_name in inspector.get_table_names()


def upgrade():
    # Create user_api_keys table
    if not table_exists('user_api_keys'):
        op.create_table(
            'user_api_keys',
            sa.Column('id', sa.String(36), primary_key=True),
            sa.Column('user_id', sa.String(36), sa.ForeignKey('user_profiles.id'), nullable=False),
            sa.Column('service_name', sa.String(50), nullable=False),
            sa.Column('api_key_encrypted', sa.Text, nullable=False),
            sa.Column('created_at', sa.DateTime, default=sa.func.now()),
            sa.Column('updated_at', sa.DateTime, default=sa.func.now(), onupdate=sa.func.now()),
            sa.UniqueConstraint('user_id', 'service_name', name='unique_user_service')
        )
    else:
        print("Table 'user_api_keys' already exists, skipping creation")
    
    # Create intervals_activity_data table
    if not table_exists('intervals_activity_data'):
        op.create_table(
            'intervals_activity_data',
            sa.Column('id', sa.String(36), primary_key=True),
            sa.Column('user_id', sa.String(36), sa.ForeignKey('user_profiles.id'), nullable=False),
            sa.Column('activity_id', sa.String(100), nullable=False),  # Intervals.icu activity ID
            sa.Column('activity_date', sa.Date, nullable=False),
            sa.Column('activity_name', sa.String(200)),
            sa.Column('activity_type', sa.String(50)),
            sa.Column('rpe', sa.Integer),  # Rate of Perceived Exertion (1-10)
            sa.Column('feel', sa.Integer),  # How you felt (1-10)
            sa.Column('duration', sa.Integer),  # Duration in seconds
            sa.Column('distance', sa.Float),  # Distance in meters
            sa.Column('power_data', sa.JSON),  # Power metrics
            sa.Column('hr_data', sa.JSON),  # Heart rate metrics  
            sa.Column('synced_at', sa.DateTime, default=sa.func.now()),
            sa.UniqueConstraint('user_id', 'activity_id', name='unique_user_activity')
        )
    else:
        print("Table 'intervals_activity_data' already exists, skipping creation")
    
    # Create intervals_menstrual_data table
    if not table_exists('intervals_menstrual_data'):
        op.create_table(
            'intervals_menstrual_data',
            sa.Column('id', sa.String(36), primary_key=True),
            sa.Column('user_id', sa.String(36), sa.ForeignKey('user_profiles.id'), nullable=False),
            sa.Column('cycle_date', sa.Date, nullable=False),
            sa.Column('phase', sa.String(50)),  # menstruation, follicular, ovulation, luteal
            sa.Column('symptoms', sa.JSON),
            sa.Column('opt_in', sa.Boolean, default=False),
            sa.Column('synced_at', sa.DateTime, default=sa.func.now()),
            sa.UniqueConstraint('user_id', 'cycle_date', name='unique_user_cycle_date')
        )
    else:
        print("Table 'intervals_menstrual_data' already exists, skipping creation")
    
    # Create wellness metrics table for other wellness data from Intervals.icu
    if not table_exists('intervals_wellness_metrics'):
        op.create_table(
            'intervals_wellness_metrics',
            sa.Column('id', sa.String(36), primary_key=True),
            sa.Column('user_id', sa.String(36), sa.ForeignKey('user_profiles.id'), nullable=False),
            sa.Column('metric_date', sa.Date, nullable=False),
            sa.Column('hrv', sa.Float),  # Heart Rate Variability
            sa.Column('resting_hr', sa.Integer),  # Resting heart rate
            sa.Column('weight', sa.Float),
            sa.Column('sleep_seconds', sa.Integer),
            sa.Column('sleep_quality', sa.Integer),
            sa.Column('fatigue', sa.Integer),
            sa.Column('mood', sa.Integer),
            sa.Column('stress', sa.Integer),
            sa.Column('soreness', sa.Integer),
            sa.Column('synced_at', sa.DateTime, default=sa.func.now()),
            sa.UniqueConstraint('user_id', 'metric_date', name='unique_user_metric_date')
        )
    else:
        print("Table 'intervals_wellness_metrics' already exists, skipping creation")


def downgrade():
    op.drop_table('intervals_wellness_metrics')
    op.drop_table('intervals_menstrual_data')
    op.drop_table('intervals_activity_data')
    op.drop_table('user_api_keys')
