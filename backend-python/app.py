from flask import Flask, request, jsonify, redirect, session, url_for
from flask_socketio import SocketIO, emit, join_room
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt, set_access_cookies, unset_jwt_cookies
from datetime import datetime, timedelta
import os
import uuid
from functools import wraps
import json
from dotenv import load_dotenv
import requests
import bcrypt

# Try to import pywebpush for push notifications (optional)
try:
    from pywebpush import webpush, WebPushException
    WEBPUSH_AVAILABLE = True
except ImportError:
    WEBPUSH_AVAILABLE = False
    print("Warning: pywebpush not available. Push notifications will be disabled.")

# Try to import web3.py for ENS (Ethereum Name Service) integration
try:
    from web3 import Web3
    from ens import ENS
    WEB3_AVAILABLE = True
    print("✓ Web3.py and ENS module loaded successfully")
except ImportError:
    WEB3_AVAILABLE = False
    print("Warning: web3.py not available. ENS integration will be disabled.")
    Web3 = None
    ENS = None

# Load environment variables
load_dotenv()

# Configure Gemini API
GOOGLE_AI_API_KEY = os.environ.get('GOOGLE_AI_API_KEY')

# Validate Gemini API key configuration at startup
if not GOOGLE_AI_API_KEY:
    print("=" * 80)
    print("WARNING: GOOGLE_AI_API_KEY is not set in environment variables!")
    print("Gemini chat functionality will be disabled.")
    print("To enable Gemini chat, set GOOGLE_AI_API_KEY in your environment variables.")
    print("=" * 80)
else:
    # Validate API key format (basic check - should start with AIza)
    if not GOOGLE_AI_API_KEY.startswith('AIza'):
        print("=" * 80)
        print("WARNING: GOOGLE_AI_API_KEY format may be incorrect!")
        print("Google AI API keys typically start with 'AIza'.")
        print("Please verify your API key is correct.")
        print("=" * 80)
    else:
        print("✓ Gemini API key loaded successfully")

# Initialize Flask app
app = Flask(__name__)

# Session configuration
app.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET_KEY', 'dev-secret-key-change-in-production')

# Validate SECRET_KEY at startup
if app.config['SECRET_KEY'] == 'dev-secret-key-change-in-production':
    print("=" * 80)
    print("WARNING: Using default SECRET_KEY! This is a CRITICAL SECURITY VULNERABILITY!")
    print("Set FLASK_SECRET_KEY environment variable immediately!")
    print("=" * 80)

# Session cookie configuration - REMOVED: Using JWT-only authentication
# Session-based auth removed to eliminate conflicts and errors

# Database configuration - make it optional to handle import errors
# Convert postgresql:// to postgresql+psycopg:// for psycopg3 support
database_url = os.environ.get('DATABASE_URL', 'postgresql://localhost/ventures')
if database_url.startswith('postgresql://'):
    database_url = database_url.replace('postgresql://', 'postgresql+psycopg://', 1)
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Use engine options compatible with the chosen driver
engine_options = {
    'pool_pre_ping': True,
}
# Only pass connect_timeout for non-SQLite drivers
if not app.config['SQLALCHEMY_DATABASE_URI'].startswith('sqlite'):
    engine_options['connect_args'] = {'connect_timeout': 5}

app.config['SQLALCHEMY_ENGINE_OPTIONS'] = engine_options

try:
    db = SQLAlchemy(app)
    DB_AVAILABLE = True
    migrate = Migrate(app, db)
    print(f"✓ SQLAlchemy initialized")
    print(f"  DATABASE_URL: {'Set' if os.environ.get('DATABASE_URL') else 'Not set'}")
except Exception as e:
    print(f"✗ Warning: Database initialization failed: {e}")
    print("Database features will be disabled. This may be due to:")
    print("1. Missing psycopg package or Python 3.13 compatibility issue")
    print("2. Invalid DATABASE_URL")
    print("3. Database server not accessible")
    print(f"  DATABASE_URL: {'Set' if os.environ.get('DATABASE_URL') else 'Not set'}")
    if os.environ.get('DATABASE_URL'):
        print(f"  DATABASE_URL value: {os.environ.get('DATABASE_URL')[:50]}...")
    # Create a dummy db object to prevent crashes
    db = None
    DB_AVAILABLE = False

# Configure CORS to allow credentials (cookies)
# Note: flask-cors handles all CORS headers automatically, don't add them manually
allowed_origins = ['https://ventures.isharehow.app']
if os.environ.get('FLASK_ENV') != 'production':
    allowed_origins.append('http://localhost:5000')
    allowed_origins.append('http://localhost:3000')

# Initialize Socket.IO with same CORS origins as Flask-CORS
# When using withCredentials: true on client, cannot use "*" - must specify exact origins
socketio = SocketIO(
    app, 
    cors_allowed_origins=allowed_origins,
    cors_credentials=True,
    allow_upgrades=True,
    transports=['websocket', 'polling']
)

CORS(app, 
     origins=allowed_origins,
     supports_credentials=True,
     allow_headers=['Content-Type', 'Authorization', 'X-Intervals-API-Key'])

# Initialize JWT Manager (flask-jwt-extended)
jwt = JWTManager(app)

# JWT Configuration
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET', app.config['SECRET_KEY'])
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)
app.config['JWT_TOKEN_LOCATION'] = ['headers', 'cookies']
app.config['JWT_COOKIE_SECURE'] = True
app.config['JWT_COOKIE_HTTPONLY'] = True
app.config['JWT_COOKIE_SAMESITE'] = 'None'
app.config['JWT_COOKIE_DOMAIN'] = '.ventures.isharehow.app'
app.config['JWT_COOKIE_CSRF_PROTECT'] = False  # Set to True if you add CSRF protection later

# Frontend URL helper - for redirects to frontend domain
def get_frontend_url():
    """Get the frontend URL from environment or default to production"""
    frontend_url = os.environ.get('FRONTEND_URL', 'https://ventures.isharehow.app')
    return frontend_url.rstrip('/')

# Web3/ENS Configuration
ENS_DOMAIN = 'isharehow.eth'  # Your ENS domain
ENS_PROVIDER_URL = os.environ.get('ENS_PROVIDER_URL', 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY')
ENS_PRIVATE_KEY = os.environ.get('ENS_PRIVATE_KEY')  # For setting records (optional)

# Initialize Web3 and ENS if available
w3 = None
ens = None
if WEB3_AVAILABLE:
    try:
        # Connect to Ethereum mainnet via Infura or other provider
        w3 = Web3(Web3.HTTPProvider(ENS_PROVIDER_URL))
        if w3.is_connected():
            ens = ENS.from_web3(w3)
            print(f"✓ Web3 connected to Ethereum mainnet")
            print(f"✓ ENS module initialized for domain: {ENS_DOMAIN}")
        else:
            print("Warning: Web3 connection failed. ENS features will be limited.")
    except Exception as e:
        print(f"Warning: Failed to initialize Web3/ENS: {e}")
        print("ENS features will be disabled.")

# ENS Helper Functions
def username_to_ens_name(username: str) -> str:
    """Convert username to ENS domain format: username.isharehow.eth"""
    if not username:
        return None
    # Normalize username (lowercase, no spaces)
    normalized = username.lower().strip().replace(' ', '')
    return f"{normalized}.{ENS_DOMAIN}"

def resolve_ens_to_address(ens_name: str) -> str:
    """Resolve ENS name to Ethereum address"""
    if not WEB3_AVAILABLE or not ens or not ens_name:
        return None
    try:
        address = ens.address(ens_name)
        if address:
            return address.lower()  # Return checksummed address
        return None
    except Exception as e:
        print(f"Error resolving ENS name {ens_name}: {e}")
        return None

def get_ens_content_hash(ens_name: str) -> str:
    """Get content hash (IPFS hash) from ENS resolver"""
    if not WEB3_AVAILABLE or not ens or not ens_name:
        return None
    try:
        resolver = ens.resolver(ens_name)
        if resolver:
            content_hash = resolver.caller.contenthash(ens_name)
            if content_hash and content_hash != b'':
                # Convert bytes to hex string
                return '0x' + content_hash.hex()
        return None
    except Exception as e:
        print(f"Error getting content hash for {ens_name}: {e}")
        return None

def set_ens_content_hash(ens_name: str, ipfs_hash: str, private_key: str = None) -> bool:
    """Set content hash (IPFS hash) in ENS resolver"""
    if not WEB3_AVAILABLE or not ens or not ens_name:
        return False
    if not private_key:
        private_key = ENS_PRIVATE_KEY
    if not private_key:
        print("Warning: No private key provided for setting ENS content hash")
        return False
    try:
        # This requires the account to own the ENS name
        # Implementation would use web3.py to set the contenthash record
        # For now, return False as this requires wallet integration
        print(f"Setting content hash for {ens_name} requires wallet integration")
        return False
    except Exception as e:
        print(f"Error setting content hash for {ens_name}: {e}")
        return False

def resolve_or_create_ens(user_id: int, username: str) -> dict:
    """Resolve ENS name for user or create if doesn't exist"""
    if not username:
        return {'ens_name': None, 'crypto_address': None, 'content_hash': None}
    
    ens_name = username_to_ens_name(username)
    if not ens_name:
        return {'ens_name': None, 'crypto_address': None, 'content_hash': None}
    
    # Try to resolve address
    crypto_address = resolve_ens_to_address(ens_name)
    
    # Get content hash if available
    content_hash = get_ens_content_hash(ens_name)
    
    return {
        'ens_name': ens_name,
        'crypto_address': crypto_address,
        'content_hash': content_hash
    }

# Task model - only define if database is available
if DB_AVAILABLE:
    class Task(db.Model):
        id = db.Column(db.String(36), primary_key=True)
        title = db.Column(db.String(200), nullable=False)
        description = db.Column(db.Text)
        hyperlinks = db.Column(db.Text)  # JSON string of array
        status = db.Column(db.String(20), default='pending')
        support_request_id = db.Column(db.String(36), db.ForeignKey('support_requests.id'), nullable=True, index=True)  # Link to support request
        created_at = db.Column(db.DateTime, default=datetime.utcnow)
        updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

        def to_dict(self):
            return {
                'id': self.id,
                'title': self.title,
                'description': self.description,
                'hyperlinks': json.loads(self.hyperlinks) if self.hyperlinks else [],
                'status': self.status,
                'supportRequestId': self.support_request_id,
                'createdAt': self.created_at.isoformat(),
                'updatedAt': self.updated_at.isoformat()
            }

    # Authentication User Model
    class User(db.Model):
        __tablename__ = 'users'
        
        id = db.Column(db.Integer, primary_key=True)
        username = db.Column(db.String(80), unique=True, nullable=True, index=True)
        email = db.Column(db.String(120), unique=True, nullable=True, index=True)
        password_hash = db.Column(db.String(255), nullable=True)
        patreon_id = db.Column(db.String(50), unique=True, nullable=True, index=True)
        access_token = db.Column(db.String(500), nullable=True)  # Increased length for tokens
        refresh_token = db.Column(db.String(500), nullable=True)
        membership_paid = db.Column(db.Boolean, default=False, nullable=False)  # Renamed from membership_active
        is_employee = db.Column(db.Boolean, default=False, nullable=False, index=True)  # Employee flag for Creative Dashboard
        is_admin = db.Column(db.Boolean, default=False, nullable=False, index=True)  # Admin flag for system administration
        last_checked = db.Column(db.DateTime, nullable=True)
        token_expires_at = db.Column(db.DateTime, nullable=True)
        patreon_connected = db.Column(db.Boolean, default=False, nullable=False)
        # Web3/ENS fields
        ens_name = db.Column(db.String(255), unique=True, nullable=True, index=True)  # e.g., "isharehow.isharehow.eth"
        crypto_address = db.Column(db.String(42), nullable=True, index=True)  # Ethereum address (0x...)
        content_hash = db.Column(db.String(255), nullable=True)  # IPFS content hash
        created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
        updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
        
        def set_password(self, password):
            """Hash and set password"""
            self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        def check_password(self, password):
            """Check if provided password matches hash"""
            if not self.password_hash:
                return False
            return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
        
        def to_dict(self):
            # Use ENS name as ID if available, otherwise fall back to patreon_id, username, or id
            user_id = self.ens_name or self.patreon_id or self.username or str(self.id)
            return {
                'id': user_id,
                'ensName': self.ens_name,  # Web3 domain: username.isharehow.eth
                'cryptoAddress': self.crypto_address,  # Ethereum address
                'contentHash': self.content_hash,  # IPFS content hash
                'patreonId': self.patreon_id,
                'username': self.username,
                'email': self.email,
                'membershipPaid': self.membership_paid,  # Updated field name
                'isPaidMember': self.membership_paid,  # Alias for consistency
                'isEmployee': self.is_employee,
                'isAdmin': self.is_admin,
                'patreonConnected': self.patreon_connected or (self.patreon_id is not None),  # Auto-computed
                'lastChecked': self.last_checked.isoformat() if self.last_checked else None
            }

    # Notification Model
    class Notification(db.Model):
        __tablename__ = 'notifications'
        
        id = db.Column(db.Integer, primary_key=True)
        user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
        type = db.Column(db.String(50), nullable=False, index=True)  # live-update, board, timer, admin, twitch, system
        title = db.Column(db.String(255), nullable=False)
        message = db.Column(db.Text, nullable=False)
        read = db.Column(db.Boolean, default=False, nullable=False, index=True)
        notification_metadata = db.Column(db.Text, nullable=True)  # JSON stored as text (renamed from metadata to avoid SQLAlchemy conflict)
        created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
        updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
        
        # Relationship
        user = db.relationship('User', backref='notifications')
        
        def to_dict(self):
            metadata_dict = {}
            if self.notification_metadata:
                try:
                    metadata_dict = json.loads(self.notification_metadata)
                except:
                    pass
            return {
                'id': str(self.id),
                'userId': str(self.user_id),
                'type': self.type,
                'title': self.title,
                'message': self.message,
                'read': self.read,
                'timestamp': self.created_at.isoformat() if self.created_at else None,
                'metadata': metadata_dict
            }

    # Push Subscription Model
    class PushSubscription(db.Model):
        __tablename__ = 'push_subscriptions'
        
        id = db.Column(db.Integer, primary_key=True)
        user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
        endpoint = db.Column(db.Text, nullable=False)
        p256dh = db.Column(db.Text, nullable=False)
        auth = db.Column(db.Text, nullable=False)
        created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
        updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
        
        # Relationship
        user = db.relationship('User', backref='push_subscriptions')
        
        def to_dict(self):
            return {
                'endpoint': self.endpoint,
                'keys': {
                    'p256dh': self.p256dh,
                    'auth': self.auth,
                }
            }

    # Wellness Models
    class UserProfile(db.Model):
        __tablename__ = 'user_profiles'
        id = db.Column(db.String(36), primary_key=True)  # ENS name (username.isharehow.eth) or Patreon user ID
        email = db.Column(db.String(255), unique=True)
        name = db.Column(db.String(200))
        avatar_url = db.Column(db.Text)
        patreon_id = db.Column(db.String(50), nullable=True)
        membership_tier = db.Column(db.String(50))
        is_paid_member = db.Column(db.Boolean, default=False)
        is_employee = db.Column(db.Boolean, default=False)  # Employee status (renamed from isTeamMember)
        membership_renewal_date = db.Column(db.DateTime, nullable=True)  # From Patreon API
        lifetime_support_amount = db.Column(db.Numeric(10, 2), nullable=True)  # From Patreon API (in dollars)
        # Web3/ENS fields
        ens_name = db.Column(db.String(255), unique=True, nullable=True, index=True)  # e.g., "isharehow.isharehow.eth"
        crypto_address = db.Column(db.String(42), nullable=True, index=True)  # Ethereum address (0x...)
        content_hash = db.Column(db.String(255), nullable=True)  # IPFS content hash
        created_at = db.Column(db.DateTime, default=datetime.utcnow)
        updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

        def to_dict(self):
            # Use ENS name as ID if available
            profile_id = self.ens_name or self.id
            return {
                'id': profile_id,
                'ensName': self.ens_name,  # Web3 domain: username.isharehow.eth
                'cryptoAddress': self.crypto_address,  # Ethereum address
                'contentHash': self.content_hash,  # IPFS content hash
                'email': self.email,
                'name': self.name,
                'avatarUrl': self.avatar_url,
                'patreonId': self.patreon_id,
                'membershipTier': self.membership_tier,
                'isPaidMember': self.is_paid_member,
                'isEmployee': self.is_employee,  # Renamed from isTeamMember
                'membershipRenewalDate': self.membership_renewal_date.isoformat() if self.membership_renewal_date else None,
                'lifetimeSupportAmount': float(self.lifetime_support_amount) if self.lifetime_support_amount else None,
                'createdAt': self.created_at.isoformat() if self.created_at else None,
                'updatedAt': self.updated_at.isoformat() if self.updated_at else None
            }

    class AuraProgress(db.Model):
        __tablename__ = 'aura_progress'
        __table_args__ = (db.UniqueConstraint('user_id', 'aura_type', name='unique_user_aura'),)
        
        id = db.Column(db.String(36), primary_key=True)
        user_id = db.Column(db.String(36), db.ForeignKey('user_profiles.id'), nullable=False)
        aura_type = db.Column(db.String(50), nullable=False)  # Physical/Mental/Spiritual/Nutrition/Sleep/Stress/Energy
        value = db.Column(db.Integer, default=0)  # 0-100
        updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

        def to_dict(self):
            return {
                'id': self.id,
                'userId': self.user_id,
                'auraType': self.aura_type,
                'value': self.value,
                'updatedAt': self.updated_at.isoformat() if self.updated_at else None
            }

    class WellnessActivity(db.Model):
        __tablename__ = 'wellness_activities'
        
        id = db.Column(db.String(36), primary_key=True)
        user_id = db.Column(db.String(36), db.ForeignKey('user_profiles.id'), nullable=False)
        activity_type = db.Column(db.String(100), nullable=False)  # wellness_lab/rise_cycling/spiritual_journey
        activity_name = db.Column(db.String(200), nullable=False)
        completed = db.Column(db.Boolean, default=True)
        completion_date = db.Column(db.DateTime, default=datetime.utcnow)
        notes = db.Column(db.Text)
        created_at = db.Column(db.DateTime, default=datetime.utcnow)

        def to_dict(self):
            return {
                'id': self.id,
                'userId': self.user_id,
                'activityType': self.activity_type,
                'activityName': self.activity_name,
                'completed': self.completed,
                'completionDate': self.completion_date.isoformat() if self.completion_date else None,
                'notes': self.notes,
                'createdAt': self.created_at.isoformat() if self.created_at else None
            }

    class WellnessGoal(db.Model):
        __tablename__ = 'wellness_goals'
        
        id = db.Column(db.String(36), primary_key=True)
        user_id = db.Column(db.String(36), db.ForeignKey('user_profiles.id'), nullable=False)
        title = db.Column(db.String(200), nullable=False)
        description = db.Column(db.Text)
        category = db.Column(db.String(50))
        target_value = db.Column(db.Integer)
        current_progress = db.Column(db.Integer, default=0)
        deadline = db.Column(db.DateTime, nullable=True)
        status = db.Column(db.String(20), default='active')  # active/completed/abandoned
        created_at = db.Column(db.DateTime, default=datetime.utcnow)
        updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

        def to_dict(self):
            return {
                'id': self.id,
                'userId': self.user_id,
                'title': self.title,
                'description': self.description,
                'category': self.category,
                'targetValue': self.target_value,
                'currentProgress': self.current_progress,
                'deadline': self.deadline.isoformat() if self.deadline else None,
                'status': self.status,
                'createdAt': self.created_at.isoformat() if self.created_at else None,
                'updatedAt': self.updated_at.isoformat() if self.updated_at else None
            }

    class WellnessAchievement(db.Model):
        __tablename__ = 'wellness_achievements'
        __table_args__ = (db.UniqueConstraint('user_id', 'achievement_key', name='unique_user_achievement'),)
        
        id = db.Column(db.String(36), primary_key=True)
        user_id = db.Column(db.String(36), db.ForeignKey('user_profiles.id'), nullable=False)
        achievement_key = db.Column(db.String(100), nullable=False)
        unlocked_at = db.Column(db.DateTime, default=datetime.utcnow)

        def to_dict(self):
            return {
                'id': self.id,
                'userId': self.user_id,
                'achievementKey': self.achievement_key,
                'unlockedAt': self.unlocked_at.isoformat() if self.unlocked_at else None
            }


    class UserAPIKey(db.Model):
        __tablename__ = 'user_api_keys'
        __table_args__ = (db.UniqueConstraint('user_id', 'service_name', name='unique_user_service'),)
        
        id = db.Column(db.String(36), primary_key=True)
        user_id = db.Column(db.String(36), db.ForeignKey('user_profiles.id'), nullable=False)
        service_name = db.Column(db.String(50), nullable=False)
        api_key_encrypted = db.Column(db.Text, nullable=False)
        created_at = db.Column(db.DateTime, default=datetime.utcnow)
        updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

        def to_dict(self):
            return {
                'id': self.id,
                'serviceName': self.service_name,
                'hasKey': True,  # Never expose the actual key
                'createdAt': self.created_at.isoformat() if self.created_at else None,
                'updatedAt': self.updated_at.isoformat() if self.updated_at else None
            }

    class IntervalsActivityData(db.Model):
        __tablename__ = 'intervals_activity_data'
        __table_args__ = (db.UniqueConstraint('user_id', 'activity_id', name='unique_user_activity'),)
        
        id = db.Column(db.String(36), primary_key=True)
        user_id = db.Column(db.String(36), db.ForeignKey('user_profiles.id'), nullable=False)
        activity_id = db.Column(db.String(100), nullable=False)
        activity_date = db.Column(db.Date, nullable=False)
        activity_name = db.Column(db.String(200))
        activity_type = db.Column(db.String(50))
        rpe = db.Column(db.Integer)
        feel = db.Column(db.Integer)
        duration = db.Column(db.Integer)
        distance = db.Column(db.Float)
        power_data = db.Column(db.JSON)
        hr_data = db.Column(db.JSON)
        synced_at = db.Column(db.DateTime, default=datetime.utcnow)

        def to_dict(self):
            return {
                'id': self.id,
                'activityId': self.activity_id,
                'activityDate': self.activity_date.isoformat() if self.activity_date else None,
                'activityName': self.activity_name,
                'activityType': self.activity_type,
                'rpe': self.rpe,
                'feel': self.feel,
                'duration': self.duration,
                'distance': self.distance,
                'powerData': self.power_data,
                'hrData': self.hr_data,
                'syncedAt': self.synced_at.isoformat() if self.synced_at else None
            }

    class IntervalsMenstrualData(db.Model):
        __tablename__ = 'intervals_menstrual_data'
        __table_args__ = (db.UniqueConstraint('user_id', 'cycle_date', name='unique_user_cycle_date'),)
        
        id = db.Column(db.String(36), primary_key=True)
        user_id = db.Column(db.String(36), db.ForeignKey('user_profiles.id'), nullable=False)
        cycle_date = db.Column(db.Date, nullable=False)
        phase = db.Column(db.String(50))
        symptoms = db.Column(db.JSON)
        opt_in = db.Column(db.Boolean, default=False)
        synced_at = db.Column(db.DateTime, default=datetime.utcnow)

        def to_dict(self):
            return {
                'id': self.id,
                'cycleDate': self.cycle_date.isoformat() if self.cycle_date else None,
                'phase': self.phase,
                'symptoms': self.symptoms,
                'syncedAt': self.synced_at.isoformat() if self.synced_at else None
            }

    class IntervalsWellnessMetrics(db.Model):
        __tablename__ = 'intervals_wellness_metrics'
        __table_args__ = (db.UniqueConstraint('user_id', 'metric_date', name='unique_user_metric_date'),)
        
        id = db.Column(db.String(36), primary_key=True)
        user_id = db.Column(db.String(36), db.ForeignKey('user_profiles.id'), nullable=False)
        metric_date = db.Column(db.Date, nullable=False)
        hrv = db.Column(db.Float)
        resting_hr = db.Column(db.Integer)
        weight = db.Column(db.Float)
        sleep_seconds = db.Column(db.Integer)
        sleep_quality = db.Column(db.Integer)
        fatigue = db.Column(db.Integer)
        mood = db.Column(db.Integer)
        stress = db.Column(db.Integer)
        soreness = db.Column(db.Integer)
        synced_at = db.Column(db.DateTime, default=datetime.utcnow)

        def to_dict(self):
            return {
                'id': self.id,
                'metricDate': self.metric_date.isoformat() if self.metric_date else None,
                'hrv': self.hrv,
                'restingHr': self.resting_hr,
                'weight': self.weight,
                'sleepSeconds': self.sleep_seconds,
                'sleepQuality': self.sleep_quality,
                'fatigue': self.fatigue,
                'mood': self.mood,
                'stress': self.stress,
                'soreness': self.soreness,
                'syncedAt': self.synced_at.isoformat() if self.synced_at else None
            }

else:
    # Dummy Task class when database is unavailable
    class Task:
        pass

# Create tables - only if database is available
if DB_AVAILABLE:
    with app.app_context():
        try:
            # Test database connection
            db.engine.connect()
            print("✓ Database connection successful")
            db.create_all()
            print("✓ Database tables created/verified successfully")
        except Exception as e:
            print(f"✗ Database connection failed: {e}")
            print(f"  DATABASE_URL: {'Set' if os.environ.get('DATABASE_URL') else 'Not set'}")
            print("  Tables will be created when database is available")
            DB_AVAILABLE = False
else:
    print("✗ Database not available - skipping table creation")
    print(f"  DATABASE_URL: {'Set' if os.environ.get('DATABASE_URL') else 'Not set'}")
    if os.environ.get('DATABASE_URL'):
        print("  Warning: DATABASE_URL is set but database initialization failed")
        print("  This may be due to:")
        print("  1. Invalid connection string format")
        print("  2. Database server not accessible")
        print("  3. Missing psycopg package")
        print("  4. Network/firewall issues")

# Shopify configuration
SHOPIFY_STORE_URL = os.environ.get('SHOPIFY_STORE_URL')
SHOPIFY_ACCESS_TOKEN = os.environ.get('SHOPIFY_ACCESS_TOKEN')
SHOPIFY_API_VERSION = '2024-10'

def shopify_graphql(query, variables=None):
        if not SHOPIFY_STORE_URL or not SHOPIFY_ACCESS_TOKEN:
                return None, {'error': 'Shopify credentials not configured', 'message': 'SHOPIFY_STORE_URL and SHOPIFY_ACCESS_TOKEN must be set'}
        headers = {
                'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
                'X-Shopify-API-Version': SHOPIFY_API_VERSION,
                'Content-Type': 'application/json',
        }
        try:
                resp = requests.post(
                        SHOPIFY_STORE_URL,
                        headers=headers,
                        json={'query': query, 'variables': variables or {}}
                )
                if resp.status_code != 200:
                        return None, {'error': 'Invalid response from Shopify API', 'message': resp.text}
                data = resp.json()
                if 'errors' in data:
                        return None, {'error': 'Shopify API error', 'message': data['errors']}
                return data['data'], None
        except Exception as e:
                return None, {'error': 'Failed to fetch from Shopify', 'message': str(e)}

# GraphQL queries
PRODUCTS_QUERY = '''
    query getProducts($first: Int!, $after: String) {
        products(first: $first, after: $after, sortKey: UPDATED_AT, reverse: true) {
            edges {
                node {
                    id
                    title
                    handle
                    media(first: 10) {
                        edges {
                            node {
                                ... on MediaImage {
                                    image { url }
                                }
                            }
                        }
                    }
                    variants(first: 1) {
                        edges { node { price } }
                    }
                }
            }
            pageInfo { hasNextPage endCursor }
        }
    }
'''

ORDERS_QUERY = '''
    query getOrders($query: String!) {
        orders(first: 100, query: $query) {
            edges {
                node {
                    id
                    lineItems(first: 250) {
                        edges {
                            node {
                                quantity
                                product {
                                    id
                                    title
                                    handle
                                    featuredImage { url }
                                    variants(first: 1) { edges { node { price } } }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
'''

@app.route('/api/products', methods=['GET'])
def api_products():
        first = int(request.args.get('first', 8))
        after = request.args.get('after')
        variables = {'first': first, 'after': after}
        data, error = shopify_graphql(PRODUCTS_QUERY, variables)
        if error:
                return jsonify(error), 500
        if not data or 'products' not in data or 'edges' not in data['products']:
                return jsonify({'error': 'Invalid response from Shopify API'}), 500
        products = []
        for edge in data['products']['edges']:
                node = edge['node']
                media_images = [e['node']['image']['url'] for e in node['media']['edges'] if e['node'].get('image')] if node.get('media') else []
                products.append({
                        'id': node['id'],
                        'title': node['title'],
                        'handle': node['handle'],
                        'img': media_images[0] if media_images else 'https://dummyimage.com/300x300/cccccc/000000&text=No+Image',
                        'price': f"${node['variants']['edges'][0]['node']['price']}" if node.get('variants') and node['variants']['edges'] else 'N/A'
                })
        return jsonify({
                'products': products,
                'pageInfo': data['products']['pageInfo']
        })

@app.route('/api/best-sellers', methods=['GET'])
def api_best_sellers():
        days = int(request.args.get('days', 30))
        date_query = f"created_at:>={ (datetime.utcnow() - timedelta(days=days)).date().isoformat() }"
        variables = {'query': date_query}
        data, error = shopify_graphql(ORDERS_QUERY, variables)
        if error:
                return jsonify(error), 500
        orders = data.get('orders', {}).get('edges', [])
        product_map = {}
        for order in orders:
                for item in order['node']['lineItems']['edges']:
                        prod = item['node']['product']
                        if not prod:
                                continue
                        key = prod['id']
                        if key not in product_map:
                                product_map[key] = {
                                        'id': key,
                                        'title': prod['title'],
                                        'image': prod.get('featuredImage', {}).get('url', 'https://via.placeholder.com/300?text=Plant'),
                                        'price': prod['variants']['edges'][0]['node']['price'] if prod.get('variants') and prod['variants']['edges'] else '0.00',
                                        'totalSold': 0
                                }
                        product_map[key]['totalSold'] += item['node']['quantity']
        best_sellers = sorted(product_map.values(), key=lambda x: x['totalSold'], reverse=True)[:10]
        return jsonify({'bestSellers': best_sellers, 'totalOrders': len(orders)})

# --- MCPServer Singleton (in-memory, like JS) ---
class MCPServer:
    def __init__(self):
        self.code_links = {}  # {figmaComponentId: {filePath, componentName, linkedAt, figmaFileId}}
        self.design_tokens = {}  # {tokenName: {value, type, updatedAt}}
        self.component_likes = {}  # {userId: {componentId: liked}}
        self.component_saves = {}  # {userId: {componentId: saved}}
        self.component_drafts = {}  # {userId: {componentId: draftData}}

    def link_component_to_code(self, figma_component_id, code_file_path, code_component_name, figma_file_id=None):
        link = {
            'filePath': code_file_path,
            'componentName': code_component_name,
            'linkedAt': datetime.utcnow().isoformat(),
            'figmaFileId': figma_file_id,
        }
        self.code_links[figma_component_id] = link
        return {'success': True, 'link': link, 'componentId': figma_component_id}

    def get_code_links(self, figma_file_id=None):
        if figma_file_id:
            return [
                {'componentId': cid, **link}
                for cid, link in self.code_links.items() if link.get('figmaFileId') == figma_file_id
            ]
        return [
            {'componentId': cid, **link}
            for cid, link in self.code_links.items()
        ]

    def sync_design_tokens(self, tokens):
        for token in tokens:
            self.design_tokens[token['name']] = {
                'value': token['value'],
                'type': token.get('type'),
                'updatedAt': datetime.utcnow().isoformat(),
            }
        return {'success': True, 'tokensSynced': len(tokens)}

    def get_design_tokens(self):
        return [
            {'name': name, **data}
            for name, data in self.design_tokens.items()
        ]

    def generate_code_snippet(self, component_id, language='typescript'):
        link = self.code_links.get(component_id)
        if not link:
            return None
        tokens = self.get_design_tokens()
        token_imports = '\n'.join([f"  {t['name']}: '{t['value']}'," for t in tokens])
        code = f"""// Auto-generated from Figma component: {component_id}\nimport {{ {link['componentName']} }} from '{link['filePath']}';\n\nconst designTokens = {{\n{token_imports}\n}};\n\nexport default {link['componentName']};"""
        return {
            'filePath': link['filePath'],
            'componentName': link['componentName'],
            'code': code,
        }
    
    def like_component(self, user_id, component_id, liked=True, file_id=None):
        """Like or unlike a Figma component"""
        if user_id not in self.component_likes:
            self.component_likes[user_id] = {}
        if liked:
            self.component_likes[user_id][component_id] = {
                'timestamp': datetime.utcnow().isoformat(),
                'fileId': file_id,
            }
        else:
            self.component_likes[user_id].pop(component_id, None)
        return {'success': True, 'liked': liked}
    
    def save_component(self, user_id, component_id, saved=True, file_id=None):
        """Save or unsave a Figma component"""
        if user_id not in self.component_saves:
            self.component_saves[user_id] = {}
        if saved:
            self.component_saves[user_id][component_id] = {
                'timestamp': datetime.utcnow().isoformat(),
                'fileId': file_id,
            }
        else:
            self.component_saves[user_id].pop(component_id, None)
        return {'success': True, 'saved': saved}
    
    def get_liked_components(self, user_id):
        """Get all liked component IDs for a user"""
        if user_id not in self.component_likes:
            return []
        return list(self.component_likes[user_id].keys())
    
    def get_saved_components(self, user_id):
        """Get all saved component IDs for a user"""
        if user_id not in self.component_saves:
            return []
        return list(self.component_saves[user_id].keys())
    
    def is_liked(self, user_id, component_id):
        """Check if a component is liked by a user"""
        return user_id in self.component_likes and component_id in self.component_likes[user_id]
    
    def is_saved(self, user_id, component_id):
        """Check if a component is saved by a user"""
        return user_id in self.component_saves and component_id in self.component_saves[user_id]
    
    def draft_component(self, user_id, component_id, draft=True, draft_data=None):
        """Draft or undraft a Figma component (draft_data can include notes, tags, etc.)"""
        if user_id not in self.component_drafts:
            self.component_drafts[user_id] = {}
        if draft:
            self.component_drafts[user_id][component_id] = {
                'draftedAt': datetime.utcnow().isoformat(),
                'data': draft_data or {},
            }
        else:
            self.component_drafts[user_id].pop(component_id, None)
        return {'success': True, 'drafted': draft}
    
    def get_drafted_components(self, user_id):
        """Get all drafted component IDs for a user"""
        if user_id not in self.component_drafts:
            return []
        return list(self.component_drafts[user_id].keys())
    
    def is_drafted(self, user_id, component_id):
        """Check if a component is drafted by a user"""
        return user_id in self.component_drafts and component_id in self.component_drafts[user_id]
    
    def get_component_preferences(self, user_id, component_ids=None):
        """Get all preferences (like, save, draft) for specified components or all components for a user"""
        liked = set(self.get_liked_components(user_id))
        saved = set(self.get_saved_components(user_id))
        drafted = set(self.get_drafted_components(user_id))
        
        if component_ids:
            # Return preferences only for specified components
            return {
                component_id: {
                    'liked': component_id in liked,
                    'saved': component_id in saved,
                    'drafted': component_id in drafted,
                }
                for component_id in component_ids
            }
        else:
            # Return all unique component IDs with their preferences
            all_components = liked | saved | drafted
            return {
                component_id: {
                    'liked': component_id in liked,
                    'saved': component_id in saved,
                    'drafted': component_id in drafted,
                }
                for component_id in all_components
            }

mcp_server = MCPServer()
# --- MCP Endpoints ---
@app.route('/api/mcp/figma-to-code', methods=['POST'])
def mcp_figma_to_code():
    # TODO: Add authentication if needed
    data = request.get_json()
    figma_component_id = data.get('figmaComponentId')
    code_file_path = data.get('codeFilePath')
    code_component_name = data.get('codeComponentName')
    figma_file_id = data.get('figmaFileId')
    if not figma_component_id or not code_file_path or not code_component_name:
        return jsonify({'error': 'Missing required fields'}), 400
    result = mcp_server.link_component_to_code(figma_component_id, code_file_path, code_component_name, figma_file_id)
    socketio.emit('component_linked', {
        'componentId': figma_component_id,
        'componentName': code_component_name,
        'filePath': code_file_path,
    }, to='design-tokens')
    return jsonify(result)

@app.route('/api/mcp/code-links', methods=['GET'])
def mcp_code_links():
    figma_file_id = request.args.get('figmaFileId')
    links = mcp_server.get_code_links(figma_file_id)
    return jsonify({'links': links})

@app.route('/api/mcp/sync-tokens', methods=['POST'])
def mcp_sync_tokens():
    data = request.get_json()
    tokens = data.get('tokens')
    if not tokens or not isinstance(tokens, list):
        return jsonify({'error': 'Tokens must be an array'}), 400
    result = mcp_server.sync_design_tokens(tokens)
    for token in tokens:
        socketio.emit('design_token_updated', {
            'name': token['name'],
            'value': token['value'],
            'type': token.get('type'),
        }, to='design-tokens')
    return jsonify(result)

@app.route('/api/mcp/tokens', methods=['GET'])
def mcp_tokens():
    tokens = mcp_server.get_design_tokens()
    return jsonify({'tokens': tokens})

@app.route('/api/mcp/generate-code', methods=['POST'])
def mcp_generate_code():
    data = request.get_json()
    component_id = data.get('componentId')
    language = data.get('language', 'typescript')
    if not component_id:
        return jsonify({'error': 'Component ID required'}), 400
    snippet = mcp_server.generate_code_snippet(component_id, language)
    if not snippet:
        return jsonify({'error': 'Component not linked to code'}), 404
    return jsonify(snippet)

# --- Figma Component Likes & Saves Endpoints ---
def get_user_id():
    """Get user ID from JWT token or use default"""
    try:
        user_id = get_jwt_identity()
        if user_id:
            # Try to get user from database
            if DB_AVAILABLE:
                user = User.query.get(int(user_id)) if user_id.isdigit() else None
                if user:
                    return user.patreon_id or user.username or str(user.id)
            return str(user_id)
    except Exception:
        pass
    return 'anonymous'

def get_current_user():
    """Get current user from JWT token"""
    try:
        user_id = get_jwt_identity()
        if not user_id or not DB_AVAILABLE:
            return None
        
        # Find user by ID - handle missing is_employee column
        user = None
        try:
            if user_id.isdigit():
                user = User.query.get(int(user_id))
            if not user:
                user = User.query.filter_by(username=user_id).first()
            if not user:
                user = User.query.filter_by(patreon_id=user_id).first()
        except Exception as query_error:
            error_str = str(query_error).lower()
            if 'is_employee' in error_str and 'column' in error_str:
                # Column doesn't exist - log warning but don't crash
                print(f"Warning: is_employee column missing when querying user {user_id}")
                print("Please run: flask db upgrade")
                # Try to work around by using raw SQL (excluding is_employee column)
                try:
                    with db.engine.connect() as conn:
                        result = conn.execute(db.text("""
                            SELECT id, username, email, password_hash, patreon_id, 
                                   access_token, refresh_token, membership_paid,
                                   last_checked, token_expires_at, patreon_connected,
                                   created_at, updated_at
                            FROM users 
                            WHERE (id = :user_id OR username = :user_id OR patreon_id = :user_id)
                            LIMIT 1
                        """), {'user_id': user_id})
                        row = result.fetchone()
                        if row:
                            # Create a minimal user object (won't have is_employee)
                            # This is a workaround - migration should be run
                            from types import SimpleNamespace
                            user = SimpleNamespace(
                                id=row[0],
                                username=row[1],
                                email=row[2],
                                password_hash=row[3],
                                patreon_id=row[4],
                                access_token=row[5],
                                refresh_token=row[6],
                                membership_paid=row[7],
                                last_checked=row[8],
                                token_expires_at=row[9],
                                patreon_connected=row[10],
                                created_at=row[11],
                                updated_at=row[12]
                            )
                            # Add methods that might be called
                            def check_password(pwd):
                                if not user.password_hash:
                                    return False
                                return bcrypt.checkpw(pwd.encode('utf-8'), user.password_hash.encode('utf-8'))
                            user.check_password = check_password
                            def to_dict():
                                return {
                                    'id': user.patreon_id or user.username or str(user.id),
                                    'patreonId': user.patreon_id,
                                    'username': user.username,
                                    'email': user.email,
                                    'membershipPaid': user.membership_paid,
                                    'patreonConnected': user.patreon_connected,
                                    'lastChecked': user.last_checked.isoformat() if user.last_checked else None
                                }
                            user.to_dict = to_dict
                except Exception as raw_error:
                    print(f"Error in raw SQL fallback: {raw_error}")
                    return None
            else:
                # Some other error, re-raise
                raise
        
        return user
    except Exception as e:
        print(f"Error in get_current_user: {e}")
        return None

# Authentication decorator - DEPRECATED: Use @jwt_required() instead
def require_session(f):
    """DEPRECATED: Decorator to require authenticated session - Use @jwt_required() instead"""
    @wraps(f)
    @jwt_required()  # Use JWT authentication
    def decorated_function(*args, **kwargs):
        return f(*args, **kwargs)
    return decorated_function

def send_push_notification(user_id: int, notification: Notification):
    """Send push notification to user's devices"""
    if not WEBPUSH_AVAILABLE or not DB_AVAILABLE:
        return
    
    try:
        # Get user's push subscriptions
        subscriptions = PushSubscription.query.filter_by(user_id=user_id).all()
        if not subscriptions:
            return
        
        # Get VAPID keys from environment
        vapid_private_key = os.environ.get('VAPID_PRIVATE_KEY')
        vapid_public_key = os.environ.get('VAPID_PUBLIC_KEY')
        vapid_email = os.environ.get('VAPID_EMAIL', 'mailto:noreply@ventures.isharehow.app')
        
        if not vapid_private_key or not vapid_public_key:
            app.logger.warning("VAPID keys not configured. Push notifications disabled.")
            return
        
        # Parse metadata
        metadata_dict = {}
        if notification.notification_metadata:
            try:
                metadata_dict = json.loads(notification.notification_metadata)
            except:
                pass
        
        # Prepare notification payload
        payload = {
            'title': notification.title,
            'message': notification.message,
            'id': str(notification.id),
            'type': notification.type,
            'data': {
                'url': metadata_dict.get('link', '/') if metadata_dict else '/',
            }
        }
        
        # Send to all user's subscriptions
        for subscription in subscriptions:
            try:
                subscription_info = {
                    'endpoint': subscription.endpoint,
                    'keys': {
                        'p256dh': subscription.p256dh,
                        'auth': subscription.auth
                    }
                }
                
                webpush(
                    subscription_info=subscription_info,
                    data=json.dumps(payload),
                    vapid_private_key=vapid_private_key,
                    vapid_claims={
                        'sub': vapid_email
                    }
                )
            except WebPushException as e:
                app.logger.error(f"WebPush error for subscription {subscription.id}: {e}")
                # Remove invalid subscriptions
                if hasattr(e, 'response') and e.response and e.response.status_code == 410:  # Gone
                    db.session.delete(subscription)
                    db.session.commit()
            except Exception as e:
                app.logger.error(f"Error sending push to subscription {subscription.id}: {e}")
    except Exception as e:
        app.logger.error(f"Error in send_push_notification: {e}")

# Global flag to track if is_employee column exists
_IS_EMPLOYEE_COLUMN_EXISTS = None
_IS_EMPLOYEE_CHECK_COUNT = 0
_IS_EMPLOYEE_CHECK_MAX = 100  # Re-check every 100 calls to handle migrations

def check_is_employee_column_exists(force_check=False):
    """Check if is_employee column exists in the users table
    
    Args:
        force_check: If True, bypass cache and check again (useful after migrations)
    """
    global _IS_EMPLOYEE_COLUMN_EXISTS, _IS_EMPLOYEE_CHECK_COUNT
    
    # Re-check periodically to handle migrations that happen while server is running
    if not force_check and _IS_EMPLOYEE_COLUMN_EXISTS is not None:
        _IS_EMPLOYEE_CHECK_COUNT += 1
        if _IS_EMPLOYEE_CHECK_COUNT < _IS_EMPLOYEE_CHECK_MAX:
            return _IS_EMPLOYEE_COLUMN_EXISTS
        # Reset counter and force re-check
        _IS_EMPLOYEE_CHECK_COUNT = 0
        force_check = True
    
    if not DB_AVAILABLE:
        _IS_EMPLOYEE_COLUMN_EXISTS = False
        return False
    
    try:
        # Try to query the column to see if it exists
        with db.engine.connect() as conn:
            result = conn.execute(db.text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'is_employee'
            """))
            _IS_EMPLOYEE_COLUMN_EXISTS = result.fetchone() is not None
        return _IS_EMPLOYEE_COLUMN_EXISTS
    except Exception as e:
        print(f"Error checking is_employee column: {e}")
        app.logger.warning(f"Error checking is_employee column: {e}")
        # If we can't check, assume it doesn't exist (safer fallback)
        # Don't cache the error - allow retry on next call
        if force_check:
            _IS_EMPLOYEE_COLUMN_EXISTS = False
        return False

def safe_query_user(query_func):
    """Safely execute a User query, handling missing is_employee column"""
    try:
        return query_func()
    except Exception as e:
        error_str = str(e)
        # Check if error is due to missing is_employee column
        if 'is_employee' in error_str.lower() and 'column' in error_str.lower():
            # Column doesn't exist - need to run migration
            print(f"Warning: is_employee column missing. Error: {e}")
            print("Please run: flask db upgrade")
            # Try to work around by using raw SQL or excluding the column
            # For now, re-raise with a helpful message
            raise Exception(
                "Database migration required: The is_employee column is missing. "
                "Please run 'flask db upgrade' in the backend-python directory. "
                "See RUN_MIGRATION.md for details."
            ) from e
        # Some other error, re-raise it
        raise

def safe_get_is_employee(user):
    """Safely get is_employee flag, handling missing column gracefully"""
    if not user:
        return False
    try:
        # Check if column exists by trying to access it
        if hasattr(user, 'is_employee'):
            return bool(user.is_employee)
    except (AttributeError, KeyError):
        # Column doesn't exist in database yet
        pass
    return False

def get_user_info():
    """Get user info from JWT token including id and role"""
    user = get_current_user()
    if not user:
        return None
    return {
        'id': user.patreon_id or user.username or str(user.id),
        'user_id': user.id,  # Add database user ID
        'role': 'mentee',  # default to mentee (can be extended later)
        'is_employee': safe_get_is_employee(user),
        'name': user.username or user.email or 'Unknown'
    }

def require_employee(f):
    """Decorator to require user to be an employee"""
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        if not safe_get_is_employee(user):
            return jsonify({'error': 'Employee access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

def require_admin(f):
    """Decorator to require user to be an admin"""
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        # Check if user is admin (is_admin field or special patreon_id or username)
        is_admin = False
        
        # Check is_admin field first
        if hasattr(user, 'is_admin'):
            is_admin = bool(user.is_admin)
        
        # Check special identifiers if is_admin field is False or doesn't exist
        if not is_admin:
            # Check patreon_id
            if hasattr(user, 'patreon_id') and user.patreon_id == '56776112':
                is_admin = True
            # Check username (case-insensitive)
            elif hasattr(user, 'username') and user.username:
                username_lower = user.username.lower()
                if username_lower in ['isharehow', 'admin']:
                    is_admin = True
            # Check email
            elif hasattr(user, 'email') and user.email:
                email_lower = user.email.lower()
                if email_lower == 'jeliyah@isharehowlabs.com':
                    is_admin = True
            # Check ID (could be username, patreon_id, or ens_name)
            elif hasattr(user, 'id'):
                user_id_str = str(user.id).lower()
                if user_id_str in ['isharehow', 'admin']:
                    is_admin = True
        
        if not is_admin:
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

def require_employee_or_assigned(f):
    """Decorator to require user to be an employee OR assigned to the client"""
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Check if user is an employee
        is_employee = safe_get_is_employee(user)
        
        # If not employee, check if they're assigned to the client
        if not is_employee and 'client_id' in kwargs:
            client_id = kwargs['client_id']
            client = Client.query.get(client_id)
            if client:
                # Check if user is assigned to this client
                assignment = ClientEmployeeAssignment.query.filter_by(
                    client_id=client_id,
                    employee_id=user.id
                ).first()
                if not assignment:
                    return jsonify({'error': 'Access denied. You must be assigned to this client or be an employee.'}), 403
            else:
                return jsonify({'error': 'Client not found'}), 404
        
        return f(*args, **kwargs)
    return decorated_function

def check_employee_client_access(user, client_id):
    """Helper function to check if user can access a client"""
    if not user:
        return False, 'Authentication required'
    
    # Employees can access all clients
    if safe_get_is_employee(user):
        return True, None
    
    # Check if user is assigned to this client
    assignment = ClientEmployeeAssignment.query.filter_by(
        client_id=client_id,
        employee_id=user.id
    ).first()
    
    if assignment:
        return True, None
    
    return False, 'Access denied. You must be assigned to this client or be an employee.'

@app.route('/api/figma/component/like', methods=['POST'])
def figma_component_like():
    data = request.get_json()
    component_id = data.get('componentId')
    liked = data.get('liked', True)
    file_id = data.get('fileId')
    if not component_id:
        return jsonify({'error': 'Component ID required'}), 400
    user_id = get_user_id()
    result = mcp_server.like_component(user_id, component_id, liked, file_id)
    
    # Sync with Figma Comments API if possible
    if file_id and FIGMA_ACCESS_TOKEN:
        try:
            sync_like_to_figma(file_id, component_id, liked, user_id)
        except Exception as e:
            print(f'Error syncing like to Figma: {e}')
            # Don't fail the request if sync fails
    
    return jsonify(result)

@app.route('/api/figma/component/save', methods=['POST'])
def figma_component_save():
    data = request.get_json()
    component_id = data.get('componentId')
    saved = data.get('saved', True)
    file_id = data.get('fileId')
    if not component_id:
        return jsonify({'error': 'Component ID required'}), 400
    user_id = get_user_id()
    result = mcp_server.save_component(user_id, component_id, saved, file_id)
    
    # Sync with Figma Comments API if possible
    if file_id and FIGMA_ACCESS_TOKEN:
        try:
            sync_save_to_figma(file_id, component_id, saved, user_id)
        except Exception as e:
            print(f'Error syncing save to Figma: {e}')
            # Don't fail the request if sync fails
    
    return jsonify(result)

@app.route('/api/figma/components/liked', methods=['GET'])
def figma_components_liked():
    user_id = get_user_id()
    component_ids = mcp_server.get_liked_components(user_id)
    return jsonify({'componentIds': component_ids})

@app.route('/api/figma/components/saved', methods=['GET'])
def figma_components_saved():
    user_id = get_user_id()
    component_ids = mcp_server.get_saved_components(user_id)
    return jsonify({'componentIds': component_ids})

@app.route('/api/figma/component/<component_id>/status', methods=['GET'])
def figma_component_status(component_id):
    user_id = get_user_id()
    is_liked = mcp_server.is_liked(user_id, component_id)
    is_saved = mcp_server.is_saved(user_id, component_id)
    is_drafted = mcp_server.is_drafted(user_id, component_id)
    return jsonify({'liked': is_liked, 'saved': is_saved, 'drafted': is_drafted})

@app.route('/api/figma/component/draft', methods=['POST'])
def figma_component_draft():
    data = request.get_json()
    component_id = data.get('componentId')
    drafted = data.get('drafted', True)
    draft_data = data.get('draftData', None)
    if not component_id:
        return jsonify({'error': 'Component ID required'}), 400
    user_id = get_user_id()
    result = mcp_server.draft_component(user_id, component_id, drafted, draft_data)
    return jsonify(result)

@app.route('/api/figma/components/drafted', methods=['GET'])
def figma_components_drafted():
    user_id = get_user_id()
    component_ids = mcp_server.get_drafted_components(user_id)
    return jsonify({'componentIds': component_ids})

@app.route('/api/figma/components/preferences', methods=['GET', 'POST'])
def figma_components_preferences():
    """Unified endpoint to get all component preferences (likes, saves, drafts)
    GET: Returns all preferences for current user
    POST: Accepts array of componentIds to get preferences for specific components"""
    user_id = get_user_id()
    
    if request.method == 'POST':
        data = request.get_json()
        component_ids = data.get('componentIds', [])
        if not isinstance(component_ids, list):
            return jsonify({'error': 'componentIds must be an array'}), 400
        preferences = mcp_server.get_component_preferences(user_id, component_ids)
    else:
        # GET: Return all preferences
        preferences = mcp_server.get_component_preferences(user_id)
    
    return jsonify({
        'preferences': preferences,
        'summary': {
            'liked': len([p for p in preferences.values() if p['liked']]),
            'saved': len([p for p in preferences.values() if p['saved']]),
            'drafted': len([p for p in preferences.values() if p['drafted']]),
        }
    })

# --- Figma API Proxy Endpoints ---
FIGMA_ACCESS_TOKEN = os.environ.get('FIGMA_ACCESS_TOKEN')
FIGMA_API_URL = 'https://api.figma.com/v1'
FIGMA_TEAM_ID = os.environ.get('FIGMA_TEAM_ID')

def figma_headers():
    """Get Figma API headers"""
    if not FIGMA_ACCESS_TOKEN:
        return {}
    return {'X-Figma-Token': FIGMA_ACCESS_TOKEN}

def sync_like_to_figma(file_id, component_id, liked, user_id):
    """Sync like status to Figma using Comments API"""
    if not file_id or not component_id or not FIGMA_ACCESS_TOKEN:
        return
    try:
        file_r = requests.get(f'{FIGMA_API_URL}/files/{file_id}', headers=figma_headers(), timeout=10)
        if not file_r.ok:
            return
        try:
            file_data = file_r.json()
        except (ValueError, AttributeError):
            return
        components = file_data.get('components', {}) if isinstance(file_data, dict) else {}
        
        if component_id in components and isinstance(components[component_id], dict):
            component = components[component_id]
            node_id = component.get('key', component_id)
            
            # Search for existing like comment
            comments_r = requests.get(f'{FIGMA_API_URL}/files/{file_id}/comments', headers=figma_headers(), timeout=10)
            if comments_r.ok:
                try:
                    comments_data = comments_r.json()
                    comments = comments_data.get('comments', []) if isinstance(comments_data, dict) else []
                except (ValueError, AttributeError):
                    comments = []
                
                like_comment = next((c for c in comments if isinstance(c, dict) and c.get('message') == '❤️ LIKED' and c.get('client_meta', {}).get('node_id') == node_id), None)
                
                if liked and not like_comment:
                    # Create like comment
                    try:
                        requests.post(
                            f'{FIGMA_API_URL}/files/{file_id}/comments',
                            headers=figma_headers(),
                            json={
                                'message': '❤️ LIKED',
                                'client_meta': {'node_id': node_id}
                            },
                            timeout=10
                        )
                    except Exception:
                        pass  # Silent fail for sync
                elif not liked and like_comment:
                    # Mark as removed
                    try:
                        requests.post(
                            f'{FIGMA_API_URL}/files/{file_id}/comments',
                            headers=figma_headers(),
                            json={
                                'message': '💔 Removed like',
                                'client_meta': {'node_id': node_id},
                                'comment_id': like_comment.get('id')
                            },
                            timeout=10
                        )
                    except Exception:
                        pass  # Silent fail for sync
    except Exception as e:
        print(f'Error syncing like to Figma: {e}')

def sync_save_to_figma(file_id, component_id, saved, user_id):
    """Sync save status to Figma using Comments API"""
    if not file_id or not component_id or not FIGMA_ACCESS_TOKEN:
        return
    try:
        file_r = requests.get(f'{FIGMA_API_URL}/files/{file_id}', headers=figma_headers(), timeout=10)
        if not file_r.ok:
            return
        try:
            file_data = file_r.json()
        except (ValueError, AttributeError):
            return
        components = file_data.get('components', {}) if isinstance(file_data, dict) else {}
        
        if component_id in components and isinstance(components[component_id], dict):
            component = components[component_id]
            node_id = component.get('key', component_id)
            
            # Search for existing save comment
            comments_r = requests.get(f'{FIGMA_API_URL}/files/{file_id}/comments', headers=figma_headers(), timeout=10)
            if comments_r.ok:
                try:
                    comments_data = comments_r.json()
                    comments = comments_data.get('comments', []) if isinstance(comments_data, dict) else []
                except (ValueError, AttributeError):
                    comments = []
                
                save_comment = next((c for c in comments if isinstance(c, dict) and c.get('message') == '🔖 SAVED' and c.get('client_meta', {}).get('node_id') == node_id), None)
                
                if saved and not save_comment:
                    # Create save comment
                    try:
                        requests.post(
                            f'{FIGMA_API_URL}/files/{file_id}/comments',
                            headers=figma_headers(),
                            json={
                                'message': '🔖 SAVED',
                                'client_meta': {'node_id': node_id}
                            },
                            timeout=10
                        )
                    except Exception:
                        pass  # Silent fail for sync
                elif not saved and save_comment:
                    # Mark as removed
                    try:
                        requests.post(
                            f'{FIGMA_API_URL}/files/{file_id}/comments',
                            headers=figma_headers(),
                            json={
                                'message': '📑 Removed from saved',
                                'client_meta': {'node_id': node_id},
                                'comment_id': save_comment.get('id')
                            },
                            timeout=10
                        )
                    except Exception:
                        pass  # Silent fail for sync
    except Exception as e:
        print(f'Error syncing save to Figma: {e}')

@app.route('/api/figma/teams', methods=['GET'])
def figma_teams():
    if not FIGMA_ACCESS_TOKEN:
        return jsonify({'error': 'Figma access token not configured'}), 500
    r = requests.get(f'{FIGMA_API_URL}/teams', headers=figma_headers())
    if not r.ok:
        return jsonify({'error': 'Figma API error', 'message': r.text}), 500
    return jsonify({'teams': r.json().get('teams', [])})

@app.route('/api/figma/files', methods=['GET'])
def figma_files():
    if not FIGMA_ACCESS_TOKEN:
        return jsonify({'error': 'Figma access token not configured'}), 500
    if not FIGMA_TEAM_ID:
        return jsonify({'error': 'Figma team ID not configured'}), 500
    
    all_files = []
    seen_file_keys = set()  # Track files we've already added
    
    # Get all projects for the team
    try:
        r = requests.get(f'{FIGMA_API_URL}/teams/{FIGMA_TEAM_ID}/projects', headers=figma_headers(), timeout=10)
        if r.ok:
            try:
                projects_data = r.json()
                projects = projects_data.get('projects', []) if isinstance(projects_data, dict) else []
            except (ValueError, AttributeError) as e:
                print(f'Error parsing projects JSON: {e}')
                projects = []
            
            for project in projects:
                if not isinstance(project, dict) or 'id' not in project:
                    continue
                try:
                    files_r = requests.get(f'{FIGMA_API_URL}/projects/{project["id"]}/files', headers=figma_headers(), timeout=10)
                    if files_r.ok:
                        try:
                            files_data = files_r.json()
                            files = files_data.get('files', []) if isinstance(files_data, dict) else []
                        except (ValueError, AttributeError) as e:
                            print(f'Error parsing files JSON for project {project.get("id")}: {e}')
                            files = []
                        
                        for file in files:
                            if not isinstance(file, dict):
                                continue
                            try:
                                file_key = file.get('key') or file.get('id')
                                if file_key and file_key not in seen_file_keys:
                                    # Check if this is a library (has published components)
                                    normalized_file = {
                                        **file,
                                        'projectName': str(project.get('name', 'Unknown Project')),
                                        'projectId': project.get('id'),
                                        'source': 'project',
                                        'isLibrary': False,
                                    }
                                    # Map 'key' to 'id' if 'id' doesn't exist
                                    if 'key' in normalized_file and 'id' not in normalized_file:
                                        normalized_file['id'] = normalized_file['key']
                                    
                                    # Quick check: if file name contains "library" or is in a library-like project, mark it
                                    file_name = str(normalized_file.get('name', '')).lower()
                                    project_name = str(project.get('name', '')).lower()
                                    if 'library' in file_name or 'lib' in file_name or 'library' in project_name:
                                        normalized_file['isLibrary'] = True
                                        normalized_file['source'] = 'library'
                                    
                                    all_files.append(normalized_file)
                                    seen_file_keys.add(file_key)
                            except Exception as e:
                                print(f'Error processing file: {e}')
                                continue
                except Exception as e:
                    print(f'Error fetching files for project {project.get("id")}: {e}')
                    continue
    except Exception as e:
        print(f'Error fetching projects: {e}')
        # Return empty list on error instead of failing
    
    # Sort files: libraries first, then by project name (with safe defaults)
    try:
        all_files.sort(key=lambda f: (
            0 if f.get('isLibrary') or f.get('source') == 'library' else 1,
            str(f.get('projectName', '')),
            str(f.get('name', ''))
        ))
    except Exception as e:
        print(f'Error sorting files: {e}')
        # Continue without sorting if it fails
    
    # Ensure we always return a valid JSON response
    response = jsonify({'projects': all_files})
    return response

@app.route('/api/figma/file/<id>', methods=['GET'])
def figma_file(id):
    if not id or id in ('', 'undefined', 'null'):
        return jsonify({'error': 'Invalid file ID: file ID is required and cannot be empty'}), 400
    if not FIGMA_ACCESS_TOKEN:
        return jsonify({'error': 'Figma access token not configured'}), 500
    r = requests.get(f'{FIGMA_API_URL}/files/{id}', headers=figma_headers())
    if not r.ok:
        return jsonify({'error': f'Figma API error: {r.status_code}', 'message': r.text}), 500
    return jsonify({'file': r.json()})

@app.route('/api/figma/file/<id>/components', methods=['GET'])
def figma_file_components(id):
    if not id or id in ('', 'undefined', 'null'):
        return jsonify({'error': 'Invalid file ID: file ID is required and cannot be empty'}), 400
    if not FIGMA_ACCESS_TOKEN:
        return jsonify({'error': 'Figma access token not configured'}), 500
    r = requests.get(f'{FIGMA_API_URL}/files/{id}', headers=figma_headers())
    if not r.ok:
        return jsonify({'error': f'Figma API error: {r.status_code}', 'message': r.text}), 500
    data = r.json()
    components = list(data.get('components', {}).values())
    return jsonify({'components': components})

@app.route('/api/figma/file/<id>/tokens', methods=['GET'])
def figma_file_tokens(id):
    if not id or id in ('', 'undefined', 'null'):
        return jsonify({'error': 'Invalid file ID: file ID is required and cannot be empty'}), 400
    if not FIGMA_ACCESS_TOKEN:
        return jsonify({'error': 'Figma access token not configured'}), 500
    r = requests.get(f'{FIGMA_API_URL}/files/{id}', headers=figma_headers())
    if not r.ok:
        return jsonify({'error': f'Figma API error: {r.status_code}', 'message': r.text}), 500
    data = r.json()
    styles = data.get('styles', {})
    tokens = [
        {
            'id': style['key'],
            'name': style['name'],
            'description': style.get('description'),
            'styleType': style.get('styleType'),
        }
        for style in styles.values()
    ]
    return jsonify({'tokens': tokens})
# Global error handler for unhandled exceptions (500 errors)
@app.errorhandler(404)
def handle_404_error(e):
    """Handle 404 errors and return JSON error response"""
    # Only return JSON for API routes
    if request.path.startswith('/api/'):
        return jsonify({
            'error': 'Not found',
            'message': f'The requested endpoint {request.path} was not found.'
        }), 404
    # Return default Flask 404 for non-API routes
    return e

@app.errorhandler(405)
def handle_405_error(e):
    """Handle 405 Method Not Allowed errors and return JSON error response"""
    print(f"405 error handler triggered for {request.path} with method {request.method}")
    # Only return JSON for API routes
    if request.path.startswith('/api/'):
        response = jsonify({
            'error': 'Method not allowed',
            'message': f'The method {request.method} is not allowed for {request.path}. Allowed methods: {e.valid_methods if hasattr(e, "valid_methods") else "Unknown"}'
        })
        response.status_code = 405
        return response
    # Return default Flask 405 for non-API routes
    return e

@app.errorhandler(500)
def handle_500_error(e):
    """Handle 500 errors and return JSON error response"""
    print(f"500 error occurred: {e}")
    import traceback
    traceback.print_exc()
    # Always return JSON for API routes
    if request.path.startswith('/api/'):
        return jsonify({
            'error': 'Internal server error',
            'message': 'An unexpected error occurred. Please check server logs for details.'
        }), 500
    # Return default Flask 500 for non-API routes
    return e

# Handle unhandled exceptions that aren't HTTP exceptions
@app.errorhandler(Exception)
def handle_general_exception(e):
    """Handle unhandled exceptions and return JSON error response"""
    from werkzeug.exceptions import HTTPException, MethodNotAllowed
    
    # Handle HTTP exceptions for API routes
    if isinstance(e, HTTPException):
        if request.path.startswith('/api/'):
            # Special handling for 405 Method Not Allowed
            if isinstance(e, MethodNotAllowed) or e.code == 405:
                print(f"MethodNotAllowed caught in general handler: {request.method} for {request.path}")
                return jsonify({
                    'error': 'method_not_allowed',
                    'message': f'The method {request.method} is not allowed for {request.path}.',
                    'code': 405,
                    'allowed_methods': getattr(e, 'valid_methods', [])
                }), 405
            # Convert other HTTP exceptions to JSON for API routes
            return jsonify({
                'error': e.name.lower().replace(' ', '_'),
                'message': e.description or str(e),
                'code': e.code
            }), e.code
        return e
    
    print(f"Unhandled exception: {e}")
    import traceback
    traceback.print_exc()
    
    # If it's a database error, return 503
    error_str = str(e).lower()
    if 'connection' in error_str or 'database' in error_str or 'operational' in error_str:
        return jsonify({
            'error': 'Database unavailable',
            'message': 'Database connection failed. Please check your database configuration.'
        }), 503
    
    # Otherwise return 500 with error details
    return jsonify({
        'error': 'Internal server error',
        'message': str(e)
    }), 500

# --- Auth Endpoints (JWT-based) ---
@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user with username and password"""
    global DB_AVAILABLE
    
    if not DB_AVAILABLE:
        # Try to reinitialize database connection if db object exists
        if db is not None:
            try:
                db_uri = os.environ.get('DATABASE_URL', 'postgresql://localhost/ventures')
                print(f"Attempting to reconnect to database: {db_uri[:50]}...")
                with app.app_context():
                    db.engine.connect()
                    DB_AVAILABLE = True
                    print("✓ Database reconnection successful")
            except Exception as reconnect_error:
                error_msg = 'Database not available. Please check your DATABASE_URL environment variable and ensure the database is accessible.'
                print(f"Registration failed: {error_msg}")
                print(f"  DATABASE_URL is set: {bool(os.environ.get('DATABASE_URL'))}")
                print(f"  Reconnection error: {reconnect_error}")
                return jsonify({
                    'error': 'Database not available',
                    'message': error_msg,
                    'details': str(reconnect_error) if reconnect_error else 'Check server logs for database connection errors'
                }), 500
        else:
            error_msg = 'Database not available. DATABASE_URL environment variable may not be set or database connection failed during initialization.'
            print(f"Registration failed: {error_msg}")
            print(f"  DATABASE_URL is set: {bool(os.environ.get('DATABASE_URL'))}")
            return jsonify({
                'error': 'Database not available',
                'message': error_msg,
                'details': 'Please ensure DATABASE_URL is set in your environment variables (Render dashboard)'
            }), 500
    
    if not DB_AVAILABLE:
        return jsonify({
            'error': 'Database not available',
            'message': 'Database connection failed. Please contact support.'
        }), 500
    
    data = request.json
    username = data.get('username', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')
    
    # Validation
    if not username:
        return jsonify({'error': 'Username is required'}), 400
    if not password or len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    if email and '@' not in email:
        return jsonify({'error': 'Invalid email address'}), 400
    
    try:
        # Check if username already exists - handle missing is_employee column
        try:
            if User.query.filter_by(username=username).first():
                return jsonify({'error': 'Username already exists'}), 400
        except Exception as query_error:
            error_str = str(query_error).lower()
            if 'is_employee' in error_str and 'column' in error_str:
                return jsonify({
                    'error': 'Database migration required',
                    'message': 'The is_employee column is missing. Please run the database migration.',
                    'details': 'Run: flask db upgrade (see RUN_MIGRATION.md)',
                    'migration_required': True
                }), 500
            raise
        
        # Check if email already exists - handle missing is_employee column
        try:
            if email and User.query.filter_by(email=email).first():
                return jsonify({'error': 'Email already exists'}), 400
        except Exception as query_error:
            error_str = str(query_error).lower()
            if 'is_employee' in error_str and 'column' in error_str:
                return jsonify({
                    'error': 'Database migration required',
                    'message': 'The is_employee column is missing. Please run the database migration.',
                    'details': 'Run: flask db upgrade (see RUN_MIGRATION.md)',
                    'migration_required': True
                }), 500
            raise
        
        # Resolve ENS name and address for the user
        ens_data = resolve_or_create_ens(None, username)
        
        # Create new user
        user = User(
            username=username,
            email=email or None,
            patreon_connected=False,
            ens_name=ens_data.get('ens_name'),
            crypto_address=ens_data.get('crypto_address'),
            content_hash=ens_data.get('content_hash')
        )
        user.set_password(password)
        db.session.add(user)
        
        try:
            db.session.commit()
            
            # After commit, create UserProfile with ENS data
            profile_id = ens_data.get('ens_name') or str(user.id)
            profile = UserProfile(
                id=profile_id,
                email=email or None,
                name=username,
                patreon_id=None,
                ens_name=ens_data.get('ens_name'),
                crypto_address=ens_data.get('crypto_address'),
                content_hash=ens_data.get('content_hash')
            )
            db.session.add(profile)
            db.session.commit()
        except Exception as commit_error:
            # Check if error is due to missing is_employee column
            error_str = str(commit_error).lower()
            if 'is_employee' in error_str or 'column' in error_str:
                # Column doesn't exist - need to run migration
                db.session.rollback()
                return jsonify({
                    'error': 'Database migration required',
                    'message': 'The is_employee column is missing from the users table. Please run the database migration.',
                    'details': 'See RUN_MIGRATION.md for instructions on how to run: flask db upgrade'
                }), 500
            # Some other error, re-raise it
            raise
        
        # Generate JWT token using flask-jwt-extended
        access_token = create_access_token(identity=str(user.id))
        
        # Set JWT in httpOnly cookie
        response = jsonify({
            'success': True,
            'message': 'User registered successfully',
            'user': user.to_dict()
        })
        set_access_cookies(response, access_token)
        return response, 201
        
    except Exception as e:
        print(f"Error in registration: {e}")
        import traceback
        traceback.print_exc()
        app.logger.error(f"Error in registration: {e}")
        app.logger.error(traceback.format_exc())
        if db and hasattr(db, 'session'):
            try:
                db.session.rollback()
            except:
                pass
        return jsonify({
            'error': 'Registration failed',
            'message': str(e),
            'details': 'Check server logs for more information'
        }), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login with username/email and password"""
    global DB_AVAILABLE
    
    if not DB_AVAILABLE:
        # Try to reinitialize database connection if db object exists
        if db is not None:
            try:
                with app.app_context():
                    db.engine.connect()
                    DB_AVAILABLE = True
                    print("✓ Database reconnection successful")
            except Exception as reconnect_error:
                return jsonify({
                    'error': 'Database not available',
                    'message': 'Database connection failed. Please check your DATABASE_URL environment variable.'
                }), 500
        else:
            return jsonify({
                'error': 'Database not available',
                'message': 'Database connection failed. Please ensure DATABASE_URL is set in your environment variables.'
            }), 500
    
    data = request.json
    username_or_email = data.get('username', '').strip()
    password = data.get('password', '')
    
    if not username_or_email or not password:
        return jsonify({'error': 'Username/email and password are required'}), 400
    
    try:
        # Find user by username or email - handle missing is_employee column
        def find_user():
            return User.query.filter(
                (User.username == username_or_email) | (User.email == username_or_email)
            ).first()
        
        try:
            user = find_user()
        except Exception as query_error:
            error_str = str(query_error).lower()
            if 'is_employee' in error_str and 'column' in error_str:
                # Column doesn't exist - try raw SQL fallback
                print(f"Warning: is_employee column missing, using raw SQL fallback for login")
                try:
                    with db.engine.connect() as conn:
                        result = conn.execute(db.text("""
                            SELECT id, username, email, password_hash, patreon_id, 
                                   access_token, refresh_token, membership_paid,
                                   last_checked, token_expires_at, patreon_connected,
                                   created_at, updated_at
                            FROM users 
                            WHERE username = :username OR email = :username
                            LIMIT 1
                        """), {'username': username_or_email})
                        row = result.fetchone()
                        if row:
                            # Create a minimal user object
                            from types import SimpleNamespace
                            user = SimpleNamespace(
                                id=row[0],
                                username=row[1],
                                email=row[2],
                                password_hash=row[3],
                                patreon_id=row[4],
                                access_token=row[5],
                                refresh_token=row[6],
                                membership_paid=row[7],
                                last_checked=row[8],
                                token_expires_at=row[9],
                                patreon_connected=row[10],
                                created_at=row[11],
                                updated_at=row[12]
                            )
                            # Add methods
                            def check_password(pwd):
                                if not user.password_hash:
                                    return False
                                return bcrypt.checkpw(pwd.encode('utf-8'), user.password_hash.encode('utf-8'))
                            user.check_password = check_password
                            def to_dict():
                                return {
                                    'id': user.patreon_id or user.username or str(user.id),
                                    'patreonId': user.patreon_id,
                                    'username': user.username,
                                    'email': user.email,
                                    'membershipPaid': user.membership_paid,
                                    'patreonConnected': user.patreon_connected,
                                    'lastChecked': user.last_checked.isoformat() if user.last_checked else None
                                }
                            user.to_dict = to_dict
                        else:
                            user = None
                except Exception as raw_error:
                    print(f"Error in raw SQL fallback for login: {raw_error}")
                    return jsonify({
                        'error': 'Database migration required',
                        'message': 'The is_employee column is missing from the users table. Please run the database migration.',
                        'details': 'Run: flask db upgrade (see RUN_MIGRATION.md for details)',
                        'migration_required': True
                    }), 500
            else:
                # Some other error, re-raise
                raise
        
        if not user:
            print(f"Login attempt failed: User not found for {username_or_email}")
            app.logger.warning(f"Login failed: User '{username_or_email}' not found in database")
            return jsonify({
                'error': 'Invalid username/email or password',
                'message': 'No user found with that username or email'
            }), 401
        
        # Check if user has a password set (users created via Patreon OAuth might not have passwords)
        if not user.password_hash:
            print(f"Login attempt failed: User {username_or_email} (ID: {user.id}) has no password set (Patreon-only account)")
            app.logger.warning(f"Login failed: User '{username_or_email}' has no password_hash - Patreon-only account")
            return jsonify({
                'error': 'This account was created via Patreon. Please use Patreon login instead.',
                'needsPatreonLogin': True,
                'message': 'This account does not have a password. Use Patreon login instead.'
            }), 401
        
        # Check password
        password_valid = user.check_password(password)
        if not password_valid:
            print(f"Login attempt failed: Invalid password for user {username_or_email} (ID: {user.id})")
            app.logger.warning(f"Login failed: Invalid password for user '{username_or_email}'")
            return jsonify({
                'error': 'Invalid username/email or password',
                'message': 'The password you entered is incorrect'
            }), 401
        
        print(f"Login successful for user {username_or_email} (ID: {user.id})")
        app.logger.info(f"Login successful for user '{username_or_email}' (ID: {user.id})")
        
        # Generate JWT token using flask-jwt-extended
        access_token = create_access_token(identity=str(user.id))
        
        user_data = user.to_dict()
        # Remove needsPatreonVerification - handled by cron job
        
        # Set JWT in httpOnly cookie
        response = jsonify({
            'success': True,
            'message': 'Login successful',
            'user': user_data
        })
        set_access_cookies(response, access_token)
        return response
        
    except Exception as e:
        print(f"Error in login: {e}")
        import traceback
        traceback.print_exc()
        app.logger.error(f"Error in login: {e}")
        error_message = str(e)
        # Provide more specific error messages
        if 'Database' in error_message or 'connection' in error_message.lower():
            return jsonify({
                'error': 'Database connection failed',
                'message': 'Unable to connect to database. Please try again later.'
            }), 500
        elif 'password' in error_message.lower():
            return jsonify({
                'error': 'Authentication failed',
                'message': 'Invalid username/email or password'
            }), 401
        else:
            return jsonify({
                'error': 'Login failed',
                'message': error_message
            }), 500

@app.route('/api/auth/verify-patreon', methods=['POST'])
@jwt_required()
def verify_patreon():
    """Manually verify Patreon membership status - Can be triggered by user from profile page"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 500
    
    try:
        # Get user from JWT token
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Find user by ID
        user = None
        if user_id.isdigit():
            user = User.query.get(int(user_id))
        if not user:
            user = User.query.filter_by(username=user_id).first()
        if not user:
            user = User.query.filter_by(patreon_id=user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if not user.patreon_connected or not user.access_token:
            return jsonify({
                'error': 'Patreon not connected',
                'message': 'Please connect your Patreon account first',
                'needsConnection': True
            }), 400
        
        # Check if token is expired
        if user.token_expires_at and user.token_expires_at < datetime.utcnow():
            # Try to refresh token
            if user.refresh_token:
                new_token_data = refresh_patreon_token(user.refresh_token)
                if new_token_data:
                    user.access_token = new_token_data.get('access_token')
                    if new_token_data.get('refresh_token'):
                        user.refresh_token = new_token_data.get('refresh_token')
                    expires_in = new_token_data.get('expires_in', 3600)
                    user.token_expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
                    db.session.commit()
                else:
                    return jsonify({
                        'error': 'Patreon token expired',
                        'message': 'Please reconnect your Patreon account',
                        'needsConnection': True
                    }), 401
            else:
                return jsonify({
                    'error': 'Patreon token expired',
                    'message': 'Please reconnect your Patreon account',
                    'needsConnection': True
                }), 401
        
        # Verify membership status with Patreon API
        headers = {
            "Authorization": f"Bearer {user.access_token}",
            "User-Agent": "VenturesApp/1.0 (+https://ventures.isharehow.app)"
        }
        
        identity_url = (
            "https://www.patreon.com/api/oauth2/v2/identity"
            "?fields[user]=id,email,full_name,image_url"
            "&include=memberships"
            "&fields[member]=patron_status,currently_entitled_amount_cents,last_charge_date,pledge_start"
        )
        
        user_res = requests.get(identity_url, headers=headers, timeout=10)
        
        if not user_res.ok:
            if user_res.status_code == 401:
                return jsonify({
                    'error': 'Patreon token invalid',
                    'message': 'Please reconnect your Patreon account',
                    'needsConnection': True
                }), 401
            return jsonify({'error': f'Patreon API error: {user_res.status_code}'}), 500
        
        user_data = user_res.json()
        data_obj = user_data.get('data', {})
        relationships = data_obj.get('relationships', {})
        
        # Check membership status
        is_paid_member = False
        memberships = relationships.get('memberships', {}).get('data', [])
        
        if memberships:
            included = user_data.get('included', [])
            for membership in memberships:
                membership_id = membership.get('id')
                for item in included:
                    if item.get('id') == membership_id and item.get('type') == 'member':
                        member_attrs = item.get('attributes', {})
                        patron_status = member_attrs.get('patron_status')
                        if patron_status == 'active_patron':
                            is_paid_member = True
                            break
        
        # Special handling for creator/admin
        patreon_user_id = data_obj.get('id', '')
        if patreon_user_id == '56776112':
            is_paid_member = False
        
        # Update user membership status
        user.membership_paid = is_paid_member  # Updated field name
        user.last_checked = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Patreon status verified',
            'membershipPaid': is_paid_member,  # Updated field name
            'user': user.to_dict()
        })
        
    except requests.exceptions.RequestException as e:
        print(f"Error verifying Patreon: {e}")
        return jsonify({'error': f'Failed to verify with Patreon: {str(e)}'}), 500
    except Exception as e:
        print(f"Error in verify_patreon: {e}")
        app.logger.error(f"Error in verify_patreon: {e}")
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/auth/me', methods=['GET'])
@jwt_required(optional=True)
def auth_me():
    """Get current authenticated user info - optimized for speed"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 500
    
    try:
        # Get user ID from JWT (optional - returns None if no token)
        user_id = get_jwt_identity()
        
        if not user_id:
            # No JWT token - user is not authenticated, but return 200 with authenticated: false
            # This allows frontend to handle gracefully without treating it as an error
            return jsonify({
                'authenticated': False,
                'message': 'No valid token found'
            }), 200
        
        # Find user by ID (could be integer ID, username, or patreon_id)
        # Handle missing is_employee column gracefully - check first, then use appropriate method
        user = None
        
        # First, try to check if is_employee column exists
        # Use try-except to handle any errors in the check itself
        # Cache the result to avoid repeated checks
        column_exists = False
        try:
            column_exists = check_is_employee_column_exists()
        except Exception as check_error:
            print(f"Error in check_is_employee_column_exists: {check_error}")
            column_exists = False  # Default to False (use fallback)
        
        # Try normal query first (faster), fallback to raw SQL only if needed
        if column_exists:
            try:
                if user_id and user_id.isdigit():
                    user = User.query.get(int(user_id))
                if not user and user_id:
                    user = User.query.filter_by(username=user_id).first()
                if not user and user_id:
                    user = User.query.filter_by(patreon_id=user_id).first()
                if not user and user_id:
                    user = User.query.filter_by(ens_name=user_id).first()
            except Exception as query_error:
                error_str = str(query_error).lower()
                if 'is_employee' in error_str and 'column' in error_str:
                    print(f"Unexpected: is_employee error despite check, using raw SQL fallback")
                    column_exists = False  # Force fallback
                else:
                    raise
        
        if not column_exists and not user:
            # Column doesn't exist - use raw SQL directly
            print(f"Warning: is_employee column missing in auth/me, using raw SQL fallback")
            try:
                with db.engine.connect() as conn:
                    result = conn.execute(db.text("""
                        SELECT id, username, email, password_hash, patreon_id, 
                               access_token, refresh_token, membership_paid,
                               last_checked, token_expires_at, patreon_connected,
                               created_at, updated_at
                        FROM users 
                        WHERE (id = :user_id OR username = :user_id OR patreon_id = :user_id)
                        LIMIT 1
                    """), {'user_id': user_id})
                    row = result.fetchone()
                    if row:
                        from types import SimpleNamespace
                        user = SimpleNamespace(
                            id=row[0],
                            username=row[1],
                            email=row[2],
                            password_hash=row[3],
                            patreon_id=row[4],
                            access_token=row[5],
                            refresh_token=row[6],
                            membership_paid=row[7],
                            last_checked=row[8],
                            token_expires_at=row[9],
                            patreon_connected=row[10],
                            created_at=row[11],
                            updated_at=row[12]
                        )
                        def to_dict():
                            return {
                                'id': user.patreon_id or user.username or str(user.id),
                                'patreonId': user.patreon_id,
                                'username': user.username,
                                'email': user.email,
                                'membershipPaid': user.membership_paid,
                                'patreonConnected': user.patreon_connected,
                                'lastChecked': user.last_checked.isoformat() if user.last_checked else None
                            }
                        user.to_dict = to_dict
            except Exception as raw_error:
                error_str = str(raw_error).lower()
                print(f"Error in raw SQL fallback for auth/me: {raw_error}")
                app.logger.error(f"Error fetching user from database: {raw_error}")
                
                # If user not found, return 404 instead of 500
                if 'not found' in error_str or 'no row' in error_str:
                    return jsonify({'error': 'User not found'}), 404
                
                return jsonify({
                    'error': 'Database error',
                    'message': 'Unable to fetch user information. Database migration may be required.',
                    'details': 'Run: flask db upgrade (see RUN_MIGRATION.md)',
                    'migration_required': True
                }), 500
        
        # If we still don't have a user after all lookups, return 404
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Also sync with UserProfile if it exists
        profile_data = {}
        try:
            profile_id = user.patreon_id or user.username or str(user.id)
            profile = UserProfile.query.get(profile_id)
            if profile:
                profile_data = profile.to_dict()
        except Exception as e:
            print(f"Warning: Failed to fetch profile: {e}")
        
        # Return combined user data - handle both regular User objects and SimpleNamespace fallback
        try:
            if hasattr(user, 'to_dict'):
                user_data = user.to_dict()
            else:
                # Fallback for SimpleNamespace objects
                user_data = {
                    'id': getattr(user, 'patreon_id', None) or getattr(user, 'username', None) or str(getattr(user, 'id', '')),
                    'patreonId': getattr(user, 'patreon_id', None),
                    'username': getattr(user, 'username', None),
                    'email': getattr(user, 'email', None),
                    'membershipPaid': getattr(user, 'membership_paid', False),
                    'patreonConnected': getattr(user, 'patreon_connected', False),
                    'lastChecked': getattr(user, 'last_checked', None).isoformat() if getattr(user, 'last_checked', None) else None
                }
            
            user_data.update({
                'name': profile_data.get('name', getattr(user, 'username', None) or getattr(user, 'email', None) or 'User'),
                'avatarUrl': profile_data.get('avatarUrl', ''),
                'membershipTier': profile_data.get('membershipTier'),
                'isPaidMember': getattr(user, 'membership_paid', False),  # Updated field name
                'isEmployee': profile_data.get('isEmployee', False) or getattr(user, 'is_employee', False),
                'isAdmin': getattr(user, 'is_admin', False),
                'authenticated': True  # Explicitly mark as authenticated
            })
            
            print(f"✓ User authenticated via JWT: {user_id}")
            return jsonify(user_data)
        except Exception as dict_error:
            print(f"Error creating user dict: {dict_error}")
            app.logger.error(f"Error creating user dict: {dict_error}")
            # Return minimal user data
            return jsonify({
                'id': getattr(user, 'patreon_id', None) or getattr(user, 'username', None) or str(getattr(user, 'id', '')),
                'username': getattr(user, 'username', None),
                'email': getattr(user, 'email', None),
                'authenticated': True,
                'name': getattr(user, 'username', None) or getattr(user, 'email', None) or 'User'
            })
    except Exception as e:
        error_str = str(e).lower()
        print(f"Error fetching user from database: {e}")
        app.logger.error(f"Error fetching user from database: {e}")
        
        # Check if it's the is_employee column error (should have been caught above, but just in case)
        if 'is_employee' in error_str and 'column' in error_str:
            return jsonify({
                'error': 'Database migration required',
                'message': 'The is_employee column is missing. Please run the database migration.',
                'details': 'Run: flask db upgrade (see RUN_MIGRATION.md)',
                'migration_required': True
            }), 500
        
        return jsonify({
            'error': 'Database error',
            'message': 'Unable to fetch user information. Please try again later.'
        }), 500

@app.route('/api/auth/logout', methods=['POST'])
@jwt_required()
def auth_logout():
    """Logout user by clearing JWT cookie"""
    response = jsonify({'message': 'Logged out successfully'})
    unset_jwt_cookies(response)
    return response

def refresh_patreon_token(refresh_token):
    """Refresh Patreon access token using refresh token"""
    token_url = "https://www.patreon.com/api/oauth2/token"
    data = {
        "grant_type": "refresh_token",
        "refresh_token": refresh_token,
        "client_id": os.environ.get('PATREON_CLIENT_ID'),
        "client_secret": os.environ.get('PATREON_CLIENT_SECRET')
    }
    try:
        response = requests.post(token_url, data=data, timeout=10)
        if response.ok:
            return response.json()
    except Exception as e:
        print(f"Error refreshing Patreon token: {e}")
    return None

@app.route('/api/auth/refresh', methods=['POST'])
@jwt_required()
def refresh_token():
    """Refresh Patreon access token if expired"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 500
    
    try:
        # Get user from JWT token
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Find user by ID
        user = None
        if user_id.isdigit():
            user = User.query.get(int(user_id))
        if not user:
            user = User.query.filter_by(username=user_id).first()
        if not user:
            user = User.query.filter_by(patreon_id=user_id).first()
        
        if not user or not user.refresh_token:
            return jsonify({'error': 'No refresh token available'}), 400
        
        # Check if token is expired or expiring soon (within 5 minutes)
        if user.token_expires_at and user.token_expires_at > datetime.utcnow() + timedelta(minutes=5):
            # Token still valid, return current JWT
            return jsonify({'message': 'Token still valid'})
        
        # Refresh Patreon token
        new_token_data = refresh_patreon_token(user.refresh_token)
        if not new_token_data:
            return jsonify({'error': 'Failed to refresh token'}), 500
        
        # Update user with new tokens
        user.access_token = new_token_data.get('access_token')
        if new_token_data.get('refresh_token'):
            user.refresh_token = new_token_data.get('refresh_token')
        expires_in = new_token_data.get('expires_in', 3600)
        user.token_expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
        db.session.commit()
        
        # Generate new JWT using flask-jwt-extended
        new_jwt = create_access_token(identity=str(user.id))
        
        # Set JWT in httpOnly cookie
        response = jsonify({'message': 'Token refreshed'})
        set_access_cookies(response, new_jwt)
        return response
    except Exception as e:
        print(f"Error in token refresh: {e}")
        app.logger.error(f"Error in token refresh: {e}")
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/auth/verify-and-create', methods=['POST'])
def verify_and_create_user():
    """
    Verify Patreon membership and create/update user in database.
    Requires either:
    1. An access token (preferred) - will get user info from token
    2. Or Patreon ID + email (manual entry, but requires access token for verification)
    """
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 500
    
    data = request.json
    patreon_id = data.get('patreon_id') or data.get('patreonId')
    access_token = data.get('access_token')
    email = data.get('email')
    
    if not access_token and not patreon_id:
        return jsonify({'error': 'Either access token or Patreon ID is required'}), 400
    
    try:
        # Access token is required to verify with Patreon API
        if not access_token:
            return jsonify({
                'error': 'Access token is required for verification',
                'message': 'Please provide a Patreon access token. You can get one by going through OAuth or from your Patreon account settings.'
            }), 400
        
        headers = {
            "Authorization": f"Bearer {access_token}",
            "User-Agent": "VenturesApp/1.0 (+https://ventures.isharehow.app)"
        }
        
        # Fetch user identity from Patreon API using their access token
        identity_url = (
            "https://www.patreon.com/api/oauth2/v2/identity"
            "?fields[user]=id,email,full_name,image_url"
            "&include=memberships"
            "&fields[member]=patron_status,currently_entitled_amount_cents,last_charge_date,pledge_start"
        )
        
        user_res = requests.get(identity_url, headers=headers, timeout=10)
        
        if not user_res.ok:
            if user_res.status_code == 401:
                return jsonify({
                    'error': 'Invalid or expired access token',
                    'message': 'The access token provided is invalid or has expired. Please get a new token via OAuth.'
                }), 401
            error_text = user_res.text
            return jsonify({
                'error': f'Patreon API error: {user_res.status_code}',
                'message': error_text[:200] if error_text else 'Unknown error'
            }), 500
        
        user_data = user_res.json()
        
        # Parse user data
        if 'data' not in user_data:
            return jsonify({'error': 'Invalid response from Patreon API'}), 500
        
        data_obj = user_data.get('data', {})
        attributes = data_obj.get('attributes', {})
        relationships = data_obj.get('relationships', {})
        
        # Get user ID from API response
        api_user_id = data_obj.get('id', '')
        if not api_user_id:
            return jsonify({'error': 'Could not get user ID from Patreon API'}), 500
        
        # If patreon_id was provided, verify it matches
        if patreon_id and api_user_id != patreon_id:
            return jsonify({
                'error': f'User ID mismatch',
                'message': f'Expected {patreon_id}, but token belongs to user {api_user_id}'
            }), 400
        
        user_name = attributes.get('full_name') or attributes.get('first_name') or 'Patreon User'
        user_email = attributes.get('email') or email
        user_avatar = attributes.get('image_url', '')
        
        # Check membership status - pull all data from Patreon API
        is_paid_member = False
        membership_tier = None
        membership_amount = 0
        lifetime_support_cents = 0
        last_charge_date = None
        membership_renewal_date = None
        
        memberships = relationships.get('memberships', {}).get('data', [])
        if memberships:
            included = user_data.get('included', [])
            for membership in memberships:
                membership_id = membership.get('id')
                for item in included:
                    if item.get('id') == membership_id and item.get('type') == 'member':
                        member_attrs = item.get('attributes', {})
                        patron_status = member_attrs.get('patron_status')
                        amount_cents = member_attrs.get('currently_entitled_amount_cents', 0)
                        lifetime_support_cents = member_attrs.get('lifetime_support_cents', 0) or amount_cents
                        
                        # Extract last charge date
                        last_charge_str = member_attrs.get('last_charge_date')
                        if last_charge_str:
                            try:
                                last_charge_date = datetime.fromisoformat(last_charge_str.replace('Z', '+00:00'))
                                # Calculate renewal date (typically monthly, so add 30 days)
                                membership_renewal_date = last_charge_date + timedelta(days=30)
                            except:
                                pass
                        
                        # Get tier name from campaign or calculate from amount
                        # Try to get tier name from campaign relationship
                        campaign_id = item.get('relationships', {}).get('campaign', {}).get('data', {}).get('id')
                        if campaign_id:
                            for campaign_item in included:
                                if campaign_item.get('id') == campaign_id and campaign_item.get('type') == 'campaign':
                                    campaign_attrs = campaign_item.get('attributes', {})
                                    # Try to get tier name from campaign or membership
                                    tier_name = campaign_attrs.get('name') or member_attrs.get('tier', {}).get('title')
                                    if tier_name:
                                        membership_tier = tier_name
                        
                        if patron_status == 'active_patron':
                            is_paid_member = True
                            membership_amount = amount_cents / 100
                            # If tier not found from campaign, calculate from amount
                            if not membership_tier:
                                if membership_amount >= 10:
                                    membership_tier = 'Premium'
                                elif membership_amount >= 5:
                                    membership_tier = 'Standard'
                                else:
                                    membership_tier = 'Basic'
                        break
        
        # Special handling for creator/admin
        if api_user_id == '56776112':
            is_paid_member = False
            membership_tier = None
            membership_amount = 0
        
        # Get refresh token from token response if available
        refresh_token = None
        # Note: Refresh token is only available during OAuth flow, not from manual token entry
        
        # Resolve ENS name from username if available, otherwise use patreon_id
        username_for_ens = user_data.get('attributes', {}).get('full_name') or api_user_id
        ens_data = resolve_or_create_ens(None, username_for_ens)
        
        # Create or update user in database
        user = User.query.filter_by(patreon_id=api_user_id).first()
        if not user:
            user = User(
                patreon_id=api_user_id,
                email=user_email,
                access_token=access_token,
                refresh_token=refresh_token,
                membership_paid=is_paid_member,  # Updated field name
                last_checked=datetime.utcnow(),
                patreon_connected=True,  # Auto-set since we have patreon_id
                ens_name=ens_data.get('ens_name'),
                crypto_address=ens_data.get('crypto_address'),
                content_hash=ens_data.get('content_hash')
            )
            # Set token expiration (default 1 hour, but tokens can vary)
            expires_in = 3600  # Default, actual expiration should come from token response
            user.token_expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
            db.session.add(user)
            print(f"✓ Created new user: {api_user_id}")
        else:
            user.email = user_email or user.email
            user.access_token = access_token
            if refresh_token:
                user.refresh_token = refresh_token
            user.membership_paid = is_paid_member  # Updated field name
            user.last_checked = datetime.utcnow()
            user.patreon_connected = True  # Auto-set since we have patreon_id
            # Update ENS data if not already set
            if not user.ens_name and ens_data.get('ens_name'):
                user.ens_name = ens_data.get('ens_name')
                user.crypto_address = ens_data.get('crypto_address')
                user.content_hash = ens_data.get('content_hash')
            expires_in = 3600
            user.token_expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
            print(f"✓ Updated existing user: {api_user_id}")
        
        # Also sync with UserProfile - use ENS name as ID if available
        profile_id = ens_data.get('ens_name') or api_user_id
        profile = UserProfile.query.get(profile_id)
        if not profile:
            profile = UserProfile(
                id=profile_id,
                email=user_email,
                name=user_name,
                avatar_url=user_avatar,
                patreon_id=api_user_id,
                membership_tier=membership_tier,
                is_paid_member=is_paid_member,
                membership_renewal_date=membership_renewal_date,
                lifetime_support_amount=lifetime_support_cents / 100 if lifetime_support_cents else None,
                ens_name=ens_data.get('ens_name'),
                crypto_address=ens_data.get('crypto_address'),
                content_hash=ens_data.get('content_hash')
            )
            db.session.add(profile)
        else:
            profile.email = user_email or profile.email
            profile.name = user_name or profile.name
            profile.avatar_url = user_avatar or profile.avatar_url
            profile.membership_tier = membership_tier
            profile.is_paid_member = is_paid_member
            profile.membership_renewal_date = membership_renewal_date
            if lifetime_support_cents:
                profile.lifetime_support_amount = lifetime_support_cents / 100
            # Update ENS data if not already set
            if not profile.ens_name and ens_data.get('ens_name'):
                profile.ens_name = ens_data.get('ens_name')
                profile.crypto_address = ens_data.get('crypto_address')
                profile.content_hash = ens_data.get('content_hash')
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'User verified and created/updated successfully',
            'user': {
                'id': ens_data.get('ens_name') or api_user_id,
                'ensName': ens_data.get('ens_name'),
                'cryptoAddress': ens_data.get('crypto_address'),
                'contentHash': ens_data.get('content_hash'),
                'patreonId': api_user_id,
                'email': user_email,
                'name': user_name,
                'isPaidMember': is_paid_member,
                'membershipTier': membership_tier,
                'membershipRenewalDate': membership_renewal_date.isoformat() if membership_renewal_date else None,
                'lifetimeSupportAmount': lifetime_support_cents / 100 if lifetime_support_cents else None
            }
        })
        
    except requests.exceptions.RequestException as e:
        print(f"Error verifying user with Patreon API: {e}")
        return jsonify({'error': f'Failed to verify with Patreon: {str(e)}'}), 500
    except Exception as e:
        print(f"Error in verify_and_create_user: {e}")
        app.logger.error(f"Error in verify_and_create_user: {e}")
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

# Profile Management Endpoints
@app.route('/api/profile', methods=['GET'])
@jwt_required(optional=True)
def get_profile():
    """Get current user's profile - accessible to all authenticated users regardless of payment status"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 500
    
    try:
        # Get user ID from JWT (optional - returns None if no token)
        user_id = get_jwt_identity()
        
        if not user_id:
            app.logger.warning("Profile endpoint: No JWT identity found")
            return jsonify({'error': 'Not authenticated', 'message': 'No valid token found'}), 401
        
        app.logger.info(f"Profile endpoint: Looking up user with identity: {user_id} (type: {type(user_id).__name__})")
        
        # Find user by ID - JWT identity is typically str(user.id) from create_access_token
        # Handle missing is_employee column gracefully - check first, then use appropriate method
        user = None
        user_id_str = str(user_id) if user_id else None
        
        # First, try to check if is_employee column exists
        try:
            column_exists = check_is_employee_column_exists()
        except Exception as check_error:
            print(f"Error in check_is_employee_column_exists for profile: {check_error}")
            column_exists = False  # Default to False (use fallback)
        
        if not column_exists:
            # Column doesn't exist - use raw SQL directly
            print(f"Warning: is_employee column missing in profile endpoint, using raw SQL fallback")
            try:
                with db.engine.connect() as conn:
                    result = conn.execute(db.text("""
                        SELECT id, username, email, password_hash, patreon_id, 
                               access_token, refresh_token, membership_paid,
                               last_checked, token_expires_at, patreon_connected,
                               created_at, updated_at
                        FROM users 
                        WHERE (id = :user_id OR username = :user_id OR patreon_id = :user_id)
                        LIMIT 1
                    """), {'user_id': user_id_str})
                    row = result.fetchone()
                    if row:
                        from types import SimpleNamespace
                        user = SimpleNamespace(
                            id=row[0],
                            username=row[1],
                            email=row[2],
                            password_hash=row[3],
                            patreon_id=row[4],
                            access_token=row[5],
                            refresh_token=row[6],
                            membership_paid=row[7],
                            last_checked=row[8],
                            token_expires_at=row[9],
                            patreon_connected=row[10],
                            created_at=row[11],
                            updated_at=row[12]
                        )
                        def to_dict():
                            return {
                                'id': user.patreon_id or user.username or str(user.id),
                                'patreonId': user.patreon_id,
                                'username': user.username,
                                'email': user.email,
                                'membershipPaid': user.membership_paid,
                                'patreonConnected': user.patreon_connected,
                                'lastChecked': user.last_checked.isoformat() if user.last_checked else None,
                                'createdAt': user.created_at.isoformat() if user.created_at else None
                            }
                        user.to_dict = to_dict
                        app.logger.info(f"Profile endpoint: Found user via raw SQL - ID: {user.id}, patreon_id: {user.patreon_id}, username: {user.username}")
            except Exception as raw_error:
                error_str = str(raw_error).lower()
                print(f"Error in raw SQL fallback for profile: {raw_error}")
                app.logger.error(f"Error fetching user from database: {raw_error}")
                
                # If user not found, return 404 instead of 500
                if 'not found' in error_str or 'no row' in error_str:
                    return jsonify({
                        'error': 'User not found',
                        'message': f'No user found with identity: {user_id}',
                        'identity': str(user_id)
                    }), 404
                
                return jsonify({
                    'error': 'Database error',
                    'message': 'Unable to fetch user information. Database migration may be required.',
                    'details': 'Run: flask db upgrade (see RUN_MIGRATION.md)',
                    'migration_required': True
                }), 500
        else:
            # Column exists - use normal SQLAlchemy queries
            # Try integer ID lookup first (most common case)
            if user_id_str and user_id_str.isdigit():
                try:
                    user = User.query.get(int(user_id_str))
                    app.logger.info(f"Profile endpoint: Looked up by integer ID: {user_id_str}, found: {user is not None}")
                    if user:
                        app.logger.info(f"Profile endpoint: Found user - ID: {user.id}, patreon_id: {user.patreon_id}, username: {user.username}")
                except Exception as e:
                    error_str = str(e).lower()
                    app.logger.error(f"Profile endpoint: Error looking up by integer ID: {e}")
                    # If we still get an is_employee error (shouldn't happen if check worked), use fallback
                    if 'is_employee' in error_str and 'column' in error_str:
                        print(f"Unexpected: is_employee error despite check, using raw SQL fallback")
                        # Use the same raw SQL fallback as above
                        try:
                            with db.engine.connect() as conn:
                                result = conn.execute(db.text("""
                                    SELECT id, username, email, password_hash, patreon_id, 
                                           access_token, refresh_token, membership_paid,
                                           last_checked, token_expires_at, patreon_connected,
                                           created_at, updated_at
                                    FROM users 
                                    WHERE (id = :user_id OR username = :user_id OR patreon_id = :user_id)
                                    LIMIT 1
                                """), {'user_id': user_id_str})
                                row = result.fetchone()
                                if row:
                                    from types import SimpleNamespace
                                    user = SimpleNamespace(
                                        id=row[0], username=row[1], email=row[2], password_hash=row[3],
                                        patreon_id=row[4], access_token=row[5], refresh_token=row[6],
                                        membership_paid=row[7], last_checked=row[8], token_expires_at=row[9],
                                        patreon_connected=row[10], created_at=row[11], updated_at=row[12]
                                    )
                                    def to_dict():
                                        return {
                                            'id': user.patreon_id or user.username or str(user.id),
                                            'patreonId': user.patreon_id, 'username': user.username,
                                            'email': user.email, 'membershipPaid': user.membership_paid,
                                            'patreonConnected': user.patreon_connected,
                                            'lastChecked': user.last_checked.isoformat() if user.last_checked else None,
                                            'createdAt': user.created_at.isoformat() if user.created_at else None
                                        }
                                    user.to_dict = to_dict
                        except Exception as raw_error2:
                            print(f"Error in secondary raw SQL fallback: {raw_error2}")
                            raise e  # Re-raise original error
                    else:
                        raise
            
            # Try username lookup
            if not user and user_id_str:
                try:
                    user = User.query.filter_by(username=user_id_str).first()
                    app.logger.info(f"Profile endpoint: Looked up by username: {user_id_str}, found: {user is not None}")
                except Exception as e:
                    error_str = str(e).lower()
                    app.logger.error(f"Profile endpoint: Error looking up by username: {e}")
                    if 'is_employee' in error_str and 'column' in error_str:
                        # Already handled above, skip
                        pass
                    else:
                        raise
            
            # Try patreon_id lookup
            if not user and user_id_str:
                try:
                    user = User.query.filter_by(patreon_id=user_id_str).first()
                    app.logger.info(f"Profile endpoint: Looked up by patreon_id: {user_id_str}, found: {user is not None}")
                except Exception as e:
                    error_str = str(e).lower()
                    app.logger.error(f"Profile endpoint: Error looking up by patreon_id: {e}")
                    if 'is_employee' in error_str and 'column' in error_str:
                        # Already handled above, skip
                        pass
                    else:
                        raise
        
        if not user:
            app.logger.error(f"Profile endpoint: User not found for identity: {user_id}")
            # Return more helpful error message
            return jsonify({
                'error': 'User not found',
                'message': f'No user found with identity: {user_id}',
                'identity': str(user_id)
            }), 404
        
        # Get UserProfile if it exists - use ENS name as ID if available
        profile_data = {}
        try:
            # Try ENS name first, then fall back to patreon_id, username, or id
            profile_id = None
            if hasattr(user, 'ens_name') and user.ens_name:
                profile_id = user.ens_name
            elif hasattr(user, 'patreon_id') and user.patreon_id:
                profile_id = user.patreon_id
            elif hasattr(user, 'username') and user.username:
                profile_id = user.username
            else:
                profile_id = str(getattr(user, 'id', ''))
            
            profile = UserProfile.query.get(profile_id)
            if profile:
                profile_data = profile.to_dict()
        except Exception as e:
            print(f"Warning: Failed to fetch profile: {e}")
        
        # Return combined user data (accessible regardless of payment status)
        # Handle both regular User objects and SimpleNamespace fallback
        try:
            if hasattr(user, 'to_dict'):
                user_data = user.to_dict()
            else:
                # Fallback for SimpleNamespace objects
                user_data = {
                    'id': getattr(user, 'ens_name', None) or getattr(user, 'patreon_id', None) or getattr(user, 'username', None) or str(getattr(user, 'id', '')),
                    'ensName': getattr(user, 'ens_name', None),
                    'cryptoAddress': getattr(user, 'crypto_address', None),
                    'contentHash': getattr(user, 'content_hash', None),
                    'patreonId': getattr(user, 'patreon_id', None),
                    'username': getattr(user, 'username', None),
                    'email': getattr(user, 'email', None),
                    'membershipPaid': getattr(user, 'membership_paid', False),
                    'patreonConnected': getattr(user, 'patreon_connected', False),
                    'lastChecked': getattr(user, 'last_checked', None).isoformat() if getattr(user, 'last_checked', None) else None,
                    'createdAt': getattr(user, 'created_at', None).isoformat() if getattr(user, 'created_at', None) else None
                }
        except Exception as dict_error:
            print(f"Error creating user dict in profile: {dict_error}")
            # Fallback for minimal user data if to_dict fails
            user_data = {
                'id': getattr(user, 'patreon_id', None) or getattr(user, 'username', None) or str(getattr(user, 'id', '')),
                'username': getattr(user, 'username', None),
                'email': getattr(user, 'email', None),
                'name': getattr(user, 'username', None) or getattr(user, 'email', None) or 'User'
            }
        
        # Get createdAt from UserProfile or fall back to User model's created_at
        created_at = profile_data.get('createdAt')
        if not created_at:
            if hasattr(user, 'created_at') and user.created_at:
                created_at = user.created_at.isoformat() if hasattr(user.created_at, 'isoformat') else str(user.created_at)
            else:
                created_at = user_data.get('createdAt')
        
        # Determine admin status (check multiple sources)
        is_admin = False
        if hasattr(user, 'is_admin'):
            is_admin = bool(user.is_admin)
        # Check special identifiers if is_admin field is False or doesn't exist
        if not is_admin:
            if hasattr(user, 'patreon_id') and user.patreon_id == '56776112':
                is_admin = True
            elif hasattr(user, 'username') and user.username:
                username_lower = user.username.lower()
                if username_lower in ['isharehow', 'admin']:
                    is_admin = True
            elif hasattr(user, 'email') and user.email:
                email_lower = user.email.lower()
                if email_lower == 'jeliyah@isharehowlabs.com':
                    is_admin = True
        
        user_data.update({
            'name': profile_data.get('name', getattr(user, 'username', None) or getattr(user, 'email', None) or 'User'),
            'avatar': profile_data.get('avatarUrl', ''),  # Map avatarUrl to avatar for frontend
            'avatarUrl': profile_data.get('avatarUrl', ''),  # Keep both for compatibility
            # ENS data - prefer from profile, fall back to user
            'ensName': profile_data.get('ensName') or user_data.get('ensName') or getattr(user, 'ens_name', None),
            'cryptoAddress': profile_data.get('cryptoAddress') or user_data.get('cryptoAddress') or getattr(user, 'crypto_address', None),
            'contentHash': profile_data.get('contentHash') or user_data.get('contentHash') or getattr(user, 'content_hash', None),
            'membershipTier': profile_data.get('membershipTier'),
            'isPaidMember': getattr(user, 'membership_paid', False),  # Show current payment status
            'isEmployee': profile_data.get('isEmployee', False) or getattr(user, 'is_employee', False),
            'isAdmin': is_admin,  # Use computed admin status
            'lastChecked': getattr(user, 'last_checked', None).isoformat() if getattr(user, 'last_checked', None) and hasattr(getattr(user, 'last_checked', None), 'isoformat') else user_data.get('lastChecked'),
            'patreonConnected': getattr(user, 'patreon_connected', False) or (getattr(user, 'patreon_id', None) is not None),
            'createdAt': created_at,  # Include createdAt from UserProfile or User model
            'membershipRenewalDate': profile_data.get('membershipRenewalDate'),
            'lifetimeSupportAmount': profile_data.get('lifetimeSupportAmount')
        })
        
        # Update ID to use ENS name if available
        if user_data.get('ensName'):
            user_data['id'] = user_data['ensName']
        
        return jsonify(user_data)
    except Exception as e:
        print(f"Error fetching profile: {e}")
        app.logger.error(f"Error fetching profile: {e}")
        return jsonify({'error': 'Database error'}), 500

@app.route('/api/profile/verify-ens', methods=['POST'])
@jwt_required()
def verify_ens():
    """Verify and refresh ENS data for the current user"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 500
    
    try:
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Find user
        user = None
        if user_id.isdigit():
            user = User.query.get(int(user_id))
        if not user:
            user = User.query.filter_by(username=user_id).first()
        if not user:
            user = User.query.filter_by(patreon_id=user_id).first()
        if not user:
            user = User.query.filter_by(ens_name=user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get username for ENS resolution
        username = user.username or user.email or str(user.id)
        if not username:
            return jsonify({'error': 'Username not found'}), 400
        
        # Resolve ENS data using web3.py
        ens_data = resolve_or_create_ens(user.id, username)
        
        # Update user with resolved ENS data
        if ens_data.get('ens_name'):
            user.ens_name = ens_data.get('ens_name')
        if ens_data.get('crypto_address'):
            user.crypto_address = ens_data.get('crypto_address')
        if ens_data.get('content_hash'):
            user.content_hash = ens_data.get('content_hash')
        
        db.session.commit()
        
        # Also update UserProfile if it exists
        try:
            profile_id = user.ens_name or user.patreon_id or user.username or str(user.id)
            profile = UserProfile.query.get(profile_id)
            if profile:
                if ens_data.get('ens_name'):
                    profile.ens_name = ens_data.get('ens_name')
                if ens_data.get('crypto_address'):
                    profile.crypto_address = ens_data.get('crypto_address')
                if ens_data.get('content_hash'):
                    profile.content_hash = ens_data.get('content_hash')
                db.session.commit()
        except:
            pass
        
        return jsonify({
            'success': True,
            'message': 'ENS data refreshed successfully',
            'ensData': ens_data
        })
    except Exception as e:
        print(f"Error verifying ENS: {e}")
        app.logger.error(f"Error verifying ENS: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to verify ENS data'}), 500

@app.route('/api/profile', methods=['PUT', 'OPTIONS'])
@jwt_required(optional=True)
def update_profile():
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        response = jsonify({'message': 'OK'})
        response.headers.add('Access-Control-Allow-Origin', 'https://ventures.isharehow.app')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        response.headers.add('Access-Control-Allow-Methods', 'PUT, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response
    
    """Update user's profile (email and name) - accessible to all authenticated users"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 500
    
    try:
        # Get user ID from JWT
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({'error': 'Not authenticated'}), 401
        
        # Find user by ID
        user = None
        if user_id and user_id.isdigit():
            user = User.query.get(int(user_id))
        if not user and user_id:
            user = User.query.filter_by(username=user_id).first()
        if not user and user_id:
            user = User.query.filter_by(patreon_id=user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        profile_id = user.patreon_id or user.username or str(user.id)
        
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        new_email = data.get('email')
        new_name = data.get('name')
        
        # Validate email if provided
        if new_email is not None:
            if not new_email or '@' not in new_email:
                return jsonify({'error': 'Invalid email format'}), 400
        
        # Validate name if provided
        if new_name is not None:
            if not new_name or len(new_name.strip()) == 0:
                return jsonify({'error': 'Name cannot be empty'}), 400
        
        # Update User model
        if new_email is not None:
            user.email = new_email
        
        # Update UserProfile if it exists
        profile = UserProfile.query.get(profile_id)
        if not profile:
            # Create profile if it doesn't exist
            profile = UserProfile(
                id=profile_id,
                email=new_email if new_email is not None else user.email,
                name=new_name if new_name is not None else user.username or user.email,
                patreon_id=user.patreon_id,
                is_paid_member=user.membership_paid
            )
            db.session.add(profile)
        else:
            # Update existing profile
            if new_email is not None:
                profile.email = new_email
            if new_name is not None:
                profile.name = new_name
            profile.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        # Refresh profile data to get updated values
        db.session.refresh(profile)
        profile_data = profile.to_dict()
        
        # Return updated profile with all fields (matching GET endpoint format)
        user_data = user.to_dict()
        # Get createdAt from UserProfile or fall back to User model's created_at
        created_at = profile_data.get('createdAt')
        if not created_at and user.created_at:
            created_at = user.created_at.isoformat()
        
        user_data.update({
            'name': profile_data.get('name', user.username or user.email or 'User'),
            'avatar': profile_data.get('avatarUrl', ''),  # Map avatarUrl to avatar for frontend
            'avatarUrl': profile_data.get('avatarUrl', ''),  # Keep both for compatibility
            'membershipTier': profile_data.get('membershipTier'),
            'isPaidMember': user.membership_paid,
            'isTeamMember': profile_data.get('isTeamMember', False),
            'lastChecked': user.last_checked.isoformat() if user.last_checked else None,
            'patreonConnected': user.patreon_connected,
            'createdAt': created_at,  # Include createdAt from UserProfile or User model
            'membershipPaymentDate': profile_data.get('membershipPaymentDate'),
            'membershipRenewalDate': profile_data.get('membershipRenewalDate'),
            'lastChargeDate': profile_data.get('membershipPaymentDate'),  # Alias for frontend
            'pledgeStart': profile_data.get('membershipRenewalDate'),  # Alias for frontend
            # Membership amount fields - these would need to be stored in UserProfile or calculated
            'membershipAmount': None,  # Would need to be stored in UserProfile
            'lifetimeSupportAmount': None  # Would need to be stored in UserProfile
        })
        
        return jsonify(user_data)
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error updating profile: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to update profile', 'message': str(e)}), 500

# Notification Management Endpoints
@app.route('/api/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    """Get user's notifications (paginated)"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 500
    
    try:
        # Get user ID from JWT
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({'error': 'Not authenticated'}), 401
        
        # Find user by ID
        user = None
        if user_id and str(user_id).isdigit():
            user = User.query.get(int(user_id))
        if not user and user_id:
            user = User.query.filter_by(username=str(user_id)).first()
        if not user and user_id:
            user = User.query.filter_by(patreon_id=str(user_id)).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        unread_only = request.args.get('unread_only', 'false').lower() == 'true'
        
        # Build query
        query = Notification.query.filter_by(user_id=user.id)
        if unread_only:
            query = query.filter_by(read=False)
        query = query.order_by(Notification.created_at.desc())
        
        # Paginate
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        notifications = pagination.items
        
        return jsonify({
            'notifications': [n.to_dict() for n in notifications],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages
            },
            'unreadCount': Notification.query.filter_by(user_id=user.id, read=False).count()
        })
    except Exception as e:
        app.logger.error(f"Error fetching notifications: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to fetch notifications', 'message': str(e)}), 500

@app.route('/api/notifications', methods=['POST'])
@jwt_required()
def create_notification():
    """Create a new notification"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 500
    
    try:
        # Get user ID from JWT
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({'error': 'Not authenticated'}), 401
        
        # Find user by ID
        user = None
        if user_id and str(user_id).isdigit():
            user = User.query.get(int(user_id))
        if not user and user_id:
            user = User.query.filter_by(username=str(user_id)).first()
        if not user and user_id:
            user = User.query.filter_by(patreon_id=str(user_id)).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        if not data.get('type') or not data.get('title') or not data.get('message'):
            return jsonify({'error': 'Missing required fields: type, title, message'}), 400
        
        # Create notification
        notification = Notification(
            user_id=user.id,
            type=data['type'],
            title=data['title'],
            message=data['message'],
            read=False,
            notification_metadata=json.dumps(data.get('metadata', {})) if data.get('metadata') else None
        )
        db.session.add(notification)
        db.session.commit()
        
        # Emit socket.io event
        socketio.emit('notification:new', notification.to_dict(), room=f'user_{user.id}')
        
        # Send push notification if available (async, don't block)
        try:
            if WEBPUSH_AVAILABLE:
                send_push_notification(user.id, notification)
        except Exception as push_error:
            app.logger.warning(f"Failed to send push notification: {push_error}")
        
        return jsonify(notification.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error creating notification: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to create notification', 'message': str(e)}), 500

@app.route('/api/notifications/<int:notification_id>/read', methods=['PUT'])
@jwt_required()
def mark_notification_read(notification_id):
    """Mark a notification as read"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 500
    
    try:
        # Get user ID from JWT
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({'error': 'Not authenticated'}), 401
        
        # Find user by ID
        user = None
        if user_id and str(user_id).isdigit():
            user = User.query.get(int(user_id))
        if not user and user_id:
            user = User.query.filter_by(username=str(user_id)).first()
        if not user and user_id:
            user = User.query.filter_by(patreon_id=str(user_id)).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Find notification
        notification = Notification.query.filter_by(id=notification_id, user_id=user.id).first()
        if not notification:
            return jsonify({'error': 'Notification not found'}), 404
        
        # Mark as read
        notification.read = True
        notification.updated_at = datetime.utcnow()
        db.session.commit()
        
        # Emit socket.io event
        socketio.emit('notification:read', {'id': str(notification.id), 'userId': str(user.id)}, room=f'user_{user.id}')
        
        return jsonify(notification.to_dict())
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error marking notification as read: {e}")
        return jsonify({'error': 'Failed to mark notification as read', 'message': str(e)}), 500

@app.route('/api/notifications/read-all', methods=['PUT'])
@jwt_required()
def mark_all_notifications_read():
    """Mark all user's notifications as read"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 500
    
    try:
        # Get user ID from JWT
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({'error': 'Not authenticated'}), 401
        
        # Find user by ID
        user = None
        if user_id and str(user_id).isdigit():
            user = User.query.get(int(user_id))
        if not user and user_id:
            user = User.query.filter_by(username=str(user_id)).first()
        if not user and user_id:
            user = User.query.filter_by(patreon_id=str(user_id)).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Mark all as read
        updated = Notification.query.filter_by(user_id=user.id, read=False).update({'read': True, 'updated_at': datetime.utcnow()})
        db.session.commit()
        
        # Emit socket.io event
        socketio.emit('notification:read-all', {'userId': str(user.id), 'count': updated}, room=f'user_{user.id}')
        
        return jsonify({'message': f'Marked {updated} notifications as read', 'count': updated})
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error marking all notifications as read: {e}")
        return jsonify({'error': 'Failed to mark all notifications as read', 'message': str(e)}), 500

@app.route('/api/notifications/<int:notification_id>', methods=['DELETE'])
@jwt_required()
def delete_notification(notification_id):
    """Delete a notification"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 500
    
    try:
        # Get user ID from JWT
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({'error': 'Not authenticated'}), 401
        
        # Find user by ID
        user = None
        if user_id and str(user_id).isdigit():
            user = User.query.get(int(user_id))
        if not user and user_id:
            user = User.query.filter_by(username=str(user_id)).first()
        if not user and user_id:
            user = User.query.filter_by(patreon_id=str(user_id)).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Find notification
        notification = Notification.query.filter_by(id=notification_id, user_id=user.id).first()
        if not notification:
            return jsonify({'error': 'Notification not found'}), 404
        
        # Delete notification
        db.session.delete(notification)
        db.session.commit()
        
        # Emit socket.io event
        socketio.emit('notification:deleted', {'id': str(notification.id), 'userId': str(user.id)}, room=f'user_{user.id}')
        
        return jsonify({'message': 'Notification deleted'})
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error deleting notification: {e}")
        return jsonify({'error': 'Failed to delete notification', 'message': str(e)}), 500

@app.route('/api/notifications/broadcast', methods=['POST'])
@jwt_required()
def broadcast_notification():
    """Broadcast a notification to all users (admin only)"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 500
    
    try:
        # Get user ID from JWT
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({'error': 'Not authenticated'}), 401
        
        # Find user by ID
        admin_user = None
        if user_id and str(user_id).isdigit():
            admin_user = User.query.get(int(user_id))
        if not admin_user and user_id:
            admin_user = User.query.filter_by(username=str(user_id)).first()
        if not admin_user and user_id:
            admin_user = User.query.filter_by(patreon_id=str(user_id)).first()
        
        if not admin_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if user is admin (Patreon ID 56776112, username 'isharehow' or 'admin', or email 'jeliyah@isharehowlabs.com')
        is_admin = (admin_user.patreon_id == 56776112 or 
                   admin_user.username == 'isharehow' or 
                   admin_user.username == 'admin' or
                   admin_user.email == 'jeliyah@isharehowlabs.com' or
                   str(admin_user.id) == 'admin')
        if not is_admin:
            return jsonify({'error': 'Unauthorized: Admin access required'}), 403
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        if not data.get('type') or not data.get('title') or not data.get('message'):
            return jsonify({'error': 'Missing required fields: type, title, message'}), 400
        
        # Get all users
        all_users = User.query.all()
        created_notifications = []
        
        # Create notification for each user
        for user in all_users:
            notification = Notification(
                user_id=user.id,
                type=data['type'],
                title=data['title'],
                message=data['message'],
                read=False,
                notification_metadata=json.dumps(data.get('metadata', {})) if data.get('metadata') else None
            )
            db.session.add(notification)
            created_notifications.append(notification)
            
            # Emit socket.io event
            socketio.emit('notification:new', notification.to_dict(), room=f'user_{user.id}')
        
        db.session.commit()
        
        # Send push notifications (async, don't block)
        if WEBPUSH_AVAILABLE:
            for notification in created_notifications:
                try:
                    send_push_notification(notification.user_id, notification)
                except Exception as push_error:
                    app.logger.warning(f"Failed to send push notification to user {notification.user_id}: {push_error}")
        
        return jsonify({
            'message': f'Notification broadcasted to {len(created_notifications)} users',
            'count': len(created_notifications)
        }), 201
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error broadcasting notification: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to broadcast notification', 'message': str(e)}), 500

# Push Notification Endpoints
@app.route('/api/notifications/push/subscribe', methods=['POST'])
@jwt_required()
def subscribe_push():
    """Subscribe user to push notifications"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 500
    
    try:
        # Get user ID from JWT
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({'error': 'Not authenticated'}), 401
        
        # Find user by ID
        user = None
        if user_id and str(user_id).isdigit():
            user = User.query.get(int(user_id))
        if not user and user_id:
            user = User.query.filter_by(username=str(user_id)).first()
        if not user and user_id:
            user = User.query.filter_by(patreon_id=str(user_id)).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        if not data or not data.get('endpoint') or not data.get('keys'):
            return jsonify({'error': 'Missing required fields: endpoint, keys'}), 400
        
        # Check if subscription already exists
        existing = PushSubscription.query.filter_by(
            user_id=user.id,
            endpoint=data['endpoint']
        ).first()
        
        if existing:
            # Update existing subscription
            existing.p256dh = data['keys']['p256dh']
            existing.auth = data['keys']['auth']
            existing.updated_at = datetime.utcnow()
        else:
            # Create new subscription
            subscription = PushSubscription(
                user_id=user.id,
                endpoint=data['endpoint'],
                p256dh=data['keys']['p256dh'],
                auth=data['keys']['auth']
            )
            db.session.add(subscription)
        
        db.session.commit()
        return jsonify({'message': 'Push subscription saved'}), 200
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error subscribing to push: {e}")
        return jsonify({'error': 'Failed to subscribe', 'message': str(e)}), 500

@app.route('/api/notifications/push/unsubscribe', methods=['POST'])
@jwt_required()
def unsubscribe_push():
    """Unsubscribe user from push notifications"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 500
    
    try:
        # Get user ID from JWT
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({'error': 'Not authenticated'}), 401
        
        # Find user by ID
        user = None
        if user_id and str(user_id).isdigit():
            user = User.query.get(int(user_id))
        if not user and user_id:
            user = User.query.filter_by(username=str(user_id)).first()
        if not user and user_id:
            user = User.query.filter_by(patreon_id=str(user_id)).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        endpoint = data.get('endpoint') if data else None
        
        if endpoint:
            # Delete specific subscription
            PushSubscription.query.filter_by(user_id=user.id, endpoint=endpoint).delete()
        else:
            # Delete all subscriptions for user
            PushSubscription.query.filter_by(user_id=user.id).delete()
        
        db.session.commit()
        return jsonify({'message': 'Push subscription removed'}), 200
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error unsubscribing from push: {e}")
        return jsonify({'error': 'Failed to unsubscribe', 'message': str(e)}), 500


@require_session
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    if not DB_AVAILABLE:
        return jsonify({'tasks': [], 'error': 'Database not available. Please check database configuration.'}), 503
    try:
        tasks = Task.query.all()
        return jsonify({'tasks': [task.to_dict() for task in tasks]})
    except Exception as e:
        print(f"Error fetching tasks: {e}")
        import traceback
        traceback.print_exc()
        # Return empty list if database is unavailable
        return jsonify({'tasks': [], 'error': 'Database temporarily unavailable'}), 200

@require_session
@app.route('/api/tasks', methods=['POST'])
def create_task():
    if not DB_AVAILABLE:
        return jsonify({
            'error': 'Database not available',
            'message': 'Database is not configured or unavailable. Please check your database configuration and ensure psycopg is properly installed.'
        }), 503
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Invalid request', 'message': 'Request body is required'}), 400
        
        # Validate required fields
        if not data.get('title') or not data['title'].strip():
            return jsonify({'error': 'Validation error', 'message': 'Title is required'}), 400
        
        # Create task
        task = Task(
            id=str(uuid.uuid4()),
            title=data['title'].strip(),
            description=data.get('description', '') or '',
            hyperlinks=json.dumps(data.get('hyperlinks', [])),
            status=data.get('status', 'pending'),
            support_request_id=data.get('supportRequestId') or data.get('support_request_id')  # Link to support request if provided
        )
        
        try:
            db.session.add(task)
            db.session.commit()
        except Exception as db_error:
            if db and hasattr(db, 'session'):
                try:
                    db.session.rollback()
                except:
                    pass  # Ignore rollback errors if session is broken
            print(f"Database error creating task: {db_error}")
            import traceback
            traceback.print_exc()
            # Check if it's a connection error
            error_str = str(db_error).lower()
            if 'connection' in error_str or 'database' in error_str or 'operational' in error_str or 'import' in error_str or 'psycopg' in error_str:
                return jsonify({
                    'error': 'Database unavailable', 
                    'message': 'Database connection failed. Please check your database configuration and ensure psycopg is properly installed.'
                }), 503
            raise db_error
        
        user_info = get_user_info()
        task_data = task.to_dict()
        task_data['userId'] = user_info['id'] if user_info else 'anonymous'
        task_data['userRole'] = user_info['role'] if user_info else 'mentee'
        socketio.emit('task_created', task_data)
        return jsonify({'task': task.to_dict()}), 201
    except KeyError as e:
        print(f"Missing required field: {e}")
        return jsonify({'error': 'Validation error', 'message': f'Missing required field: {str(e)}'}), 400
    except Exception as e:
        print(f"Error creating task: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to create task', 'message': str(e)}), 500

@require_session
@app.route('/api/tasks/<task_id>', methods=['PUT'])
def update_task(task_id):
    if not DB_AVAILABLE:
        return jsonify({
            'error': 'Database not available',
            'message': 'Database is not configured or unavailable. Please check your database configuration.'
        }), 503
    try:
        task = Task.query.get_or_404(task_id)
        data = request.get_json()
        task.title = data.get('title', task.title)
        task.description = data.get('description', task.description)
        task.hyperlinks = json.dumps(data.get('hyperlinks', json.loads(task.hyperlinks) if task.hyperlinks else []))
        task.status = data.get('status', task.status)
        # Update support request link if provided
        if 'supportRequestId' in data or 'support_request_id' in data:
            task.support_request_id = data.get('supportRequestId') or data.get('support_request_id') or None
        db.session.commit()
        user_info = get_user_info()
        task_data = task.to_dict()
        task_data['userId'] = user_info['id'] if user_info else 'anonymous'
        task_data['userRole'] = user_info['role'] if user_info else 'mentee'
        socketio.emit('task_updated', task_data)
        return jsonify({'task': task.to_dict()})
    except Exception as e:
        print(f"Error updating task: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to update task', 'message': str(e)}), 500

@require_session
@app.route('/api/tasks/<task_id>', methods=['DELETE'])
def delete_task(task_id):
    if not DB_AVAILABLE:
        return jsonify({
            'error': 'Database not available',
            'message': 'Database is not configured or unavailable. Please check your database configuration.'
        }), 503
    try:
        task = Task.query.get_or_404(task_id)
        db.session.delete(task)
        db.session.commit()
        user_info = get_user_info()
        socketio.emit('task_deleted', {'id': task_id, 'userId': user_info['id'] if user_info else 'anonymous'})
        return jsonify({'success': True})
    except Exception as e:
        print(f"Error deleting task: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to delete task', 'message': str(e)}), 500


# ============================================================================
# WELLNESS API ENDPOINTS
# ============================================================================

# Helper function to get or create user profile

def parse_date_safely(date_string):
    """Safely parse date strings in various ISO formats"""
    if not date_string:
        return None
    try:
        # Try full ISO format first (with time)
        return datetime.fromisoformat(date_string)
    except (ValueError, AttributeError):
        try:
            # Try date-only format (YYYY-MM-DD) and add time
            if 'T' not in date_string:
                return datetime.fromisoformat(date_string + 'T00:00:00')
            raise
        except Exception as e:
            print(f"Error parsing date '{date_string}': {e}")
            return None

def get_or_create_user_profile():
    """Get or create user profile from session data"""
    if 'user' not in session:
        return None, jsonify({'error': 'Not authenticated'}), 401
    
    user_data = session['user']
    user_id = user_data.get('id')
    
    if not user_id:
        return None, jsonify({'error': 'Invalid session data'}), 400
    
    # Check if profile exists
    profile = UserProfile.query.get(user_id)
    
    # Create profile if it doesn't exist
    if not profile:
        profile = UserProfile(
            id=user_id,
            email=user_data.get('email'),
            name=user_data.get('name'),
            avatar_url=user_data.get('avatar'),
            patreon_id=user_data.get('patreonId'),
            membership_tier=user_data.get('membershipTier'),
            is_paid_member=user_data.get('isPaidMember', False)
        )
        db.session.add(profile)
        db.session.commit()
        print(f"✓ Created new user profile: {user_id}")
    
    return profile, None, None

# Aura Progress Endpoints
@app.route('/api/wellness/aura', methods=['GET'])
def get_aura_progress():
    """Get all aura progress for the current user"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    profile, error_response, error_code = get_or_create_user_profile()
    if error_response:
        return error_response, error_code
    
    try:
        # Get all aura progress for user
        auras = AuraProgress.query.filter_by(user_id=profile.id).all()
        
        # If no auras exist, create default ones
        if not auras:
            default_auras = ['Physical', 'Mental', 'Spiritual', 'Nutrition', 'Sleep', 'Stress', 'Energy']
            for aura_type in default_auras:
                aura = AuraProgress(
                    id=str(uuid.uuid4()),
                    user_id=profile.id,
                    aura_type=aura_type,
                    value=50  # Starting value
                )
                db.session.add(aura)
            db.session.commit()
            auras = AuraProgress.query.filter_by(user_id=profile.id).all()
        
        return jsonify({
            'auras': [aura.to_dict() for aura in auras]
        })
    except Exception as e:
        print(f"Error fetching aura progress: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to fetch aura progress'}), 500

@app.route('/api/wellness/aura', methods=['PUT'])
def update_aura_progress():
    """Update aura progress values (batch update)"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    profile, error_response, error_code = get_or_create_user_profile()
    if error_response:
        return error_response, error_code
    
    try:
        data = request.json
        updates = data.get('auras', [])
        
        updated_auras = []
        for update in updates:
            aura_type = update.get('auraType')
            value = update.get('value')
            
            if not aura_type or value is None:
                continue
            
            # Clamp value between 0 and 100
            value = max(0, min(100, int(value)))
            
            # Find existing aura or create new one
            aura = AuraProgress.query.filter_by(
                user_id=profile.id,
                aura_type=aura_type
            ).first()
            
            if aura:
                aura.value = value
                aura.updated_at = datetime.utcnow()
            else:
                aura = AuraProgress(
                    id=str(uuid.uuid4()),
                    user_id=profile.id,
                    aura_type=aura_type,
                    value=value
                )
                db.session.add(aura)
            
            updated_auras.append(aura)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'auras': [aura.to_dict() for aura in updated_auras]
        })
    except Exception as e:
        db.session.rollback()
        print(f"Error updating aura progress: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to update aura progress'}), 500

# Activities Endpoints
@app.route('/api/wellness/activities', methods=['GET'])
def get_activities():
    """Get wellness activities for the current user"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    profile, error_response, error_code = get_or_create_user_profile()
    if error_response:
        return error_response, error_code
    
    try:
        # Optional filters
        activity_type = request.args.get('type')
        limit = request.args.get('limit', 50, type=int)
        
        query = WellnessActivity.query.filter_by(user_id=profile.id)
        
        if activity_type:
            query = query.filter_by(activity_type=activity_type)
        
        activities = query.order_by(WellnessActivity.completion_date.desc()).limit(limit).all()
        
        return jsonify({
            'activities': [activity.to_dict() for activity in activities]
        })
    except Exception as e:
        print(f"Error fetching activities: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to fetch activities'}), 500

@app.route('/api/wellness/activities', methods=['POST'])
def create_activity():
    """Log a new wellness activity"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    profile, error_response, error_code = get_or_create_user_profile()
    if error_response:
        return error_response, error_code
    
    try:
        data = request.json
        
        activity = WellnessActivity(
            id=str(uuid.uuid4()),
            user_id=profile.id,
            activity_type=data.get('activityType', 'general'),
            activity_name=data.get('activityName', 'Unnamed Activity'),
            completed=data.get('completed', True),
            notes=data.get('notes')
        )
        
        db.session.add(activity)
        
        # Auto-update aura based on activity type
        aura_mapping = {
            'wellness_lab': 'Mental',
            'rise_cycling': 'Physical',
            'spiritual_journey': 'Spiritual'
        }
        
        aura_type = aura_mapping.get(activity.activity_type)
        if aura_type:
            aura = AuraProgress.query.filter_by(
                user_id=profile.id,
                aura_type=aura_type
            ).first()
            
            if aura:
                # Add 5-10 points for completing an activity (configurable)
                aura.value = min(100, aura.value + 8)
                aura.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'activity': activity.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error creating activity: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to create activity'}), 500

# Goals Endpoints
@app.route('/api/wellness/goals', methods=['GET'])
def get_goals():
    """Get all goals for the current user"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    profile, error_response, error_code = get_or_create_user_profile()
    if error_response:
        return error_response, error_code
    
    try:
        status = request.args.get('status', 'active')
        
        query = WellnessGoal.query.filter_by(user_id=profile.id)
        if status:
            query = query.filter_by(status=status)
        
        goals = query.order_by(WellnessGoal.created_at.desc()).all()
        
        return jsonify({
            'goals': [goal.to_dict() for goal in goals]
        })
    except Exception as e:
        print(f"Error fetching goals: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to fetch goals'}), 500

@app.route('/api/wellness/goals', methods=['POST'])
def create_goal():
    """Create a new wellness goal"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    profile, error_response, error_code = get_or_create_user_profile()
    if error_response:
        return error_response, error_code
    
    try:
        data = request.json
        
        goal = WellnessGoal(
            id=str(uuid.uuid4()),
            user_id=profile.id,
            title=data.get('title', 'Untitled Goal'),
            description=data.get('description'),
            category=data.get('category'),
            target_value=data.get('targetValue', 100),
            current_progress=data.get('currentProgress', 0),
            deadline=parse_date_safely(data.get('deadline')),
            status='active'
        )
        
        db.session.add(goal)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'goal': goal.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error creating goal: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to create goal'}), 500

@app.route('/api/wellness/goals/<goal_id>', methods=['PUT'])
def update_goal(goal_id):
    """Update a wellness goal"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    profile, error_response, error_code = get_or_create_user_profile()
    if error_response:
        return error_response, error_code
    
    try:
        goal = WellnessGoal.query.filter_by(id=goal_id, user_id=profile.id).first_or_404()
        
        data = request.json
        
        if 'title' in data:
            goal.title = data['title']
        if 'description' in data:
            goal.description = data['description']
        if 'category' in data:
            goal.category = data['category']
        if 'targetValue' in data:
            goal.target_value = data['targetValue']
        if 'currentProgress' in data:
            goal.current_progress = data['currentProgress']
        if 'deadline' in data:
            goal.deadline = parse_date_safely(data.get('deadline'))
        if 'status' in data:
            goal.status = data['status']
        
        goal.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'goal': goal.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        print(f"Error updating goal: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to update goal'}), 500

@app.route('/api/wellness/goals/<goal_id>', methods=['DELETE'])
def delete_goal(goal_id):
    """Delete a wellness goal"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    profile, error_response, error_code = get_or_create_user_profile()
    if error_response:
        return error_response, error_code
    
    try:
        goal = WellnessGoal.query.filter_by(id=goal_id, user_id=profile.id).first_or_404()
        
        db.session.delete(goal)
        db.session.commit()
        
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting goal: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to delete goal'}), 500

# Achievements Endpoints
@app.route('/api/wellness/achievements', methods=['GET'])
def get_achievements():
    """Get all unlocked achievements for the current user"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    profile, error_response, error_code = get_or_create_user_profile()
    if error_response:
        return error_response, error_code
    
    try:
        achievements = WellnessAchievement.query.filter_by(user_id=profile.id).all()
        
        return jsonify({
            'achievements': [achievement.to_dict() for achievement in achievements]
        })
    except Exception as e:
        print(f"Error fetching achievements: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to fetch achievements'}), 500

@app.route('/api/wellness/achievements/<achievement_key>', methods=['POST'])
def unlock_achievement(achievement_key):
    """Unlock an achievement for the current user"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    profile, error_response, error_code = get_or_create_user_profile()
    if error_response:
        return error_response, error_code
    
    try:
        # Check if already unlocked
        existing = WellnessAchievement.query.filter_by(
            user_id=profile.id,
            achievement_key=achievement_key
        ).first()
        
        if existing:
            return jsonify({
                'success': True,
                'message': 'Achievement already unlocked',
                'achievement': existing.to_dict()
            })
        
        # Create new achievement
        achievement = WellnessAchievement(
            id=str(uuid.uuid4()),
            user_id=profile.id,
            achievement_key=achievement_key
        )
        
        db.session.add(achievement)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Achievement unlocked!',
            'achievement': achievement.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error unlocking achievement: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to unlock achievement'}), 500

@app.route('/api/wellness/achievements/available', methods=['GET'])
def get_available_achievements():
    """Get list of all possible achievements"""
    achievements = [
        {'key': 'first_steps', 'title': 'First Steps', 'description': 'Log your first activity'},
        {'key': 'wellness_warrior', 'title': 'Wellness Warrior', 'description': 'Log 7 activities in 7 days'},
        {'key': 'balanced_soul', 'title': 'Balanced Soul', 'description': 'Achieve 70+ in all auras'},
        {'key': 'goal_getter', 'title': 'Goal Getter', 'description': 'Complete 5 goals'},
        {'key': 'century_club', 'title': 'Century Club', 'description': 'Reach 100 in any aura'},
        {'key': 'rising_phoenix', 'title': 'Rising Phoenix', 'description': 'Complete 10 Rise Cycling activities'},
        {'key': 'inner_peace', 'title': 'Inner Peace', 'description': 'Complete 20 spiritual activities'},
        {'key': 'lab_rat', 'title': 'Lab Rat', 'description': 'Complete all Wellness Lab quizzes'},
        {'key': 'triple_threat', 'title': 'Triple Threat', 'description': 'Reach 80+ in all 3 core auras'},
    ]
    
    return jsonify({'achievements': achievements})


@app.route('/api/admin/update', methods=['POST', 'OPTIONS', 'GET'])
def admin_update():
    """Post an admin update that will be broadcast to all connected clients"""
    # Debug: Log the request
    print(f"Admin update endpoint hit: method={request.method}, path={request.path}")
    
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', request.headers.get('Origin', '*'))
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
    
    # Allow GET for testing
    if request.method == 'GET':
        return jsonify({
            'message': 'Admin update endpoint is working',
            'methods': ['POST', 'OPTIONS'],
            'path': request.path
        })
    
    try:
        # Check if user is authenticated
        user = session.get('user')
        if not user:
            return jsonify({'error': 'Not authenticated'}), 401
        
        # Check if user is admin (paid member or specific email)
        is_admin = (user.get('isPaidMember', False) or 
                   user.get('email') in ['soc@isharehowlabs.com', 'admin@isharehowlabs.com', 'jeliyah@isharehowlabs.com'] or
                   user.get('username') == 'admin' or
                   user.get('id') == 'admin')
        
        if not is_admin:
            return jsonify({'error': 'Unauthorized: Admin access required'}), 403
        
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
        
        message = data.get('message', '').strip()
        if not message:
            return jsonify({'error': 'Message cannot be empty'}), 400
        
        update_type = data.get('type', 'admin')
        title = data.get('title', '📢 Admin Update')
        author = user.get('name', 'Admin')
        
        # Emit Socket.IO event to all connected clients
        socketio.emit('admin:update', {
            'message': message,
            'type': update_type,
            'title': title,
            'author': author,
            'timestamp': datetime.now().isoformat(),
        })
        
        print(f"Admin update posted by {author}: {message}")
        
        return jsonify({
            'success': True,
            'message': 'Update posted successfully',
        })
        
    except Exception as e:
        print(f"Error posting admin update: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to post update', 'message': str(e)}), 500

@app.route('/api/twitch/goals', methods=['GET'])
def twitch_goals():
    """Get Twitch follower and viewer goals"""
    try:
        # Return default goals if not configured
        # These can be customized via environment variables
        return jsonify({
            'followerGoal': int(os.environ.get('TWITCH_FOLLOWER_GOAL', 1000)),
            'currentFollowers': int(os.environ.get('TWITCH_CURRENT_FOLLOWERS', 0)),
            'viewerGoal': int(os.environ.get('TWITCH_VIEWER_GOAL', 100)),
            'currentViewers': int(os.environ.get('TWITCH_CURRENT_VIEWERS', 0)),
        })
    except Exception as e:
        print(f"Error fetching Twitch goals: {e}")
        return jsonify({
            'followerGoal': 1000,
            'currentFollowers': 0,
            'viewerGoal': 100,
            'currentViewers': 0,
        }), 200  # Return defaults even on error

@app.route('/api/twitch/status', methods=['GET', 'OPTIONS'])
def twitch_status():
    """Check if Twitch stream is live"""
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', request.headers.get('Origin', '*'))
        response.headers.add('Access-Control-Allow-Methods', 'GET, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
    
    try:
        # Get Twitch username from environment or use default
        twitch_username = os.environ.get('TWITCH_USERNAME', 'jameleliyah')
        twitch_client_id = os.environ.get('TWITCH_CLIENT_ID')
        twitch_client_secret = os.environ.get('TWITCH_CLIENT_SECRET')
        
        # Use Twitch Helix API
        if twitch_client_id:
            headers = {'Client-ID': twitch_client_id}
            
            # Get App Access Token if client secret is available
            if twitch_client_secret:
                token_url = 'https://id.twitch.tv/oauth2/token'
                token_data = {
                    'client_id': twitch_client_id,
                    'client_secret': twitch_client_secret,
                    'grant_type': 'client_credentials'
                }
                token_response = requests.post(token_url, data=token_data, timeout=5)
                if token_response.status_code == 200:
                    token = token_response.json().get('access_token')
                    headers['Authorization'] = f'Bearer {token}'
                # If token fails, proceed with Client-ID only (may not work for all endpoints)
            
            # Helix API endpoint - need to get user ID first
            # First, get user ID from username
            user_lookup_url = 'https://api.twitch.tv/helix/users'
            user_params = {'login': twitch_username}
            
            user_response = requests.get(user_lookup_url, headers=headers, params=user_params, timeout=5)
            
            if user_response.status_code == 200:
                user_data = user_response.json()
                users = user_data.get('data', [])
                
                if users:
                    user_id = users[0].get('id')
                    # Now get stream status
                    twitch_api_url = 'https://api.twitch.tv/helix/streams'
                    params = {'user_id': user_id}
                    
                    response = requests.get(twitch_api_url, headers=headers, params=params, timeout=5)
                    
                    if response.status_code == 200:
                        data = response.json()
                        streams = data.get('data', [])
                        is_live = len(streams) > 0
                        stream_data = streams[0] if is_live else None
                        
                        # Emit socket event if just went live
                        if is_live:
                            socketio.emit('twitch:live', {
                                'message': f'🔴 {twitch_username} is now LIVE on Twitch!',
                                'stream': stream_data
                            })
                        
                        return jsonify({
                            'isLive': is_live,
                            'stream': stream_data,
                            'username': twitch_username
                        })
                    else:
                        # API error - return 200 with isLive: false so frontend doesn't break
                        print(f"Twitch streams API error: {response.status_code} - {response.text[:200]}")
                        return jsonify({
                            'isLive': False,
                            'error': f'Twitch API error: {response.status_code}',
                            'username': twitch_username,
                            'stream': None
                        }), 200
                else:
                    # User not found - return 200 with isLive: false
                    print(f"Twitch user not found: {twitch_username}")
                    return jsonify({
                        'isLive': False,
                        'error': 'Twitch user not found',
                        'username': twitch_username,
                        'stream': None
                    }), 200
            else:
                # User lookup failed - return 200 with isLive: false
                print(f"Twitch user lookup failed: {user_response.status_code} - {user_response.text[:200]}")
                return jsonify({
                    'isLive': False,
                    'error': f'Twitch API error: {user_response.status_code}',
                    'username': twitch_username,
                    'stream': None
                }), 200
        else:
            # No Twitch Client ID configured - return false but don't error
            # Frontend will handle this gracefully
            return jsonify({
                'isLive': False,
                'stream': None,
                'username': twitch_username,
                'message': 'Twitch API not configured'
            }), 200
    except requests.exceptions.Timeout:
        print("Twitch API request timeout")
        return jsonify({
            'isLive': False,
            'error': 'Request timeout',
            'username': os.environ.get('TWITCH_USERNAME', 'jameleliyah'),
            'stream': None
        }), 200  # Return 200 so frontend doesn't break
    except Exception as e:
        print(f"Error checking Twitch status: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'isLive': False,
            'error': str(e),
            'username': os.environ.get('TWITCH_USERNAME', 'jameleliyah'),
            'stream': None
        }), 200  # Return 200 so frontend doesn't break

@app.route('/api/gemini-chat', methods=['POST', 'OPTIONS'])
def gemini_chat():
    """Handle Gemini chat requests"""
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', request.headers.get('Origin', '*'))
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
    
    try:
        data = request.get_json()
        if not data or 'messages' not in data:
            return jsonify({'error': 'Messages are required'}), 400
        
        messages = data.get('messages', [])
        if not isinstance(messages, list) or len(messages) == 0:
            return jsonify({'error': 'Invalid or empty messages array'}), 400
        
        # Validate API key before processing
        if not GOOGLE_AI_API_KEY:
            app.logger.error('Gemini API key not configured')
            return jsonify({
                'error': 'Gemini API not configured',
                'message': 'GOOGLE_AI_API_KEY environment variable is not set. Please configure it in your environment variables.',
                'text': 'Gemini chat integration is not yet configured. Please configure GOOGLE_AI_API_KEY in your environment variables.'
            }), 500
        
        # Validate API key format
        if not GOOGLE_AI_API_KEY.startswith('AIza'):
            app.logger.warning('Gemini API key format may be incorrect')
            # Still proceed, but log warning
        
        # Convert messages to Gemini format
        contents = []
        for msg in messages:
            role = 'user' if msg.get('role') == 'user' else 'model'
            contents.append({
                'role': role,
                'parts': [{'text': msg.get('text', '')}]
            })
        
        # Get model from request, default to gemini-3-pro-preview
        model_name = data.get('model', 'gemini-3-pro-preview')
        
        # Validate model name
        valid_models = ['gemini-3-pro-preview', 'gemini-2.5-pro']
        if model_name not in valid_models:
            model_name = 'gemini-3-pro-preview'  # Default to gemini-3-pro-preview
        
        # Call Gemini API
        url = f'https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={GOOGLE_AI_API_KEY}'
        payload = {
            'contents': contents
        }
        headers = {
            'Content-Type': 'application/json'
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            
            if response.status_code == 404:
                # Try fallback to the other model if the requested one doesn't exist
                fallback_model = 'gemini-2.5-pro' if model_name == 'gemini-3-pro-preview' else 'gemini-3-pro-preview'
                print(f"Model {model_name} not found, trying {fallback_model}...")
                model_name = fallback_model
                url = f'https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={GOOGLE_AI_API_KEY}'
                response = requests.post(url, json=payload, headers=headers, timeout=30)
            
            if response.status_code != 200:
                error_text = response.text[:500] if response.text else 'No error details'
                print(f"Gemini API error: {response.status_code} - {error_text}")
                print(f"Request URL: {url.split('?')[0]}")  # Don't log the API key
                
                # Return a user-friendly error
                error_msg = f'Gemini API error ({response.status_code})'
                if response.status_code == 404:
                    error_msg = 'Gemini model not found. Please check your API key and model availability.'
                elif response.status_code == 401:
                    error_msg = 'Invalid Gemini API key. Please check your GOOGLE_AI_API_KEY configuration.'
                elif response.status_code == 429:
                    error_msg = 'Gemini API rate limit exceeded. Please try again later.'
                
                return jsonify({
                    'error': error_msg,
                    'text': 'Sorry, I encountered an error with the AI service. Please try again later.'
                }), 500
            
            data = response.json()
            
            # Handle different response formats
            if 'candidates' in data and len(data['candidates']) > 0:
                candidate = data['candidates'][0]
                if 'content' in candidate and 'parts' in candidate['content']:
                    text = candidate['content']['parts'][0].get('text', 'No response')
                else:
                    text = 'No response generated'
            else:
                # Try alternative response format
                text = data.get('text', 'No response')
            
            if not text or text == 'No response':
                print(f"Unexpected Gemini response format: {json.dumps(data, indent=2)}")
                return jsonify({
                    'error': 'Unexpected response format from Gemini API',
                    'text': 'Sorry, I received an unexpected response from the AI service.'
                }), 500
            
            return jsonify({
                'text': text
            })
            
        except requests.exceptions.Timeout:
            print("Gemini API request timeout")
            return jsonify({
                'error': 'Request timeout',
                'text': 'The AI service took too long to respond. Please try again.'
            }), 504
        except requests.exceptions.RequestException as e:
            print(f"Gemini API request exception: {e}")
            return jsonify({
                'error': 'Network error',
                'text': 'Failed to connect to the AI service. Please check your connection.'
            }), 500
        
    except Exception as e:
        print(f"Error in Gemini chat: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Internal server error', 'message': str(e)}), 500

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('join_notifications')
def handle_join_notifications(data):
    """Join user's notification room for real-time updates"""
    user_id = data.get('userId')
    if user_id:
        room = f'user_{user_id}'
        join_room(room)
        print(f'User {user_id} joined notification room: {room}')

# Creative Dashboard - Client Management API Endpoints

@app.route('/api/creative/clients', methods=['GET'])
@jwt_required()
def get_clients():
    """Get all clients with optional filtering - requires authentication"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Safely get employee status
        is_employee = safe_get_is_employee(user)
        user_db_id = getattr(user, 'id', None)
        
        if not user_db_id:
            return jsonify({'error': 'Unable to identify user'}), 401
        
        # Get query parameters
        status = request.args.get('status', 'all')
        employee_id = request.args.get('employee_id', None)
        search = request.args.get('search', '')
        
        # Build query
        query = Client.query
        
        if status != 'all':
            query = query.filter(Client.status == status)
        
        if search:
            query = query.filter(
                db.or_(
                    Client.name.ilike(f'%{search}%'),
                    Client.email.ilike(f'%{search}%'),
                    Client.company.ilike(f'%{search}%')
                )
            )
        
        clients = query.order_by(Client.created_at.desc()).all()
        
        # Check if user is admin (admins see all clients)
        is_admin = False
        if hasattr(user, 'is_admin'):
            is_admin = bool(user.is_admin)
        if not is_admin:
            # Check special identifiers
            if hasattr(user, 'patreon_id') and user.patreon_id == '56776112':
                is_admin = True
            elif hasattr(user, 'username') and user.username:
                username_lower = user.username.lower()
                if username_lower in ['isharehow', 'admin']:
                    is_admin = True
        
        # If admin, show all clients (no filtering)
        # If not an employee, filter to only show clients assigned to this user
        if not is_admin and not is_employee:
            clients = [
                c for c in clients 
                if c.employee_assignments and 
                any(a.employee_id == user_db_id for a in c.employee_assignments)
            ]
        # Filter by employee if specified (only employees/admins can filter by other employees)
        elif employee_id and not is_admin:
            try:
                emp_id_int = int(employee_id)
                clients = [c for c in clients if c.employee_assignments and 
                          any(a.employee_id == emp_id_int for a in c.employee_assignments)]
            except (ValueError, TypeError):
                pass  # Invalid employee_id, ignore filter
        
        return jsonify({
            'clients': [client.to_dict() for client in clients]
        }), 200
    except Exception as e:
        print(f"Error fetching clients: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to fetch clients: {str(e)}'}), 500

@app.route('/api/demo/leads', methods=['POST'])
def create_demo_lead():
    """Create a demo lead - public endpoint, no authentication required"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('name') or not data.get('email') or not data.get('company'):
            return jsonify({'error': 'Name, email, and company are required'}), 400
        
        # Check if email already exists
        existing = Client.query.filter_by(email=data['email']).first()
        if existing:
            # Update existing client with new demo request info
            existing.notes = (existing.notes or '') + f'\n\nDemo Request: {datetime.utcnow().isoformat()} - {data.get("message", "No message")}'
            existing.status = 'pending'  # Reset to pending if inactive
            db.session.commit()
            return jsonify({
                'message': 'Demo request received (existing client updated)',
                'clientId': existing.id
            }), 200
        
        # Create new client lead
        client = Client(
            name=data['name'],
            email=data['email'],
            company=data['company'],
            phone=data.get('phone'),
            status='pending',
            notes=f'Demo Request: {data.get("message", "No message")}\nSource: {data.get("source", "book_demo_form")}',
        )
        
        db.session.add(client)
        db.session.commit()
        
        print(f"✓ Created demo lead: {client.email} ({client.id})")
        
        return jsonify({
            'message': 'Demo request submitted successfully',
            'clientId': client.id
        }), 201
        
    except Exception as e:
        print(f"Error creating demo lead: {e}")
        import traceback
        traceback.print_exc()
        db.session.rollback()
        return jsonify({'error': f'Failed to submit demo request: {str(e)}'}), 500

@require_employee
@app.route('/api/creative/clients', methods=['POST'])
def create_client():
    """Create a new client - requires employee access"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    try:
        user_info = get_user_info()
        if not user_info:
            return jsonify({'error': 'Authentication required'}), 401
        
        data = request.get_json()
        
        # Validate required fields
        if not data.get('name') or not data.get('email') or not data.get('company'):
            return jsonify({'error': 'Name, email, and company are required'}), 400
        
        # Check if email already exists
        existing = Client.query.filter_by(email=data['email']).first()
        if existing:
            return jsonify({'error': 'Client with this email already exists'}), 409
        
        # Create client
        client = Client(
            name=data['name'],
            email=data['email'],
            company=data['company'],
            phone=data.get('phone'),
            status=data.get('status', 'pending'),
            tier=data.get('tier'),
            notes=data.get('notes'),
            tags=json.dumps(data.get('tags', [])) if data.get('tags') else None
        )
        
        db.session.add(client)
        db.session.commit()
        
        # Create dashboard connections if specified
        dashboard_types = data.get('dashboardTypes', [])
        for dashboard_type in dashboard_types:
            connection = ClientDashboardConnection(
                client_id=client.id,
                dashboard_type=dashboard_type,
                enabled=True
            )
            db.session.add(connection)
        
        # Assign employee if specified
        if data.get('employeeId') or data.get('employeeName'):
            assignment = ClientEmployeeAssignment(
                client_id=client.id,
                employee_id=data.get('employeeId'),
                employee_name=data.get('employeeName')
            )
            db.session.add(assignment)
        
        db.session.commit()
        
        return jsonify(client.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error creating client: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to create client'}), 500

@jwt_required()
@app.route('/api/creative/clients/<client_id>', methods=['GET'])
def get_client(client_id):
    """Get a specific client by ID - requires authentication and access"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        client = Client.query.get(client_id)
        if not client:
            return jsonify({'error': 'Client not found'}), 404
        
        # Check access
        has_access, error_msg = check_employee_client_access(user, client_id)
        if not has_access:
            return jsonify({'error': error_msg}), 403
        
        return jsonify(client.to_dict()), 200
    except Exception as e:
        print(f"Error fetching client: {e}")
        return jsonify({'error': 'Failed to fetch client'}), 500

@jwt_required()
@app.route('/api/creative/clients/<client_id>', methods=['PUT'])
def update_client(client_id):
    """Update a client - requires authentication and access"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        client = Client.query.get(client_id)
        if not client:
            return jsonify({'error': 'Client not found'}), 404
        
        # Check access - only employees or assigned employees can update
        has_access, error_msg = check_employee_client_access(user, client_id)
        if not has_access:
            return jsonify({'error': error_msg}), 403
        
        data = request.get_json()
        
        # Update fields
        if 'name' in data:
            client.name = data['name']
        if 'email' in data:
            # Check if email is already taken by another client
            existing = Client.query.filter_by(email=data['email']).first()
            if existing and existing.id != client_id:
                return jsonify({'error': 'Email already in use'}), 409
            client.email = data['email']
        if 'company' in data:
            client.company = data['company']
        if 'phone' in data:
            client.phone = data['phone']
        if 'status' in data:
            client.status = data['status']
        if 'tier' in data:
            client.tier = data['tier']
        if 'notes' in data:
            client.notes = data['notes']
        if 'tags' in data:
            client.tags = json.dumps(data['tags']) if data['tags'] else None
        
        client.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify(client.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error updating client: {e}")
        return jsonify({'error': 'Failed to update client'}), 500

@require_employee
@app.route('/api/creative/clients/<client_id>', methods=['DELETE'])
def delete_client(client_id):
    """Delete a client - requires employee access"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    try:
        client = Client.query.get(client_id)
        if not client:
            return jsonify({'error': 'Client not found'}), 404
        
        db.session.delete(client)
        db.session.commit()
        
        return jsonify({'message': 'Client deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting client: {e}")
        return jsonify({'error': 'Failed to delete client'}), 500

@require_employee
@app.route('/api/creative/clients/<client_id>/assign-employee', methods=['POST'])
def assign_employee(client_id):
    """Assign or update employee assignment for a client - requires employee access"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    try:
        client = Client.query.get(client_id)
        if not client:
            return jsonify({'error': 'Client not found'}), 404
        
        data = request.get_json()
        employee_id = data.get('employee_id') or data.get('employeeId')
        employee_name = data.get('employee_name') or data.get('employeeName')
        
        # Validate that employee_id exists and is an employee
        if employee_id:
            # Try to find employee by ID (could be int or string)
            try:
                emp_id_int = int(employee_id)
                employee = User.query.get(emp_id_int)
            except (ValueError, TypeError):
                # Try finding by username, patreon_id, or ens_name
                employee = User.query.filter_by(username=str(employee_id)).first()
                if not employee:
                    employee = User.query.filter_by(patreon_id=str(employee_id)).first()
                if not employee:
                    employee = User.query.filter_by(ens_name=str(employee_id)).first()
            
            if not employee:
                return jsonify({'error': f'Employee not found: {employee_id}'}), 404
            
            # Check if user is employee or admin (admins can also be assigned)
            is_employee = safe_get_is_employee(employee)
            is_admin = getattr(employee, 'is_admin', False)
            
            if not is_employee and not is_admin:
                return jsonify({'error': 'User is not an employee or admin'}), 400
            
            # Get the employee name from the database
            employee_name = employee.username or employee.email or employee_name
            employee_id = employee.id  # Use the actual database ID
        
        # Remove existing assignments
        ClientEmployeeAssignment.query.filter_by(client_id=client_id).delete()
        
        # Create new assignment if provided
        if employee_id or employee_name:
            assignment = ClientEmployeeAssignment(
                client_id=client_id,
                employee_id=employee_id,
                employee_name=employee_name
            )
            db.session.add(assignment)
        
        db.session.commit()
        
        return jsonify(client.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error assigning employee: {e}")
        return jsonify({'error': 'Failed to assign employee'}), 500

@jwt_required()
@app.route('/api/creative/clients/<client_id>/dashboard-connections', methods=['GET'])
def get_client_dashboard_connections(client_id):
    """Get dashboard connections for a client - requires authentication and access"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Check access
        has_access, error_msg = check_employee_client_access(user, client_id)
        if not has_access:
            return jsonify({'error': error_msg}), 403
        
        connections = ClientDashboardConnection.query.filter_by(client_id=client_id).all()
        return jsonify({
            'connections': [conn.to_dict() for conn in connections]
        }), 200
    except Exception as e:
        print(f"Error fetching dashboard connections: {e}")
        return jsonify({'error': 'Failed to fetch connections'}), 500

@jwt_required()
@app.route('/api/creative/clients/<client_id>/dashboard-connections', methods=['POST'])
def update_dashboard_connections(client_id):
    """Update dashboard connections for a client - requires authentication and access"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        client = Client.query.get(client_id)
        if not client:
            return jsonify({'error': 'Client not found'}), 404
        
        # Check access - only employees or assigned employees can update
        has_access, error_msg = check_employee_client_access(user, client_id)
        if not has_access:
            return jsonify({'error': error_msg}), 403
        
        data = request.get_json()
        dashboard_types = data.get('dashboardTypes', [])
        enabled_map = data.get('enabled', {})  # { 'cowork': true, 'rise': false }
        
        # Get existing connections
        existing = {conn.dashboard_type: conn for conn in client.dashboard_connections}
        
        # Update or create connections
        for dashboard_type in dashboard_types:
            enabled = enabled_map.get(dashboard_type, True)
            if dashboard_type in existing:
                existing[dashboard_type].enabled = enabled
            else:
                connection = ClientDashboardConnection(
                    client_id=client_id,
                    dashboard_type=dashboard_type,
                    enabled=enabled
                )
                db.session.add(connection)
        
        # Disable connections not in the list
        for dashboard_type, connection in existing.items():
            if dashboard_type not in dashboard_types:
                connection.enabled = False
        
        db.session.commit()
        
        return jsonify(client.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error updating dashboard connections: {e}")
        return jsonify({'error': 'Failed to update connections'}), 500

@app.route('/api/creative/employees', methods=['GET'])
@jwt_required()
def get_employees():
    """Get list of employees (users) for assignment"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Check if is_employee column exists
        column_exists = check_is_employee_column_exists()
        
        employees = []
        if column_exists:
            # Get all users with is_employee flag set to True
            try:
                users = User.query.filter_by(is_employee=True).all()
            except Exception as e:
                error_str = str(e).lower()
                if 'is_employee' in error_str and 'column' in error_str:
                    # Column doesn't exist, fallback to all users
                    users = User.query.all()
                else:
                    raise
        else:
            # Column doesn't exist, get all users
            users = User.query.all()
        
        # If no employees found and column exists, include all users (for backward compatibility)
        if not users and column_exists:
            users = User.query.all()
        
        for user in users:
            # Safely check if user is employee
            is_emp = safe_get_is_employee(user) if column_exists else True
            employees.append({
                'id': user.id,
                'name': user.username or user.email or f'User {user.id}',
                'email': user.email or '',
                'is_admin': getattr(user, 'is_admin', False),
                'is_employee': is_emp
            })
        
        return jsonify({'employees': employees}), 200
    except Exception as e:
        print(f"Error fetching employees: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to fetch employees: {str(e)}'}), 500

# Creative Dashboard - Metrics API Endpoint

@app.route('/api/creative/metrics', methods=['GET'])
@require_employee
def get_creative_metrics():
    """Get real-time metrics for Creative Dashboard overview"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 500
    
    try:
        # Get current user (employee)
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Find user
        user = None
        if user_id.isdigit():
            user = User.query.get(int(user_id))
        if not user:
            user = User.query.filter_by(username=user_id).first()
        if not user:
            user = User.query.filter_by(patreon_id=user_id).first()
        if not user:
            user = User.query.filter_by(ens_name=user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get employee's database ID
        employee_db_id = user.id
        
        # Count active clients assigned to this employee
        # Active = status = 'active' and assigned to this employee
        active_clients_query = db.session.query(Client).join(
            ClientEmployeeAssignment,
            Client.id == ClientEmployeeAssignment.client_id
        ).filter(
            ClientEmployeeAssignment.employee_id == employee_db_id,
            Client.status == 'active'
        )
        active_clients_count = active_clients_query.count()
        
        # Count clients created this month (assigned to employee)
        first_day_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        clients_this_month = db.session.query(Client).join(
            ClientEmployeeAssignment,
            Client.id == ClientEmployeeAssignment.client_id
        ).filter(
            ClientEmployeeAssignment.employee_id == employee_db_id,
            Client.created_at >= first_day_of_month
        ).count()
        
        # Count support requests with status 'open' or 'in-progress' (assigned to employee's clients)
        open_support_requests = db.session.query(SupportRequest).join(
            ClientEmployeeAssignment,
            SupportRequest.client_id == ClientEmployeeAssignment.client_id
        ).filter(
            ClientEmployeeAssignment.employee_id == employee_db_id,
            SupportRequest.status.in_(['open', 'in-progress'])
        ).count()
        
        # Count total clients assigned to employee (for progress calculation)
        total_clients = db.session.query(Client).join(
            ClientEmployeeAssignment,
            Client.id == ClientEmployeeAssignment.client_id
        ).filter(
            ClientEmployeeAssignment.employee_id == employee_db_id
        ).count()
        
        # Calculate progress: percentage of active clients out of total
        # Or use a different metric - for now, use active/total * 100
        progress = 0
        if total_clients > 0:
            progress = int((active_clients_count / total_clients) * 100)
        
        # Count tasks completed today (from support requests resolved today)
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        tasks_completed_today = db.session.query(SupportRequest).join(
            ClientEmployeeAssignment,
            SupportRequest.client_id == ClientEmployeeAssignment.client_id
        ).filter(
            ClientEmployeeAssignment.employee_id == employee_db_id,
            SupportRequest.status == 'resolved',
            SupportRequest.updated_at >= today_start
        ).count()
        
        return jsonify({
            'clients': active_clients_count,
            'clientsThisMonth': clients_this_month,
            'projects': open_support_requests,  # Using open support requests as "projects in progress"
            'tasks': tasks_completed_today,
            'completion': progress,
            'totalClients': total_clients
        })
    except Exception as e:
        print(f"Error fetching creative metrics: {e}")
        app.logger.error(f"Error fetching creative metrics: {e}")
        return jsonify({'error': 'Failed to fetch metrics'}), 500

@app.route('/api/creative/support-requests', methods=['GET'])
def get_support_requests():
    """Get all support requests with optional filtering - requires authentication"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        user_info = get_user_info()
        is_employee = hasattr(user, 'is_employee') and user.is_employee
        
        # Get query parameters
        status = request.args.get('status', 'all')
        client_id = request.args.get('client_id', None)
        priority = request.args.get('priority', None)
        
        # Build query
        query = SupportRequest.query
        
        if status != 'all':
            query = query.filter(SupportRequest.status == status)
        
        if client_id:
            query = query.filter(SupportRequest.client_id == client_id)
        
        if priority:
            query = query.filter(SupportRequest.priority == priority)
        
        requests = query.order_by(SupportRequest.created_at.desc()).all()
        
        # If not an employee, filter to only show requests for clients assigned to this user
        if not is_employee:
            # Get client IDs assigned to this user
            assigned_clients = [
                a.client_id for a in ClientEmployeeAssignment.query.filter_by(employee_id=user.id).all()
            ]
            requests = [
                r for r in requests 
                if (r.client_id and r.client_id in assigned_clients) or 
                   (not r.client_id and r.client_name)  # Allow requests without client_id
            ]
        
        return jsonify({
            'requests': [req.to_dict() for req in requests]
        }), 200
    except Exception as e:
        print(f"Error fetching support requests: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to fetch support requests'}), 500

@jwt_required()
@app.route('/api/creative/support-requests', methods=['POST'])
def create_support_request():
    """Create a new support request - requires authentication"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        user_info = get_user_info()
        
        data = request.get_json()
        
        # Validate required fields
        if not data.get('subject') or not data.get('description'):
            return jsonify({'error': 'Subject and description are required'}), 400
        
        # Create support request
        request_obj = SupportRequest(
            client_id=data.get('clientId'),
            client_name=data.get('client'),
            subject=data['subject'],
            description=data['description'],
            priority=data.get('priority', 'medium'),
            status='open',
            assigned_to=data.get('assignedTo')
        )
        
        db.session.add(request_obj)
        db.session.commit()
        
        return jsonify(request_obj.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error creating support request: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to create support request'}), 500

@jwt_required()
@app.route('/api/creative/support-requests/<request_id>', methods=['PUT'])
def update_support_request(request_id):
    """Update a support request - requires authentication and access"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        request_obj = SupportRequest.query.get(request_id)
        if not request_obj:
            return jsonify({'error': 'Support request not found'}), 404
        
        # Check access - employees can update any request, assigned employees can update their client's requests
        is_employee = hasattr(user, 'is_employee') and user.is_employee
        if not is_employee and request_obj.client_id:
            # Check if user is assigned to this client
            assignment = ClientEmployeeAssignment.query.filter_by(
                client_id=request_obj.client_id,
                employee_id=user.id
            ).first()
            if not assignment:
                return jsonify({'error': 'Access denied. You must be assigned to this client or be an employee.'}), 403
        
        data = request.get_json()
        
        # Update fields
        if 'status' in data:
            request_obj.status = data['status']
        if 'priority' in data:
            request_obj.priority = data['priority']
        if 'assignedTo' in data:
            request_obj.assigned_to = data['assignedTo']
        if 'subject' in data:
            request_obj.subject = data['subject']
        if 'description' in data:
            request_obj.description = data['description']
        
        request_obj.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify(request_obj.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error updating support request: {e}")
        return jsonify({'error': 'Failed to update support request'}), 500

# Subscription Management API Endpoints

@jwt_required(optional=True)
@app.route('/api/subscriptions', methods=['POST'])
def create_subscription():
    """Create a new subscription"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    try:
        user_info = get_user_info()
        user_id = user_info['id'] if user_info else request.get_json().get('userId') or 'anonymous'
        
        data = request.get_json()
        
        # Validate required fields
        if not data.get('tier') or not data.get('billingCycle'):
            return jsonify({'error': 'Tier and billing cycle are required'}), 400
        
        # Calculate amount based on tier and billing cycle
        tier_prices = {
            'starter': {'monthly': 399, 'annual': 3830},
            'professional': {'monthly': 1499, 'annual': 14390},
            'enterprise': {'monthly': 9000, 'annual': 86400}
        }
        
        amount = tier_prices.get(data['tier'], {}).get(data['billingCycle'], 0)
        if amount == 0:
            amount = data.get('amount', 0)
        
        # Calculate expiry date
        expires_at = None
        if data['billingCycle'] == 'monthly':
            expires_at = datetime.utcnow() + timedelta(days=30)
        elif data['billingCycle'] == 'annual':
            expires_at = datetime.utcnow() + timedelta(days=365)
        
        # Create subscription
        subscription = Subscription(
            user_id=user_id,
            tier=data['tier'],
            billing_cycle=data['billingCycle'],
            status='pending',  # Will be set to 'active' after payment confirmation
            amount=amount,
            currency=data.get('currency', 'USD'),
            payment_method=data.get('paymentMethod'),
            payment_method_id=data.get('paymentMethodId'),
            expires_at=expires_at
        )
        
        db.session.add(subscription)
        db.session.commit()
        
        return jsonify({
            'subscription': subscription.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error creating subscription: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to create subscription'}), 500

@jwt_required(optional=True)
@app.route('/api/subscriptions/current', methods=['GET'])
def get_current_subscription():
    """Get current subscription for user"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    try:
        user_info = get_user_info()
        user_id = user_info['id'] if user_info else request.args.get('userId')
        
        if not user_id:
            return jsonify({'subscription': None}), 200
        
        # Get most recent active or pending subscription
        subscription = Subscription.query.filter_by(
            user_id=user_id
        ).filter(
            Subscription.status.in_(['active', 'pending'])
        ).order_by(Subscription.created_at.desc()).first()
        
        if not subscription:
            return jsonify({'subscription': None}), 200
        
        return jsonify({
            'subscription': subscription.to_dict()
        }), 200
    except Exception as e:
        print(f"Error fetching subscription: {e}")
        return jsonify({'error': 'Failed to fetch subscription'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    # Allow Werkzeug for development/production (or use gunicorn for true production)
    socketio.run(app, host='0.0.0.0', port=port, allow_unsafe_werkzeug=True)


# --- Patreon OAuth2 Integration ---
# Add these to your .env:
# PATREON_CLIENT_ID=your_client_id
# PATREON_CLIENT_SECRET=your_client_secret
# PATREON_REDIRECT_URI=https://yourdomain.com/api/auth/patreon/callback

@app.route('/api/auth/patreon/login')
@app.route('/api/auth/patreon')  # Alias for cleaner frontend calls
def patreon_login():
    try:
        client_id = os.environ.get('PATREON_CLIENT_ID')
        redirect_uri = os.environ.get('PATREON_REDIRECT_URI')
        
        if not client_id or not redirect_uri:
            print("Patreon OAuth error: Missing PATREON_CLIENT_ID or PATREON_REDIRECT_URI")
            return jsonify({'error': 'OAuth not configured'}), 500
        
        scope = 'identity identity[email] identity.memberships'
        state = 'random_state_string'  # TODO: generate and validate this for security
        auth_url = (
            f"https://www.patreon.com/oauth2/authorize"
            f"?response_type=code&client_id={client_id}"
            f"&redirect_uri={redirect_uri}"
            f"&scope={scope}"
            f"&state={state}"
        )
        return redirect(auth_url)
    except Exception as e:
        print(f"Patreon OAuth login error: {e}")
        return jsonify({'error': 'Failed to initiate OAuth'}), 500

@app.route('/api/auth/patreon/callback')
def patreon_callback():
    # Log incoming error from Patreon if present
    if 'error' in request.args:
        app.logger.error(f"Patreon error: {request.args['error']}")
    code = request.args.get('code')
    state = request.args.get('state')
    if not code:
        return redirect(f'{get_frontend_url()}/?auth=error&message=missing_code')

    # Check for required environment variables
    try:
        client_id = os.environ.get('PATREON_CLIENT_ID')
        client_secret = os.environ.get('PATREON_CLIENT_SECRET')
        redirect_uri = os.environ.get('PATREON_REDIRECT_URI')
        if not client_id or not client_secret or not redirect_uri:
            print("Patreon OAuth error: Missing environment variables")
            return redirect(f'{get_frontend_url()}/?auth=error&message=missing_config')
    except KeyError as e:
        print(f"Patreon OAuth error: Missing environment variable: {e}")
        return redirect(f'{get_frontend_url()}/?auth=error&message=missing_config')

    token_url = "https://www.patreon.com/api/oauth2/token"
    data = {
        "code": code,
        "grant_type": "authorization_code",
        "client_id": client_id,
        "client_secret": client_secret,
        "redirect_uri": redirect_uri,
    }
    try:
        # Exchange code for access token
        token_res = requests.post(token_url, data=data, timeout=10)
        token_res.raise_for_status()
        token_data = token_res.json()
        access_token = token_data.get('access_token')
        refresh_token = token_data.get('refresh_token')
        expires_in = token_data.get('expires_in', 3600)
        token_expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
        if not access_token:
            error_msg = token_data.get('error', 'Unknown error')
            print(f"Patreon OAuth error: No access token. Response: {token_data}")
            return redirect(f'{get_frontend_url()}/?auth=error&message=token_error')

        # Fetch user identity with memberships and campaign relationships, including all membership data
        identity_url = (
            "https://www.patreon.com/api/oauth2/v2/identity?include=memberships,campaign"
            "&fields[user]=id,email,full_name,image_url"
            "&fields[member]=patron_status,currently_entitled_amount_cents,lifetime_support_cents,last_charge_date,pledge_start"
            "&fields[campaign]=name"
        )
        headers = {
            "Authorization": f"Bearer {access_token}",
            "User-Agent": "VenturesApp/1.0 (+https://ventures.isharehow.app)"
        }
        user_res = requests.get(identity_url, headers=headers, timeout=10)
        user_res.raise_for_status()
        user_data = user_res.json()
        app.logger.info(f"Patreon API response: {json.dumps(user_data, indent=2)}")

        # Parse user data from Patreon API response
        if 'data' not in user_data:
            print(f"Error: No 'data' field in Patreon response: {user_data}")
            return redirect(f'{get_frontend_url()}/?auth=error&message=invalid_response')
        
        data = user_data.get('data', {})
        attributes = data.get('attributes', {})
        relationships = data.get('relationships', {})
        
        # Extract user info with fallbacks
        user_id = data.get('id', '')
        if not user_id:
            print(f"Error: No user ID in Patreon response: {data}")
            return redirect(f'{get_frontend_url()}/?auth=error&message=no_user_id')
        
        user_name = attributes.get('full_name') or attributes.get('first_name') or 'Patreon User'
        user_email = attributes.get('email', '')
        user_avatar = attributes.get('image_url', '')
        
        # Check membership status - pull all data from Patreon API
        is_paid_member = False
        membership_tier = None
        membership_amount = 0
        lifetime_support_cents = 0
        last_charge_date = None
        membership_renewal_date = None
        
        memberships = relationships.get('memberships', {}).get('data', [])
        
        if memberships:
            # Get membership details from included data
            included = user_data.get('included', [])
            for membership in memberships:
                membership_id = membership.get('id')
                for item in included:
                    if item.get('id') == membership_id and item.get('type') == 'member':
                        member_attrs = item.get('attributes', {})
                        patron_status = member_attrs.get('patron_status')
                        amount_cents = member_attrs.get('currently_entitled_amount_cents', 0)
                        lifetime_support_cents = member_attrs.get('lifetime_support_cents', 0) or amount_cents
                        
                        # Extract last_charge_date and calculate renewal
                        last_charge_str = member_attrs.get('last_charge_date')
                        if last_charge_str:
                            try:
                                last_charge_date = datetime.fromisoformat(last_charge_str.replace('Z', '+00:00'))
                                # Calculate renewal date (typically monthly, so add 30 days)
                                membership_renewal_date = last_charge_date + timedelta(days=30)
                            except:
                                pass
                        
                        # Get tier name from campaign relationship
                        campaign_id = item.get('relationships', {}).get('campaign', {}).get('data', {}).get('id')
                        if campaign_id:
                            for campaign_item in included:
                                if campaign_item.get('id') == campaign_id and campaign_item.get('type') == 'campaign':
                                    campaign_attrs = campaign_item.get('attributes', {})
                                    tier_name = campaign_attrs.get('name')
                                    if tier_name:
                                        membership_tier = tier_name
                        
                        # Check if active patron
                        if patron_status == 'active_patron':
                            is_paid_member = True
                            membership_amount = amount_cents / 100  # Convert cents to dollars
                            # If tier not found from campaign, calculate from amount
                            if not membership_tier:
                                if membership_amount >= 10:
                                    membership_tier = 'Premium'
                                elif membership_amount >= 5:
                                    membership_tier = 'Standard'
                                else:
                                    membership_tier = 'Basic'
                        break
        
        # Special handling for creator/admin - they shouldn't be considered paid members of their own product
        if user_id == '56776112':
            is_paid_member = False
            membership_tier = None
            membership_amount = 0
            print(f"✓ Creator {user_id} - overriding paid membership status to False")
        
        # Store/update user in database (User model for authentication)
        # Check if there's a logged-in user to link Patreon account to
        linked_user = None
        if DB_AVAILABLE:
            try:
                # Check if user is already logged in (via state parameter or session)
                # For now, we'll check if a user with this email exists and link to them
                # Or create a new user if none exists
                user = User.query.filter_by(patreon_id=user_id).first()
                
                if not user:
                    # Check if user with same email exists (to link accounts)
                    if user_email:
                        user = User.query.filter_by(email=user_email).first()
                    
                    if not user:
                        # Create new user account
                        user = User(
                            patreon_id=user_id,
                            email=user_email,
                            access_token=access_token,
                            refresh_token=refresh_token,
                            membership_paid=is_paid_member,  # Updated field name
                            last_checked=datetime.utcnow(),
                            token_expires_at=token_expires_at,
                            patreon_connected=True,
                            ens_name=ens_data.get('ens_name'),
                            crypto_address=ens_data.get('crypto_address'),
                            content_hash=ens_data.get('content_hash')
                        )
                        db.session.add(user)
                        print(f"✓ Created new user in database: {user_id}")
                    else:
                        # Link Patreon to existing user account
                        user.patreon_id = user_id
                        user.access_token = access_token
                        if refresh_token:
                            user.refresh_token = refresh_token
                        user.membership_paid = is_paid_member  # Updated field name
                        user.last_checked = datetime.utcnow()
                        user.token_expires_at = token_expires_at
                        user.patreon_connected = True
                        # Update ENS data if not already set
                        if not user.ens_name and ens_data.get('ens_name'):
                            user.ens_name = ens_data.get('ens_name')
                            user.crypto_address = ens_data.get('crypto_address')
                            user.content_hash = ens_data.get('content_hash')
                        print(f"✓ Linked Patreon account to existing user: {user.username or user.email}")
                else:
                    # Update existing Patreon-linked user
                    user.email = user_email or user.email
                    user.access_token = access_token
                    if refresh_token:
                        user.refresh_token = refresh_token
                    user.membership_paid = is_paid_member  # Updated field name
                    user.last_checked = datetime.utcnow()  # Update last_checked when Patreon OAuth is called
                    user.token_expires_at = token_expires_at
                    user.patreon_connected = True  # Auto-set since we have patreon_id
                    # Update ENS data if not already set
                    if not user.ens_name and ens_data.get('ens_name'):
                        user.ens_name = ens_data.get('ens_name')
                        user.crypto_address = ens_data.get('crypto_address')
                        user.content_hash = ens_data.get('content_hash')
                    print(f"✓ Updated existing user in database: {user_id}")
                
                db.session.commit()
                linked_user = user
            except Exception as db_error:
                print(f"Warning: Failed to store user in database: {db_error}")
                db.session.rollback()
                # Continue even if database storage fails
        
        # Generate JWT token using flask-jwt-extended for the linked user
        if linked_user:
            jwt_token = create_access_token(identity=str(linked_user.id))
        else:
            # If no linked user, create a temporary token (shouldn't happen in normal flow)
            jwt_token = create_access_token(identity=user_id)
        
        # Resolve ENS name for user
        username_for_ens = user_name or user_email.split('@')[0] if user_email else user_id
        ens_data = resolve_or_create_ens(None, username_for_ens)
        
        # Sync user profile to database (UserProfile for wellness features)
        if DB_AVAILABLE:
            try:
                # Use ENS name as profile ID if available
                profile_id = ens_data.get('ens_name') or user_id
                profile = UserProfile.query.get(profile_id)
                if not profile:
                    # Create new profile
                    profile = UserProfile(
                        id=profile_id,
                        email=user_email,
                        name=user_name,
                        avatar_url=user_avatar,
                        patreon_id=user_id,
                        membership_tier=membership_tier,
                        is_paid_member=is_paid_member,
                        membership_renewal_date=membership_renewal_date,
                        lifetime_support_amount=lifetime_support_cents / 100 if lifetime_support_cents else None,
                        ens_name=ens_data.get('ens_name'),
                        crypto_address=ens_data.get('crypto_address'),
                        content_hash=ens_data.get('content_hash')
                    )
                    db.session.add(profile)
                    print(f"✓ Created new user profile in database: {profile_id}")
                else:
                    # Update existing profile
                    profile.email = user_email or profile.email
                    profile.name = user_name or profile.name
                    profile.avatar_url = user_avatar or profile.avatar_url
                    profile.membership_tier = membership_tier
                    profile.is_paid_member = is_paid_member
                    profile.membership_renewal_date = membership_renewal_date
                    if lifetime_support_cents:
                        profile.lifetime_support_amount = lifetime_support_cents / 100
                    # Update ENS data if not already set
                    if not profile.ens_name and ens_data.get('ens_name'):
                        profile.ens_name = ens_data.get('ens_name')
                        profile.crypto_address = ens_data.get('crypto_address')
                        profile.content_hash = ens_data.get('content_hash')
                    profile.updated_at = datetime.utcnow()
                    print(f"✓ Updated existing user profile in database: {profile_id}")
                
                db.session.commit()
            except Exception as db_error:
                print(f"Warning: Failed to sync user profile to database: {db_error}")
                db.session.rollback()
                # Continue even if database sync fails

        # Redirect to labs page with auth success (JWT in cookie, not URL)
        redirect_url = f'{get_frontend_url()}/labs/?auth=success&patreon_connected=true'
        response = redirect(redirect_url, code=302)
        
        # Set JWT in httpOnly cookie using flask-jwt-extended
        set_access_cookies(response, jwt_token)
        return response
    except requests.exceptions.HTTPError as e:
        error_detail = "Unknown error"
        try:
            error_detail = e.response.json() if e.response else str(e)
        except:
            error_detail = str(e)
        app.logger.error(f"Patreon OAuth HTTP error: {e} - {error_detail}")
        return redirect(f'{get_frontend_url()}/?auth=error&message=api_error')
    except requests.exceptions.Timeout:
        app.logger.error("Patreon OAuth error: Request timeout")
        return redirect(f'{get_frontend_url()}/?auth=error&message=timeout')
    except requests.exceptions.RequestException as e:
        app.logger.error(f"Patreon OAuth network error: {e}")
        return redirect(f'{get_frontend_url()}/?auth=error&message=network_error')
    except Exception as e:
        app.logger.error(f"Patreon OAuth error: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        error_message = str(e)
        error_message = error_message.replace(' ', '_').replace(':', '').replace('\n', '')[:50]
        return redirect(f'{get_frontend_url()}/?auth=error&message=user_fetch_failed&detail={error_message}')

# --- Learning Hub Content Management ---
class LearningContentStore:
    def __init__(self):
        self.courses = {}
        self.pdfs = {}
        self.videos = {}
    
    def add_course(self, course_data):
        course_id = course_data.get('id') or str(uuid.uuid4())
        course = {
            'id': course_id,
            'title': course_data.get('title', ''),
            'description': course_data.get('description', ''),
            'instructor': course_data.get('instructor', ''),
            'duration': course_data.get('duration', ''),
            'level': course_data.get('level', 'Beginner'),
            'lessons': course_data.get('lessons', 0),
            'thumbnail': course_data.get('thumbnail'),
            'category': course_data.get('category', 'General'),
            'videoUrl': course_data.get('videoUrl'),
            'pdfResources': course_data.get('pdfResources', []),
            'createdAt': datetime.utcnow().isoformat(),
            'updatedAt': datetime.utcnow().isoformat(),
        }
        self.courses[course_id] = course
        return course
    
    def get_courses(self):
        return list(self.courses.values())
    
    def get_course(self, course_id):
        return self.courses.get(course_id)
    
    def update_course(self, course_id, course_data):
        if course_id not in self.courses:
            return None
        course = self.courses[course_id]
        course.update(course_data)
        course['updatedAt'] = datetime.utcnow().isoformat()
        return course
    
    def delete_course(self, course_id):
        if course_id in self.courses:
            del self.courses[course_id]
            return True
        return False
    
    def add_pdf(self, pdf_data):
        pdf_id = pdf_data.get('id') or str(uuid.uuid4())
        pdf = {
            'id': pdf_id,
            'title': pdf_data.get('title', ''),
            'description': pdf_data.get('description', ''),
            'category': pdf_data.get('category', 'General'),
            'url': pdf_data.get('url', ''),
            'fileSize': pdf_data.get('fileSize', ''),
            'pages': pdf_data.get('pages'),
            'thumbnail': pdf_data.get('thumbnail'),
            'uploadDate': pdf_data.get('uploadDate', datetime.utcnow().isoformat()),
            'createdAt': datetime.utcnow().isoformat(),
            'updatedAt': datetime.utcnow().isoformat(),
        }
        self.pdfs[pdf_id] = pdf
        return pdf
    
    def get_pdfs(self):
        return list(self.pdfs.values())
    
    def get_pdf(self, pdf_id):
        return self.pdfs.get(pdf_id)
    
    def update_pdf(self, pdf_id, pdf_data):
        if pdf_id not in self.pdfs:
            return None
        pdf = self.pdfs[pdf_id]
        pdf.update(pdf_data)
        pdf['updatedAt'] = datetime.utcnow().isoformat()
        return pdf
    
    def delete_pdf(self, pdf_id):
        if pdf_id in self.pdfs:
            del self.pdfs[pdf_id]
            return True
        return False
    
    def add_video(self, video_data):
        video_id = video_data.get('id') or str(uuid.uuid4())
        video = {
            'id': video_id,
            'title': video_data.get('title', ''),
            'description': video_data.get('description', ''),
            'instructor': video_data.get('instructor', ''),
            'duration': video_data.get('duration', ''),
            'level': video_data.get('level', 'Beginner'),
            'category': video_data.get('category', 'General'),
            'videoUrl': video_data.get('videoUrl', ''),
            'thumbnail': video_data.get('thumbnail'),
            'uploadDate': video_data.get('uploadDate', datetime.utcnow().isoformat()),
            'createdAt': datetime.utcnow().isoformat(),
            'updatedAt': datetime.utcnow().isoformat(),
        }
        self.videos[video_id] = video
        return video
    
    def get_videos(self):
        return list(self.videos.values())
    
    def get_video(self, video_id):
        return self.videos.get(video_id)
    
    def update_video(self, video_id, video_data):
        if video_id not in self.videos:
            return None
        video = self.videos[video_id]
        video.update(video_data)
        video['updatedAt'] = datetime.utcnow().isoformat()
        return video
    
    def delete_video(self, video_id):
        if video_id in self.videos:
            del self.videos[video_id]
            return True
        return False

learning_store = LearningContentStore()

# Courses endpoints
@app.route('/api/learning/courses', methods=['GET'])
def get_courses():
    courses = learning_store.get_courses()
    return jsonify({'courses': courses})

@app.route('/api/learning/courses', methods=['POST'])
def create_course():
    try:
        data = request.get_json()
        if not data or 'title' not in data:
            return jsonify({'error': 'Title is required'}), 400
        course = learning_store.add_course(data)
        return jsonify({'course': course}), 201
    except Exception as e:
        print(f"Error creating course: {e}")
        return jsonify({'error': 'Failed to create course', 'message': str(e)}), 500

@app.route('/api/learning/courses/<course_id>', methods=['GET'])
def get_course(course_id):
    course = learning_store.get_course(course_id)
    if not course:
        return jsonify({'error': 'Course not found'}), 404
    return jsonify({'course': course})

@app.route('/api/learning/courses/<course_id>', methods=['PUT'])
def update_course(course_id):
    try:
        data = request.get_json()
        course = learning_store.update_course(course_id, data)
        if not course:
            return jsonify({'error': 'Course not found'}), 404
        return jsonify({'course': course})
    except Exception as e:
        print(f"Error updating course: {e}")
        return jsonify({'error': 'Failed to update course', 'message': str(e)}), 500

@app.route('/api/learning/courses/<course_id>', methods=['DELETE'])
def delete_course(course_id):
    success = learning_store.delete_course(course_id)
    if not success:
        return jsonify({'error': 'Course not found'}), 404
    return jsonify({'success': True})

# PDFs endpoints
@app.route('/api/learning/pdfs', methods=['GET'])
def get_pdfs():
    pdfs = learning_store.get_pdfs()
    return jsonify({'pdfs': pdfs})

@app.route('/api/learning/pdfs', methods=['POST'])
def create_pdf():
    try:
        data = request.get_json()
        if not data or 'title' not in data:
            return jsonify({'error': 'Title is required'}), 400
        pdf = learning_store.add_pdf(data)
        return jsonify({'pdf': pdf}), 201
    except Exception as e:
        print(f"Error creating PDF: {e}")
        return jsonify({'error': 'Failed to create PDF', 'message': str(e)}), 500

@app.route('/api/learning/pdfs/<pdf_id>', methods=['GET'])
def get_pdf(pdf_id):
    pdf = learning_store.get_pdf(pdf_id)
    if not pdf:
        return jsonify({'error': 'PDF not found'}), 404
    return jsonify({'pdf': pdf})

@app.route('/api/learning/pdfs/<pdf_id>', methods=['PUT'])
def update_pdf(pdf_id):
    try:
        data = request.get_json()
        pdf = learning_store.update_pdf(pdf_id, data)
        if not pdf:
            return jsonify({'error': 'PDF not found'}), 404
        return jsonify({'pdf': pdf})
    except Exception as e:
        print(f"Error updating PDF: {e}")
        return jsonify({'error': 'Failed to update PDF', 'message': str(e)}), 500

@app.route('/api/learning/pdfs/<pdf_id>', methods=['DELETE'])
def delete_pdf(pdf_id):
    success = learning_store.delete_pdf(pdf_id)
    if not success:
        return jsonify({'error': 'PDF not found'}), 404
    return jsonify({'success': True})

# Videos endpoints
@app.route('/api/learning/videos', methods=['GET'])
def get_videos():
    videos = learning_store.get_videos()
    return jsonify({'videos': videos})

@app.route('/api/learning/videos', methods=['POST'])
def create_video():
    try:
        data = request.get_json()
        if not data or 'title' not in data:
            return jsonify({'error': 'Title is required'}), 400
        video = learning_store.add_video(data)
        return jsonify({'video': video}), 201
    except Exception as e:
        print(f"Error creating video: {e}")
        return jsonify({'error': 'Failed to create video', 'message': str(e)}), 500

@app.route('/api/learning/videos/<video_id>', methods=['GET'])
def get_video(video_id):
    video = learning_store.get_video(video_id)
    if not video:
        return jsonify({'error': 'Video not found'}), 404
    return jsonify({'video': video})

@app.route('/api/learning/videos/<video_id>', methods=['PUT'])
def update_video(video_id):
    try:
        data = request.get_json()
        video = learning_store.update_video(video_id, data)
        if not video:
            return jsonify({'error': 'Video not found'}), 404
        return jsonify({'video': video})
    except Exception as e:
        print(f"Error updating video: {e}")
        return jsonify({'error': 'Failed to update video', 'message': str(e)}), 500

@app.route('/api/learning/videos/<video_id>', methods=['DELETE'])
def delete_video(video_id):
    success = learning_store.delete_video(video_id)
    if not success:
        return jsonify({'error': 'Video not found'}), 404
    return jsonify({'success': True})

@require_session

@require_session
@app.route('/api/boards/<board_id>/snapshot', methods=['GET'])
def get_board_snapshot(board_id):
    """Get board snapshot for Firebase fallback"""
    try:
        user_info = get_user_info()
        if not user_info:
            return jsonify({'error': 'Authentication required'}), 401
        
        # In a full implementation, this would fetch from a database
        # For now, return a minimal snapshot structure
        snapshot = {
            'boardId': board_id,
            'canvasState': {
                'version': 0,
                'lastUpdated': datetime.utcnow().isoformat(),
                'ownerId': user_info['id'],
                'actions': [],
                'metadata': {}
            },
            'presence': {},
            'notifications': []
        }
        
        # Emit socket event
        socketio.emit('board_snapshot_ready', {
            'boardId': board_id,
            'userId': user_info['id']
        })
        
        return jsonify(snapshot), 200
    except Exception as e:
        print(f"Error getting board snapshot: {e}")
        return jsonify({'error': 'Failed to get board snapshot'}), 500

@require_session
@app.route('/api/boards/<board_id>/presence', methods=['GET', 'POST'])
def board_presence(board_id):
    """Handle board presence updates"""
    try:
        user_info = get_user_info()
        if not user_info:
            return jsonify({'error': 'Authentication required'}), 401
        
        if request.method == 'GET':
            # Return current presence data
            # In full implementation, fetch from database/cache
            return jsonify({'presence': {}}), 200
        else:  # POST
            # Update presence
            data = request.get_json()
            presence_data = {
                'userId': user_info['id'],
                'name': user_info['name'],
                'status': data.get('status', 'active'),
                'cursor': data.get('cursor'),
                'lastHeartbeat': datetime.utcnow().isoformat()
            }
            
            # Emit presence update
            socketio.emit('presence_updated', {
                'boardId': board_id,
                'presence': presence_data
            })
            
            return jsonify({'success': True, 'presence': presence_data}), 200
    except Exception as e:
        print(f"Error handling board presence: {e}")
        return jsonify({'error': 'Failed to handle presence'}), 500

# Socket.IO event for auth restoration
@socketio.on('auth_restored')
def handle_auth_restored(data):
    """Handle auth restoration event from client"""
    user_info = get_user_info()
    if user_info:
        emit('auth_restored_ack', {'userId': user_info['id']}, broadcast=False)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    """Catch-all route to redirect frontend paths to the frontend domain"""
    # Don't redirect API routes - these should have been matched by specific routes above
    # If we get here with an API path, it means the route doesn't exist
    if path.startswith('api/'):
        return jsonify({'error': 'Not found'}), 404
    
    # Build the full frontend URL with query parameters
    frontend_url = get_frontend_url()
    query_string = request.query_string.decode('utf-8')
    
    if path:
        redirect_url = f'{frontend_url}/{path}'
    else:
        redirect_url = frontend_url
    
    if query_string:
        redirect_url = f'{redirect_url}?{query_string}'
    
    return redirect(redirect_url, code=302)
# Wellness Module Models
if DB_AVAILABLE:
    class WellnessModule(db.Model):
        __tablename__ = 'wellness_modules'
        id = db.Column(db.String(36), primary_key=True)
        title = db.Column(db.String(200), nullable=False)
        description = db.Column(db.Text)
        duration = db.Column(db.Integer)  # minutes
        prerequisites = db.Column(db.Text)  # JSON array of module IDs
        completion_criteria = db.Column(db.Text)  # JSON object
        activation_key = db.Column(db.String(255))  # hashed
        category = db.Column(db.String(50))  # mental, physical, spiritual
        created_at = db.Column(db.DateTime, default=datetime.utcnow)
        
        def to_dict(self):
            return {
                'id': self.id,
                'title': self.title,
                'description': self.description,
                'duration': self.duration,
                'prerequisites': json.loads(self.prerequisites) if self.prerequisites else [],
                'completionCriteria': json.loads(self.completion_criteria) if self.completion_criteria else {},
                'category': self.category,
                'createdAt': self.created_at.isoformat() if self.created_at else None
            }
    
    class WellnessProgress(db.Model):
        __tablename__ = 'wellness_progress'
        id = db.Column(db.String(36), primary_key=True)
        user_id = db.Column(db.String(36), db.ForeignKey('user_profiles.id'), nullable=False)
        module_id = db.Column(db.String(36), db.ForeignKey('wellness_modules.id'), nullable=False)
        state = db.Column(db.String(20), default='locked')  # locked, in-progress, completed
        started_at = db.Column(db.DateTime)
        completed_at = db.Column(db.DateTime)
        activation_attempts = db.Column(db.Integer, default=0)
        
        def to_dict(self):
            return {
                'id': self.id,
                'userId': self.user_id,
                'moduleId': self.module_id,
                'state': self.state,
                'startedAt': self.started_at.isoformat() if self.started_at else None,
                'completedAt': self.completed_at.isoformat() if self.completed_at else None,
                'activationAttempts': self.activation_attempts
            }
    
    class MentorCue(db.Model):
        __tablename__ = 'mentor_cues'
        id = db.Column(db.String(36), primary_key=True)
        module_id = db.Column(db.String(36), db.ForeignKey('wellness_modules.id'), nullable=False)
        type = db.Column(db.String(20))  # audio, video
        content_url = db.Column(db.Text)
        duration = db.Column(db.Integer)  # seconds
        transcription = db.Column(db.Text)
        
        def to_dict(self):
            return {
                'id': self.id,
                'moduleId': self.module_id,
                'type': self.type,
                'contentUrl': self.content_url,
                'duration': self.duration,
                'transcription': self.transcription
            }

# Wellness Module API Endpoints

@require_session
@app.route('/api/wellness/modules', methods=['GET'])
def get_wellness_modules():
    """Get all wellness modules with user progress"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    try:
        user_info = get_user_info()
        if not user_info:
            return jsonify({'error': 'Authentication required'}), 401
        
        modules = WellnessModule.query.all()
        user_progress = WellnessProgress.query.filter_by(user_id=user_info['id']).all()
        
        # Map progress by module ID
        progress_map = {p.module_id: p for p in user_progress}
        
        result = []
        for module in modules:
            module_dict = module.to_dict()
            if module.id in progress_map:
                module_dict['progress'] = progress_map[module.id].to_dict()
            else:
                module_dict['progress'] = {'state': 'locked'}
            result.append(module_dict)
        
        return jsonify({'modules': result}), 200
    except Exception as e:
        print(f"Error fetching wellness modules: {e}")
        return jsonify({'error': 'Failed to fetch modules'}), 500

@require_session
@app.route('/api/wellness/modules/<module_id>', methods=['GET'])
def get_wellness_module(module_id):
    """Get specific wellness module details"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    try:
        module = WellnessModule.query.get_or_404(module_id)
        return jsonify({'module': module.to_dict()}), 200
    except Exception as e:
        print(f"Error fetching wellness module: {e}")
        return jsonify({'error': 'Failed to fetch module'}), 500

@require_session
@app.route('/api/wellness/activate', methods=['POST'])
def activate_wellness_module():
    """Verify activation key and transition module state"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    try:
        user_info = get_user_info()
        if not user_info:
            return jsonify({'error': 'Authentication required'}), 401
        
        data = request.get_json()
        module_id = data.get('moduleId')
        activation_key = data.get('activationKey')
        
        if not module_id or not activation_key:
            return jsonify({'error': 'Module ID and activation key required'}), 400
        
        module = WellnessModule.query.get_or_404(module_id)
        
        # Simple key verification (in production, use proper hashing)
        if module.activation_key and module.activation_key != activation_key:
            # Increment attempt count
            progress = WellnessProgress.query.filter_by(
                user_id=user_info['id'],
                module_id=module_id
            ).first()
            
            if progress:
                progress.activation_attempts += 1
                db.session.commit()
            
            return jsonify({'error': 'Invalid activation key'}), 400
        
        # Get or create progress
        progress = WellnessProgress.query.filter_by(
            user_id=user_info['id'],
            module_id=module_id
        ).first()
        
        if not progress:
            progress = WellnessProgress(
                id=str(uuid.uuid4()),
                user_id=user_info['id'],
                module_id=module_id,
                state='in-progress',
                started_at=datetime.utcnow()
            )
            db.session.add(progress)
        else:
            if progress.state == 'locked':
                progress.state = 'in-progress'
                progress.started_at = datetime.utcnow()
            elif progress.state == 'in-progress':
                progress.state = 'completed'
                progress.completed_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'progress': progress.to_dict()
        }), 200
    except Exception as e:
        print(f"Error activating module: {e}")
        return jsonify({'error': 'Failed to activate module'}), 500

@require_session
@app.route('/api/wellness/mentor-cues/<module_id>', methods=['GET'])
def get_mentor_cues(module_id):
    """Get mentor cues for a specific module"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    try:
        cues = MentorCue.query.filter_by(module_id=module_id).all()
        return jsonify({'cues': [cue.to_dict() for cue in cues]}), 200
    except Exception as e:
        print(f"Error fetching mentor cues: {e}")
        return jsonify({'error': 'Failed to fetch cues'}), 500


# Crypto Incentive Models
if DB_AVAILABLE:
    class CryptoTransaction(db.Model):
        __tablename__ = 'crypto_transactions'
        id = db.Column(db.String(36), primary_key=True)
        user_id = db.Column(db.String(36), db.ForeignKey('user_profiles.id'), nullable=False)
        amount = db.Column(db.Float, nullable=False)
        reason = db.Column(db.String(200))
        transaction_hash = db.Column(db.String(255))
        created_at = db.Column(db.DateTime, default=datetime.utcnow)
        
        def to_dict(self):
            return {
                'id': self.id,
                'userId': self.user_id,
                'amount': self.amount,
                'reason': self.reason,
                'transactionHash': self.transaction_hash,
                'createdAt': self.created_at.isoformat() if self.created_at else None
            }
    
    class MentorMentee(db.Model):
        __tablename__ = 'mentor_mentee'
        id = db.Column(db.String(36), primary_key=True)
        mentor_id = db.Column(db.String(36), db.ForeignKey('user_profiles.id'), nullable=False)
        mentee_id = db.Column(db.String(36), db.ForeignKey('user_profiles.id'), nullable=False)
        started_at = db.Column(db.DateTime, default=datetime.utcnow)
        last_active_at = db.Column(db.DateTime, default=datetime.utcnow)
        tasks_completed = db.Column(db.Integer, default=0)
        retention_days = db.Column(db.Integer, default=0)
        
        def to_dict(self):
            return {
                'id': self.id,
                'mentorId': self.mentor_id,
                'menteeId': self.mentee_id,
                'startedAt': self.started_at.isoformat() if self.started_at else None,
                'lastActiveAt': self.last_active_at.isoformat() if self.last_active_at else None,
                'tasksCompleted': self.tasks_completed,
                'retentionDays': self.retention_days
            }
    
    # Creative Dashboard - Client Management Models
    class Client(db.Model):
        __tablename__ = 'clients'
        
        id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
        name = db.Column(db.String(200), nullable=False)
        email = db.Column(db.String(255), nullable=False, unique=True, index=True)
        company = db.Column(db.String(200), nullable=False)
        phone = db.Column(db.String(50), nullable=True)
        status = db.Column(db.String(20), default='pending', nullable=False)  # pending, active, inactive
        tier = db.Column(db.String(50), nullable=True)  # starter, professional, enterprise
        notes = db.Column(db.Text, nullable=True)
        tags = db.Column(db.Text, nullable=True)  # JSON array of tags
        created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
        updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
        
        # Relationships
        employee_assignments = db.relationship('ClientEmployeeAssignment', backref='client', lazy=True, cascade='all, delete-orphan')
        dashboard_connections = db.relationship('ClientDashboardConnection', backref='client', lazy=True, cascade='all, delete-orphan')
        
        def to_dict(self):
            return {
                'id': self.id,
                'name': self.name,
                'email': self.email,
                'company': self.company,
                'phone': self.phone,
                'status': self.status,
                'tier': self.tier,
                'notes': self.notes,
                'tags': json.loads(self.tags) if self.tags else [],
                'createdAt': self.created_at.isoformat() if self.created_at else None,
                'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
                'assignedEmployee': self.employee_assignments[0].employee_name if self.employee_assignments else None,
                'systemsConnected': [conn.dashboard_type for conn in self.dashboard_connections if conn.enabled]
            }
    
    class ClientEmployeeAssignment(db.Model):
        __tablename__ = 'client_employee_assignments'
        
        id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
        client_id = db.Column(db.String(36), db.ForeignKey('clients.id'), nullable=False, index=True)
        employee_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True, index=True)
        employee_name = db.Column(db.String(200), nullable=True)  # Store name for flexibility
        assigned_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
        created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
        
        def to_dict(self):
            return {
                'id': self.id,
                'clientId': self.client_id,
                'employeeId': self.employee_id,
                'employeeName': self.employee_name,
                'assignedAt': self.assigned_at.isoformat() if self.assigned_at else None
            }
    
    class ClientDashboardConnection(db.Model):
        __tablename__ = 'client_dashboard_connections'
        
        id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
        client_id = db.Column(db.String(36), db.ForeignKey('clients.id'), nullable=False, index=True)
        dashboard_type = db.Column(db.String(50), nullable=False)  # cowork, rise, crm, analytics, marketing
        enabled = db.Column(db.Boolean, default=True, nullable=False)
        connected_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
        created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
        
        def to_dict(self):
            return {
                'id': self.id,
                'clientId': self.client_id,
                'dashboardType': self.dashboard_type,
                'enabled': self.enabled,
                'connectedAt': self.connected_at.isoformat() if self.connected_at else None
            }
    
    class SupportRequest(db.Model):
        __tablename__ = 'support_requests'
        
        id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
        client_id = db.Column(db.String(36), db.ForeignKey('clients.id'), nullable=True, index=True)
        client_name = db.Column(db.String(200), nullable=True)  # Store name for flexibility
        subject = db.Column(db.String(255), nullable=False)
        description = db.Column(db.Text, nullable=False)
        priority = db.Column(db.String(20), default='medium', nullable=False)  # low, medium, high, urgent
        status = db.Column(db.String(20), default='open', nullable=False)  # open, in-progress, resolved, closed
        assigned_to = db.Column(db.String(200), nullable=True)
        created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
        updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
        
        def to_dict(self):
            return {
                'id': self.id,
                'client': self.client_name or (self.client_id if self.client_id else 'N/A'),
                'subject': self.subject,
                'description': self.description,
                'priority': self.priority,
                'status': self.status,
                'assignedTo': self.assigned_to,
                'createdAt': self.created_at.isoformat() if self.created_at else None,
                'updatedAt': self.updated_at.isoformat() if self.updated_at else None
            }
    
    class Subscription(db.Model):
        __tablename__ = 'subscriptions'
        
        id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
        user_id = db.Column(db.String(36), nullable=False, index=True)  # Can be user ID or email
        tier = db.Column(db.String(50), nullable=False)  # starter, professional, enterprise
        billing_cycle = db.Column(db.String(20), nullable=False)  # monthly, annual
        status = db.Column(db.String(20), default='active', nullable=False)  # active, cancelled, pending, expired
        amount = db.Column(db.Float, nullable=False)
        currency = db.Column(db.String(10), default='USD', nullable=False)
        payment_method = db.Column(db.String(50), nullable=True)  # card, paypal, bank, wire
        payment_method_id = db.Column(db.String(255), nullable=True)  # External payment method ID
        started_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
        expires_at = db.Column(db.DateTime, nullable=True)
        cancelled_at = db.Column(db.DateTime, nullable=True)
        created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
        updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
        
        def to_dict(self):
            return {
                'id': self.id,
                'userId': self.user_id,
                'tier': self.tier,
                'billingCycle': self.billing_cycle,
                'status': self.status,
                'amount': self.amount,
                'currency': self.currency,
                'paymentMethod': self.payment_method,
                'startedAt': self.started_at.isoformat() if self.started_at else None,
                'expiresAt': self.expires_at.isoformat() if self.expires_at else None,
                'cancelledAt': self.cancelled_at.isoformat() if self.cancelled_at else None,
                'createdAt': self.created_at.isoformat() if self.created_at else None
            }

# Crypto Transaction API Endpoints

@require_session
@app.route('/api/crypto/balance', methods=['GET'])
def get_crypto_balance():
    """Get user's crypto balance and transaction history"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    try:
        user_info = get_user_info()
        if not user_info:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Get all transactions for user
        transactions = CryptoTransaction.query.filter_by(
            user_id=user_info['id']
        ).order_by(CryptoTransaction.created_at.desc()).limit(50).all()
        
        # Calculate balance
        balance = sum(tx.amount for tx in transactions)
        
        return jsonify({
            'balance': balance,
            'transactions': [tx.to_dict() for tx in transactions]
        }), 200
    except Exception as e:
        print(f"Error fetching crypto balance: {e}")
        return jsonify({'error': 'Failed to fetch balance'}), 500

@require_session
@app.route('/api/crypto/award', methods=['POST'])
def award_crypto():
    """Award crypto to user (admin or system function)"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    try:
        user_info = get_user_info()
        if not user_info:
            return jsonify({'error': 'Authentication required'}), 401
        
        data = request.get_json()
        amount = data.get('amount')
        reason = data.get('reason', 'Task completion')
        recipient_id = data.get('recipientId', user_info['id'])
        
        if not amount or amount <= 0:
            return jsonify({'error': 'Invalid amount'}), 400
        
        # Create transaction
        transaction = CryptoTransaction(
            id=str(uuid.uuid4()),
            user_id=recipient_id,
            amount=amount,
            reason=reason,
            transaction_hash=f"tx_{uuid.uuid4().hex[:16]}"
        )
        
        db.session.add(transaction)
        db.session.commit()
        
        # Emit socket event
        socketio.emit('crypto_awarded', {
            'userId': recipient_id,
            'amount': amount,
            'reason': reason,
            'transactionId': transaction.id
        })
        
        return jsonify({
            'success': True,
            'transaction': transaction.to_dict()
        }), 201
    except Exception as e:
        print(f"Error awarding crypto: {e}")
        return jsonify({'error': 'Failed to award crypto'}), 500

@require_session
@app.route('/api/crypto/stats', methods=['GET'])
def get_crypto_stats():
    """Get crypto statistics for user"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    try:
        user_info = get_user_info()
        if not user_info:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Get completed tasks count
        completed_tasks = Task.query.filter_by(status='completed').count()
        
        # Get mentor-mentee relationships
        as_mentor = MentorMentee.query.filter_by(mentor_id=user_info['id']).all()
        as_mentee = MentorMentee.query.filter_by(mentee_id=user_info['id']).all()
        
        # Calculate retention bonus (placeholder logic)
        total_retention_bonus = 0
        for relationship in as_mentor:
            # Award bonus based on retention days
            if relationship.retention_days > 30:
                total_retention_bonus += relationship.retention_days * 0.5
        
        return jsonify({
            'completedTasks': completed_tasks,
            'tasksToVenture': 100,
            'mentorRelationships': len(as_mentor),
            'menteeRelationships': len(as_mentee),
            'retentionBonus': total_retention_bonus,
            'role': user_info['role']
        }), 200
    except Exception as e:
        print(f"Error fetching crypto stats: {e}")
        return jsonify({'error': 'Failed to fetch stats'}), 500

# --- Admin Endpoints ---
@app.route('/api/admin/users', methods=['GET'])
@require_admin
def admin_list_users():
    """List all users (admin only)"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 500
    
    try:
        users = User.query.all()
        users_data = []
        for user in users:
            try:
                user_dict = user.to_dict()
                # Also get profile data if available
                try:
                    profile_id = user.ens_name or user.patreon_id or user.username or str(user.id)
                    profile = UserProfile.query.get(profile_id)
                    if profile:
                        profile_dict = profile.to_dict()
                        user_dict.update(profile_dict)
                except Exception as profile_error:
                    print(f"Error fetching profile for user {user.id}: {profile_error}")
                    pass
                
                # Ensure required fields exist
                if 'id' not in user_dict:
                    user_dict['id'] = user.ens_name or user.patreon_id or user.username or str(user.id)
                if 'username' not in user_dict:
                    user_dict['username'] = user.username or ''
                if 'email' not in user_dict:
                    user_dict['email'] = user.email or ''
                if 'isEmployee' not in user_dict:
                    user_dict['isEmployee'] = safe_get_is_employee(user)
                if 'isAdmin' not in user_dict:
                    user_dict['isAdmin'] = getattr(user, 'is_admin', False)
                
                users_data.append(user_dict)
            except Exception as user_error:
                print(f"Error processing user {getattr(user, 'id', 'unknown')}: {user_error}")
                # Add minimal user data even if to_dict() fails
                users_data.append({
                    'id': getattr(user, 'id', 'unknown'),
                    'username': getattr(user, 'username', ''),
                    'email': getattr(user, 'email', ''),
                    'isEmployee': safe_get_is_employee(user),
                    'isAdmin': getattr(user, 'is_admin', False),
                    'error': f'Error loading user data: {str(user_error)}'
                })
        
        return jsonify({'users': users_data})
    except Exception as e:
        print(f"Error listing users: {e}")
        import traceback
        traceback.print_exc()
        app.logger.error(f"Error listing users: {e}")
        return jsonify({'error': f'Failed to list users: {str(e)}'}), 500

@app.route('/api/admin/users/<user_id>/admin', methods=['PUT'])
@require_admin
def admin_toggle_admin(user_id):
    """Toggle admin status for a user (admin only)"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 500
    
    try:
        data = request.json
        is_admin = data.get('isAdmin', False)
        
        # Find user by ID, username, patreon_id, or ens_name
        user = None
        if user_id.isdigit():
            user = User.query.get(int(user_id))
        if not user:
            user = User.query.filter_by(username=user_id).first()
        if not user:
            user = User.query.filter_by(patreon_id=user_id).first()
        if not user:
            user = User.query.filter_by(ens_name=user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if is_admin column exists
        column_exists = check_is_employee_column_exists()
        if not column_exists:
            # Try to add the column if it doesn't exist
            try:
                with db.engine.connect() as conn:
                    conn.execute(db.text("""
                        ALTER TABLE users 
                        ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT false
                    """))
                    conn.commit()
            except Exception as e:
                error_str = str(e).lower()
                if 'already exists' not in error_str and 'duplicate' not in error_str:
                    return jsonify({'error': 'Database migration required: is_admin column missing'}), 500
        
        # Update admin status
        if hasattr(user, 'is_admin'):
            user.is_admin = is_admin
            # If making admin, also make them an employee
            if is_admin and hasattr(user, 'is_employee'):
                user.is_employee = True
        else:
            # Column doesn't exist, try raw SQL
            try:
                with db.engine.connect() as conn:
                    conn.execute(db.text("""
                        UPDATE users 
                        SET is_admin = :is_admin, is_employee = CASE WHEN :is_admin = true THEN true ELSE is_employee END
                        WHERE id = :user_id OR username = :user_id OR patreon_id = :user_id OR ens_name = :user_id
                    """), {
                        'is_admin': is_admin,
                        'user_id': user_id
                    })
                    conn.commit()
            except Exception as e:
                return jsonify({'error': f'Failed to update admin status: {str(e)}'}), 500
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Admin status updated to {is_admin}',
            'user': user.to_dict() if hasattr(user, 'to_dict') else {'id': str(user.id), 'isAdmin': is_admin}
        })
    except Exception as e:
        print(f"Error updating admin status: {e}")
        app.logger.error(f"Error updating admin status: {e}")
        db.session.rollback()
        return jsonify({'error': f'Failed to update admin status: {str(e)}'}), 500

@app.route('/api/admin/users/<user_id>/password', methods=['PUT', 'OPTIONS'])
def admin_change_password(user_id):
    """Change a user's password (admin only)"""
    # Handle CORS preflight - must be before require_admin
    if request.method == 'OPTIONS':
        origin = request.headers.get('Origin', 'https://ventures.isharehow.app')
        # Check if origin is in allowed list
        allowed_origins = ['https://ventures.isharehow.app']
        if os.environ.get('FLASK_ENV') != 'production':
            allowed_origins.extend(['http://localhost:5000', 'http://localhost:3000'])
        
        # Use specific origin if allowed, otherwise use default
        if origin in allowed_origins:
            cors_origin = origin
        else:
            cors_origin = 'https://ventures.isharehow.app'
        
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', cors_origin)
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'PUT, OPTIONS')
        return response
    
    # Apply admin check for PUT requests
    if request.method == 'PUT':
        # Check JWT authentication first
        try:
            from flask_jwt_extended import verify_jwt_in_request
            verify_jwt_in_request()
        except Exception as e:
            # Set CORS headers for error response
            origin = request.headers.get('Origin', 'https://ventures.isharehow.app')
            allowed_origins = ['https://ventures.isharehow.app']
            if os.environ.get('FLASK_ENV') != 'production':
                allowed_origins.extend(['http://localhost:5000', 'http://localhost:3000'])
            
            if origin in allowed_origins:
                cors_origin = origin
            else:
                cors_origin = 'https://ventures.isharehow.app'
            
            response = jsonify({'error': 'Authentication required'})
            response.headers.add('Access-Control-Allow-Origin', cors_origin)
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            return response, 401
        
        # Use require_admin decorator logic inline
        user = get_current_user()
        if not user:
            # Set CORS headers for error response
            origin = request.headers.get('Origin', 'https://ventures.isharehow.app')
            allowed_origins = ['https://ventures.isharehow.app']
            if os.environ.get('FLASK_ENV') != 'production':
                allowed_origins.extend(['http://localhost:5000', 'http://localhost:3000'])
            
            if origin in allowed_origins:
                cors_origin = origin
            else:
                cors_origin = 'https://ventures.isharehow.app'
            
            response = jsonify({'error': 'Authentication required'})
            response.headers.add('Access-Control-Allow-Origin', cors_origin)
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            return response, 401
        # Check if user is admin (same logic as require_admin)
        is_admin = False
        if hasattr(user, 'is_admin'):
            is_admin = bool(user.is_admin)
        if not is_admin:
            if hasattr(user, 'patreon_id') and user.patreon_id == '56776112':
                is_admin = True
            elif hasattr(user, 'username') and user.username:
                username_lower = user.username.lower()
                if username_lower in ['isharehow', 'admin']:
                    is_admin = True
            elif hasattr(user, 'email') and user.email:
                email_lower = user.email.lower()
                if email_lower == 'jeliyah@isharehowlabs.com':
                    is_admin = True
        if not is_admin:
            # Set CORS headers for error response
            origin = request.headers.get('Origin', 'https://ventures.isharehow.app')
            allowed_origins = ['https://ventures.isharehow.app']
            if os.environ.get('FLASK_ENV') != 'production':
                allowed_origins.extend(['http://localhost:5000', 'http://localhost:3000'])
            
            if origin in allowed_origins:
                cors_origin = origin
            else:
                cors_origin = 'https://ventures.isharehow.app'
            
            response = jsonify({'error': 'Admin access required'})
            response.headers.add('Access-Control-Allow-Origin', cors_origin)
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            return response, 403
    
    if not DB_AVAILABLE:
        # Set CORS headers for error response
        origin = request.headers.get('Origin', 'https://ventures.isharehow.app')
        allowed_origins = ['https://ventures.isharehow.app']
        if os.environ.get('FLASK_ENV') != 'production':
            allowed_origins.extend(['http://localhost:5000', 'http://localhost:3000'])
        
        if origin in allowed_origins:
            cors_origin = origin
        else:
            cors_origin = 'https://ventures.isharehow.app'
        
        response = jsonify({'error': 'Database not available'})
        response.headers.add('Access-Control-Allow-Origin', cors_origin)
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 500
    
    try:
        data = request.json or {}
        new_password = data.get('password', '').strip()
        
        if not new_password:
            # Set CORS headers for error response
            origin = request.headers.get('Origin', 'https://ventures.isharehow.app')
            allowed_origins = ['https://ventures.isharehow.app']
            if os.environ.get('FLASK_ENV') != 'production':
                allowed_origins.extend(['http://localhost:5000', 'http://localhost:3000'])
            
            if origin in allowed_origins:
                cors_origin = origin
            else:
                cors_origin = 'https://ventures.isharehow.app'
            
            response = jsonify({'error': 'Password is required'})
            response.headers.add('Access-Control-Allow-Origin', cors_origin)
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            return response, 400
        
        if len(new_password) < 6:
            # Set CORS headers for error response
            origin = request.headers.get('Origin', 'https://ventures.isharehow.app')
            allowed_origins = ['https://ventures.isharehow.app']
            if os.environ.get('FLASK_ENV') != 'production':
                allowed_origins.extend(['http://localhost:5000', 'http://localhost:3000'])
            
            if origin in allowed_origins:
                cors_origin = origin
            else:
                cors_origin = 'https://ventures.isharehow.app'
            
            response = jsonify({'error': 'Password must be at least 6 characters'})
            response.headers.add('Access-Control-Allow-Origin', cors_origin)
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            return response, 400
        
        # Decode user_id if it was URL encoded
        try:
            user_id = request.view_args.get('user_id') or user_id
        except:
            pass
        
        # Find user by ID, username, patreon_id, or ens_name
        user = None
        if user_id and user_id.isdigit():
            user = User.query.get(int(user_id))
        if not user and user_id:
            user = User.query.filter_by(username=user_id).first()
        if not user and user_id:
            user = User.query.filter_by(patreon_id=user_id).first()
        if not user and user_id:
            user = User.query.filter_by(ens_name=user_id).first()
        
        if not user:
            # Set CORS headers for error response
            origin = request.headers.get('Origin', 'https://ventures.isharehow.app')
            allowed_origins = ['https://ventures.isharehow.app']
            if os.environ.get('FLASK_ENV') != 'production':
                allowed_origins.extend(['http://localhost:5000', 'http://localhost:3000'])
            
            if origin in allowed_origins:
                cors_origin = origin
            else:
                cors_origin = 'https://ventures.isharehow.app'
            
            response = jsonify({'error': f'User not found: {user_id}'})
            response.headers.add('Access-Control-Allow-Origin', cors_origin)
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            return response, 404
        
        # Change password using User model's set_password method
        if hasattr(user, 'set_password'):
            user.set_password(new_password)
        else:
            # Fallback: hash password directly using bcrypt
            password_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
            user.password_hash = password_hash.decode('utf-8')
        
        db.session.commit()
        
        # Set CORS headers for response
        origin = request.headers.get('Origin', 'https://ventures.isharehow.app')
        allowed_origins = ['https://ventures.isharehow.app']
        if os.environ.get('FLASK_ENV') != 'production':
            allowed_origins.extend(['http://localhost:5000', 'http://localhost:3000'])
        
        if origin in allowed_origins:
            cors_origin = origin
        else:
            cors_origin = 'https://ventures.isharehow.app'
        
        response = jsonify({
            'success': True,
            'message': 'Password changed successfully',
            'user': {
                'id': str(user.id),
                'username': user.username,
                'email': user.email
            }
        })
        response.headers.add('Access-Control-Allow-Origin', cors_origin)
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
    except Exception as e:
        print(f"Error changing password: {e}")
        import traceback
        traceback.print_exc()
        app.logger.error(f"Error changing password: {e}")
        db.session.rollback()
        
        # Set CORS headers for error response
        origin = request.headers.get('Origin', 'https://ventures.isharehow.app')
        allowed_origins = ['https://ventures.isharehow.app']
        if os.environ.get('FLASK_ENV') != 'production':
            allowed_origins.extend(['http://localhost:5000', 'http://localhost:3000'])
        
        if origin in allowed_origins:
            cors_origin = origin
        else:
            cors_origin = 'https://ventures.isharehow.app'
        
        response = jsonify({'error': f'Failed to change password: {str(e)}'})
        response.headers.add('Access-Control-Allow-Origin', cors_origin)
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 500

@app.route('/api/admin/users/<user_id>/employee', methods=['PUT'])
@require_admin
def admin_toggle_employee(user_id):
    """Toggle employee status for a user (admin only)"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 500
    
    try:
        data = request.json
        is_employee = data.get('isEmployee', False)
        
        # Find user by ID, username, patreon_id, or ens_name
        user = None
        if user_id.isdigit():
            user = User.query.get(int(user_id))
        if not user:
            user = User.query.filter_by(username=user_id).first()
        if not user:
            user = User.query.filter_by(patreon_id=user_id).first()
        if not user:
            user = User.query.filter_by(ens_name=user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Don't allow removing employee status from admins
        if hasattr(user, 'is_admin') and user.is_admin and not is_employee:
            return jsonify({'error': 'Cannot remove employee status from admins'}), 400
        
        user.is_employee = is_employee
        db.session.commit()
        
        # Also update UserProfile if it exists
        try:
            profile_id = user.ens_name or user.patreon_id or user.username or str(user.id)
            profile = UserProfile.query.get(profile_id)
            if profile:
                profile.is_employee = is_employee
                db.session.commit()
        except:
            pass
        
        return jsonify({
            'success': True,
            'message': f'Employee status updated to {is_employee}',
            'user': user.to_dict()
        })
    except Exception as e:
        print(f"Error updating employee status: {e}")
        app.logger.error(f"Error updating employee status: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to update employee status'}), 500


# ==================== LookUp.Cafe Game Handlers ====================
import random
import hashlib
import string
from datetime import datetime

# In-memory storage for game rooms (use Redis for production)
game_rooms = {}

def generate_room_code():
    """Generate a unique 6-character room code"""
    while True:
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        if code not in game_rooms:
            return code

@socketio.on('game:create-room')
@socketio.on('game:create-room')
def handle_create_room(data):
    """Create a new game room"""
    try:
        player_name = data.get('playerName', 'Guest')
        user_id = data.get('userId')
        avatar = data.get('avatar')
        custom_room_code = data.get('roomCode', '').strip()
        
        # Determine room code
        if custom_room_code:
            # If roomCode is provided (from userId), convert it to 6-char code
            # Use first 6 chars of hash for consistency
            if len(custom_room_code) > 6:
                # Hash the userId to create a consistent 6-char code
                hash_obj = hashlib.md5(custom_room_code.encode())
                room_code = hash_obj.hexdigest()[:6].upper()
            else:
                room_code = custom_room_code.upper()
            
            # Check if code already exists
            if room_code in game_rooms:
                emit('game:error', {'message': 'Room code already in use. Please try again.'})
                return
        else:
            # Auto-generate if not provided
            room_code = generate_room_code()
        
        player_id = request.sid
        
        # Create room
        game_rooms[room_code] = {
            'roomCode': room_code,
            'hostId': player_id,
            'players': [{
                'id': player_id,
                'name': player_name,
                'score': 0,
                'isHost': True,
                'isActive': True,
                'avatar': avatar,
                'userId': user_id,
            }],
            'gameType': None,
            'state': 'lobby',
            'currentRound': 0,
            'maxRounds': 5,
            'currentDrawerId': None,
            'currentWord': None,
            'roundStartTime': None,
        }
        
        # Join socket.io room
        join_room(room_code)
        
        emit('game:room-created', {'room': game_rooms[room_code]})
        
    except Exception as e:
        emit('game:error', {'message': f'Failed to create room: {str(e)}'})


@socketio.on('game:leave-room')
def handle_leave_room(data):
    """Leave a game room"""
    try:
        room_code = data.get('roomCode')
        player_id = request.sid
        
        if room_code not in game_rooms:
            return
        
        room = game_rooms[room_code]
        
        # Remove player
        room['players'] = [p for p in room['players'] if p['id'] != player_id]
        
        # If room is empty, delete it
        if not room['players']:
            del game_rooms[room_code]
            return
        
        # If host left, assign new host
        if room['hostId'] == player_id and room['players']:
            room['players'][0]['isHost'] = True
            room['hostId'] = room['players'][0]['id']
        
        # Notify others
        emit('game:player-left', {
            'playerId': player_id,
            'room': room
        }, room=room_code)
        
    except Exception as e:
        print(f'Error leaving room: {e}')

@socketio.on('game:start-game')
def handle_start_game(data):
    """Start the game"""
    try:
        room_code = data.get('roomCode')
        game_type = data.get('gameType')
        max_rounds = data.get('maxRounds', 5)
        player_id = request.sid
        
        if room_code not in game_rooms:
            emit('game:error', {'message': 'Room not found'})
            return
        
        room = game_rooms[room_code]
        
        # Verify host
        if room['hostId'] != player_id:
            emit('game:error', {'message': 'Only host can start the game'})
            return
        
        # Check minimum players
        if len(room['players']) < 2:
            emit('game:error', {'message': 'Need at least 2 players'})
            return
        
        # Update room state
        room['gameType'] = game_type
        room['state'] = 'playing'
        room['currentRound'] = 1
        room['maxRounds'] = max_rounds
        room['roundStartTime'] = datetime.now().timestamp()
        
        # For drawing game, select first drawer
        if game_type == 'drawing':
            room['currentDrawerId'] = room['players'][0]['id']
            # In production, fetch from word list
            room['currentWord'] = random.choice(['cat', 'house', 'tree', 'car', 'sun'])
        
        # Notify all players
        emit('game:started', {'room': room}, room=room_code)
        emit('game:round-start', {
            'room': room,
            'word': room['currentWord'] if game_type == 'drawing' else None
        }, room=room_code)
        
    except Exception as e:
        emit('game:error', {'message': f'Failed to start game: {str(e)}'})

@socketio.on('game:submit-answer')
def handle_submit_answer(data):
    """Submit an answer/guess"""
    try:
        room_code = data.get('roomCode')
        answer = data.get('answer', '').strip().lower()
        player_id = request.sid
        
        if room_code not in game_rooms:
            return
        
        room = game_rooms[room_code]
        
        # For drawing game, check if answer is correct
        if room['gameType'] == 'drawing':
            correct_word = room.get('currentWord', '').lower()
            if answer == correct_word:
                # Award points
                for player in room['players']:
                    if player['id'] == player_id:
                        player['score'] += 100
                        break
                
                # Notify correct answer
                emit('game:correct-answer', {
                    'playerId': player_id,
                    'answer': answer
                }, room=room_code)
        
        # For other games, store answer for later evaluation
        # In production, implement proper game logic
        
    except Exception as e:
        print(f'Error submitting answer: {e}')

@socketio.on('game:draw')
def handle_draw(data):
    """Broadcast drawing data to all players in room"""
    try:
        room_code = data.get('roomCode')
        player_id = data.get('playerId')
        
        if room_code not in game_rooms:
            return
        
        room = game_rooms[room_code]
        
        # Only allow current drawer to draw
        if room.get('currentDrawerId') != player_id:
            return
        
        # Broadcast to all other players
        emit('game:drawing-update', data, room=room_code, skip_sid=request.sid)
        
    except Exception as e:
        print(f'Error handling draw: {e}')

@socketio.on('game:clear-canvas')
def handle_clear_canvas(data):
    """Clear the canvas for all players"""
    try:
        room_code = data.get('roomCode')
        
        if room_code not in game_rooms:
            return
        
        emit('game:canvas-cleared', {}, room=room_code)
        
    except Exception as e:
        print(f'Error clearing canvas: {e}')

# ==================== End LookUp.Cafe Game Handlers ====================


# ===== Intervals.icu Integration Endpoints =====

@app.route('/api/user/api-keys', methods=['GET'])
def get_api_keys():
    """Get list of configured API keys (without exposing the keys)"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    profile, error_response, error_code = get_or_create_user_profile()
    if error_response:
        return error_response, error_code
    
    try:
        keys = UserAPIKey.query.filter_by(user_id=profile.id).all()
        return jsonify({
            'apiKeys': [key.to_dict() for key in keys]
        })
    except Exception as e:
        print(f"Error getting API keys: {e}")
        return jsonify({'error': 'Failed to get API keys'}), 500


@app.route('/api/user/api-keys', methods=['POST'])
def save_api_key():
    """Save or update an API key for a service"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    profile, error_response, error_code = get_or_create_user_profile()
    if error_response:
        return error_response, error_code
    
    try:
        from intervals_icu import encrypt_api_key, IntervalsICUClient
        
        data = request.json
        service_name = data.get('serviceName')
        api_key = data.get('apiKey')
        
        if not service_name or not api_key:
            return jsonify({'error': 'Service name and API key required'}), 400
        
        # Test the connection first
        if service_name == 'intervals_icu':
            client = IntervalsICUClient(api_key)
            if not client.test_connection():
                return jsonify({'error': 'Invalid API key or connection failed'}), 400
        
        # Check if key already exists
        existing_key = UserAPIKey.query.filter_by(
            user_id=profile.id,
            service_name=service_name
        ).first()
        
        encrypted_key = encrypt_api_key(api_key)
        
        if existing_key:
            existing_key.api_key_encrypted = encrypted_key
            existing_key.updated_at = datetime.utcnow()
        else:
            new_key = UserAPIKey(
                id=str(uuid.uuid4()),
                user_id=profile.id,
                service_name=service_name,
                api_key_encrypted=encrypted_key
            )
            db.session.add(new_key)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'API key saved successfully'
        })
    except Exception as e:
        db.session.rollback()
        print(f"Error saving API key: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to save API key'}), 500


@app.route('/api/user/api-keys/<service_name>', methods=['DELETE'])
def delete_api_key(service_name):
    """Delete an API key"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    profile, error_response, error_code = get_or_create_user_profile()
    if error_response:
        return error_response, error_code
    
    try:
        key = UserAPIKey.query.filter_by(
            user_id=profile.id,
            service_name=service_name
        ).first()
        
        if not key:
            return jsonify({'error': 'API key not found'}), 404
        
        db.session.delete(key)
        db.session.commit()
        
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting API key: {e}")
        return jsonify({'error': 'Failed to delete API key'}), 500


@app.route('/api/wellness/intervals/sync', methods=['POST'])
def sync_intervals_data():
    """Sync data from Intervals.icu"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    profile, error_response, error_code = get_or_create_user_profile()
    if error_response:
        return error_response, error_code
    
    try:
        from intervals_icu import decrypt_api_key, IntervalsICUClient
        from datetime import date
        
        # Get API key
        api_key_record = UserAPIKey.query.filter_by(
            user_id=profile.id,
            service_name='intervals_icu'
        ).first()
        
        if not api_key_record:
            return jsonify({'error': 'Intervals.icu API key not configured'}), 400
        
        api_key = decrypt_api_key(api_key_record.api_key_encrypted)
        client = IntervalsICUClient(api_key)
        
        # Get date range from request
        data = request.json or {}
        days_back = data.get('daysBack', 30)
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days_back)
        
        # Fetch and store activities
        activities = client.get_activities(start_date, end_date)
        activity_count = 0
        
        for activity_data in activities:
            existing = IntervalsActivityData.query.filter_by(
                user_id=profile.id,
                activity_id=activity_data['activity_id']
            ).first()
            
            if existing:
                # Update existing
                for key, value in activity_data.items():
                    if hasattr(existing, key):
                        setattr(existing, key, value)
                existing.synced_at = datetime.utcnow()
            else:
                # Create new
                new_activity = IntervalsActivityData(
                    id=str(uuid.uuid4()),
                    user_id=profile.id,
                    **activity_data,
                    synced_at=datetime.utcnow()
                )
                db.session.add(new_activity)
            activity_count += 1
        
        # Fetch and store wellness data
        wellness_data = client.get_wellness_data(start_date, end_date)
        wellness_count = 0
        
        for wellness_entry in wellness_data:
            metric_date = wellness_entry.pop('metric_date')
            menstruation = wellness_entry.pop('menstruation', False)
            
            existing = IntervalsWellnessMetrics.query.filter_by(
                user_id=profile.id,
                metric_date=metric_date
            ).first()
            
            if existing:
                for key, value in wellness_entry.items():
                    if hasattr(existing, key):
                        setattr(existing, key, value)
                existing.synced_at = datetime.utcnow()
            else:
                new_metric = IntervalsWellnessMetrics(
                    id=str(uuid.uuid4()),
                    user_id=profile.id,
                    metric_date=metric_date,
                    **wellness_entry,
                    synced_at=datetime.utcnow()
                )
                db.session.add(new_metric)
            wellness_count += 1
            
            # Handle menstrual data if present and opted in
            if menstruation:
                existing_menstrual = IntervalsMenstrualData.query.filter_by(
                    user_id=profile.id,
                    cycle_date=metric_date
                ).first()
                
                if not existing_menstrual:
                    new_menstrual = IntervalsMenstrualData(
                        id=str(uuid.uuid4()),
                        user_id=profile.id,
                        cycle_date=metric_date,
                        phase='menstruation',
                        opt_in=True,
                        synced_at=datetime.utcnow()
                    )
                    db.session.add(new_menstrual)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'activitiesSynced': activity_count,
            'wellnessMetricsSynced': wellness_count
        })
    except Exception as e:
        db.session.rollback()
        print(f"Error syncing Intervals.icu data: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to sync data'}), 500


@app.route('/api/wellness/intervals/activities', methods=['GET'])
def get_intervals_activities():
    """Get imported activity data"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    profile, error_response, error_code = get_or_create_user_profile()
    if error_response:
        return error_response, error_code
    
    try:
        days_back = request.args.get('daysBack', 30, type=int)
        start_date = datetime.now() - timedelta(days=days_back)
        
        activities = IntervalsActivityData.query.filter(
            IntervalsActivityData.user_id == profile.id,
            IntervalsActivityData.activity_date >= start_date.date()
        ).order_by(IntervalsActivityData.activity_date.desc()).all()
        
        return jsonify({
            'activities': [activity.to_dict() for activity in activities]
        })
    except Exception as e:
        print(f"Error getting activities: {e}")
        return jsonify({'error': 'Failed to get activities'}), 500


@app.route('/api/wellness/intervals/wellness', methods=['GET'])
def get_intervals_wellness():
    """Get imported wellness metrics"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    profile, error_response, error_code = get_or_create_user_profile()
    if error_response:
        return error_response, error_code
    
    try:
        days_back = request.args.get('daysBack', 30, type=int)
        start_date = datetime.now() - timedelta(days=days_back)
        
        metrics = IntervalsWellnessMetrics.query.filter(
            IntervalsWellnessMetrics.user_id == profile.id,
            IntervalsWellnessMetrics.metric_date >= start_date.date()
        ).order_by(IntervalsWellnessMetrics.metric_date.desc()).all()
        
        return jsonify({
            'metrics': [metric.to_dict() for metric in metrics]
        })
    except Exception as e:
        print(f"Error getting wellness metrics: {e}")
        return jsonify({'error': 'Failed to get wellness metrics'}), 500


# ============================================
# Intervals.icu Proxy Routes (CORS Bypass)
# ============================================

@app.route('/api/intervals-proxy/activities', methods=['GET', 'OPTIONS'])
def intervals_proxy_activities():
    """Proxy endpoint to bypass CORS for Intervals.icu activities"""
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        api_key = request.headers.get('X-Intervals-API-Key', '').strip()
        oldest = request.args.get('oldest', '').strip()
        
        if not api_key:
            app.logger.warning(f"Missing API key")
            return jsonify({'error': 'Missing X-Intervals-API-Key'}), 401
        if not oldest:
            app.logger.warning(f"Missing required param: oldest={oldest}")
            return jsonify({'error': 'oldest parameter is required'}), 400
        
        # Intervals.icu uses basic auth with username "API_KEY" and password as the API key
        # Use "0" for athlete_id to use the athlete associated with the API key
        import base64
        auth_string = f"API_KEY:{api_key}"
        auth_header = f"Basic {base64.b64encode(auth_string.encode('utf-8')).decode('utf-8')}"
        
        response = requests.get(
            f'https://intervals.icu/api/v1/athlete/0/activities',
            headers={'Authorization': auth_header},
            params={'oldest': oldest},
            timeout=(5, 30)
        )
        
        # Check if response is successful
        if response.status_code >= 400:
            app.logger.error(f"Intervals.icu API error: {response.status_code} - {response.text[:200]}")
            try:
                error_data = response.json()
                return jsonify({'error': 'Intervals.icu API error', 'detail': error_data}), response.status_code
            except:
                return jsonify({'error': 'Intervals.icu API error', 'detail': response.text[:200]}), response.status_code
        
        # Try to parse as JSON to validate
        try:
            data = response.json()
            return jsonify(data), 200
        except ValueError as e:
            app.logger.error(f"Failed to parse JSON response: {e}")
            return jsonify({'error': 'Invalid JSON response from Intervals.icu'}), 502
        
    except requests.RequestException as e:
        app.logger.error(f"Request exception in intervals_proxy_activities: {e}")
        return jsonify({'error': 'Upstream request failed', 'detail': str(e)}), 502
    except Exception as e:
        app.logger.error(f"Unexpected error in intervals_proxy_activities: {e}", exc_info=True)
        return jsonify({'error': 'Internal server error', 'detail': str(e)}), 500

@app.route('/api/intervals-proxy/wellness', methods=['GET', 'OPTIONS'])
def intervals_proxy_wellness():
    """Proxy endpoint to bypass CORS for Intervals.icu wellness"""
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        api_key = request.headers.get('X-Intervals-API-Key', '').strip()
        oldest = request.args.get('oldest', '').strip()
        
        if not api_key:
            app.logger.warning(f"Missing API key")
            return jsonify({'error': 'Missing X-Intervals-API-Key'}), 401
        if not oldest:
            app.logger.warning(f"Missing required param: oldest={oldest}")
            return jsonify({'error': 'oldest parameter is required'}), 400
        
        # Intervals.icu uses basic auth with username "API_KEY" and password as the API key
        # Use "0" for athlete_id to use the athlete associated with the API key
        import base64
        auth_string = f"API_KEY:{api_key}"
        auth_header = f"Basic {base64.b64encode(auth_string.encode('utf-8')).decode('utf-8')}"
        
        response = requests.get(
            f'https://intervals.icu/api/v1/athlete/0/wellness',
            headers={'Authorization': auth_header},
            params={'oldest': oldest},
            timeout=(5, 30)
        )
        
        # Check if response is successful
        if response.status_code >= 400:
            app.logger.error(f"Intervals.icu API error: {response.status_code} - {response.text[:200]}")
            try:
                error_data = response.json()
                return jsonify({'error': 'Intervals.icu API error', 'detail': error_data}), response.status_code
            except:
                return jsonify({'error': 'Intervals.icu API error', 'detail': response.text[:200]}), response.status_code
        
        # Try to parse as JSON to validate
        try:
            data = response.json()
            return jsonify(data), 200
        except ValueError as e:
            app.logger.error(f"Failed to parse JSON response: {e}")
            return jsonify({'error': 'Invalid JSON response from Intervals.icu'}), 502
        
    except requests.RequestException as e:
        app.logger.error(f"Request exception in intervals_proxy_wellness: {e}")
        return jsonify({'error': 'Upstream request failed', 'detail': str(e)}), 502
    except Exception as e:
        app.logger.error(f"Unexpected error in intervals_proxy_wellness: {e}", exc_info=True)
        return jsonify({'error': 'Internal server error', 'detail': str(e)}), 500

