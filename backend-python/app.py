from flask import Flask, request, jsonify, redirect, session, url_for
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt, set_access_cookies, unset_jwt_cookies, verify_jwt_in_request
from datetime import datetime, timedelta
import os
import uuid
from functools import wraps
import json
from dotenv import load_dotenv
import requests
import bcrypt
import subprocess
import glob
from pathlib import Path
import warnings
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Import Werkzeug exceptions for error handling
try:
    from werkzeug.exceptions import HTTPException, MethodNotAllowed
except ImportError:
    # Fallback for different Werkzeug versions
    try:
        from werkzeug import HTTPException, MethodNotAllowed
    except ImportError:
        HTTPException = None
        MethodNotAllowed = None

# Suppress eth_utils network chain ID warnings
warnings.filterwarnings('ignore', message=".*Network.*does not have a valid ChainId.*", category=UserWarning, module='eth_utils.network')

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
except ImportError:
    WEB3_AVAILABLE = False
    Web3 = None
    ENS = None
    print("Warning: web3.py not available. Web3 features will be disabled.")

# Google OAuth imports
try:
    from google.oauth2 import id_token
    from google.auth.transport import requests as google_requests
    from google_auth_oauthlib.flow import Flow
    GOOGLE_AUTH_AVAILABLE = True
    print("✓ Google OAuth libraries loaded successfully")
except ImportError:
    GOOGLE_AUTH_AVAILABLE = False
    print("Warning: google-auth not available. Google OAuth will be disabled.")

# Import our new helper modules
try:
    from wallet_auth_helpers import (
        generate_nonce, verify_nonce, consume_nonce, cleanup_expired_nonces,
        verify_wallet_signature, generate_user_id_from_email,
        check_eth_payment_to_isharehow, get_eth_price_usd, 
        calculate_eth_amount_for_usd, check_user_access_level,
        format_signing_message
    )
    from user_access_control import (
        UserTier, DashboardType, get_user_tier, get_dashboard_access,
        can_access_dashboard, get_support_request_limit, start_trial,
        upgrade_tier, get_upgrade_options, PRICING
    )
    WALLET_AUTH_HELPERS_AVAILABLE = True
    print("✓ Wallet auth and user access control modules loaded")
except ImportError as e:
    WALLET_AUTH_HELPERS_AVAILABLE = False
    print(f"Warning: Helper modules not available: {e}")
    print("Wallet authentication features will be limited.")

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
# NOTE: Database is on Render (PostgreSQL). DATABASE_URL must be set.
# Convert postgresql:// to postgresql+psycopg:// for psycopg3 support
database_url = os.environ.get('DATABASE_URL')
if not database_url:
    print("=" * 80)
    print("ERROR: DATABASE_URL environment variable is not set!")
    print("The database is hosted on Render (PostgreSQL).")
    print("Please set DATABASE_URL before starting the application.")
    print("=" * 80)
    raise ValueError("DATABASE_URL environment variable is required")
if database_url.startswith('postgresql://'):
    database_url = database_url.replace('postgresql://', 'postgresql+psycopg://', 1)
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Use engine options for PostgreSQL (Render)
# Database is on Render (PostgreSQL), so we always use PostgreSQL connection options
engine_options = {
    'pool_pre_ping': True,
    'connect_args': {'connect_timeout': 5}
}

app.config['SQLALCHEMY_ENGINE_OPTIONS'] = engine_options

try:
    db = SQLAlchemy(app)
    migrate = Migrate(app, db)
    print(f"✓ SQLAlchemy initialized")
    print(f"  DATABASE_URL: {'Set' if os.environ.get('DATABASE_URL') else 'Not set'}")
    
    # Set DB_AVAILABLE to True - database is configured and ready
    DB_AVAILABLE = True
    print(f"✓ Database configured and ready")
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
     allow_headers=['Content-Type', 'Authorization', 'X-Intervals-API-Key'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'])

# Note: Flask-CORS handles all CORS headers automatically, including OPTIONS preflight
# and error responses. No need for manual header setting which causes duplicate headers.

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

# Database connection check helper
def is_database_connected():
    """Check if database is actually reachable (not just configured)"""
    if not DB_AVAILABLE:
        return False
    try:
        # Try a simple query to test connection
        with db.engine.connect() as conn:
            conn.execute(db.text("SELECT 1"))
        return True
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        error_str = str(e).lower()
        # Check for common database connection errors
        if any(keyword in error_str for keyword in ['connection', 'timeout', 'refused', 'unreachable', 'network', 'operational']):
            return False
        # Other errors might be query-related, not connection issues
        return True

def get_database_error_message(error):
    """Get a user-friendly error message for database errors"""
    error_str = str(error).lower()
    
    # Connection errors
    if any(keyword in error_str for keyword in ['connection', 'timeout', 'refused', 'unreachable', 'network']):
        return {
            'error': 'Database connection failed',
            'message': 'Unable to connect to the database. The database server may be down or unreachable.',
            'details': 'Please check your database connection settings and ensure the database server is running.'
        }
    
    # Operational errors
    if 'operational' in error_str or 'server closed' in error_str:
        return {
            'error': 'Database unavailable',
            'message': 'The database server is not responding. It may be temporarily unavailable.',
            'details': 'Please try again in a few moments or contact support if the issue persists.'
        }
    
    # Generic database error
    if 'database' in error_str or 'db' in error_str:
        return {
            'error': 'Database error',
            'message': 'An error occurred while accessing the database.',
            'details': str(error)
        }
    
    # Unknown error
    return {
        'error': 'Database error',
        'message': str(error),
        'details': 'An unexpected error occurred while accessing the database.'
    }

# ============================================================================
# AUTOMATIC SCRIPT RUNNER - Runs new scripts found in backend directory
# ============================================================================

def get_script_tracking_file():
    """Get the path to the script tracking file"""
    backend_dir = Path(__file__).parent
    return backend_dir / '.executed_scripts.json'

def load_executed_scripts():
    """Load the list of executed scripts from tracking file"""
    tracking_file = get_script_tracking_file()
    if tracking_file.exists():
        try:
            with open(tracking_file, 'r') as f:
                data = json.load(f)
                return set(data.get('executed_scripts', []))
        except (json.JSONDecodeError, IOError) as e:
            db.session.rollback()  # Rollback failed transaction
            print(f"Warning: Could not load script tracking file: {e}")
            return set()
    return set()

def save_executed_script(script_path):
    """Mark a script as executed in the tracking file"""
    tracking_file = get_script_tracking_file()
    executed = load_executed_scripts()
    executed.add(script_path)
    
    try:
        with open(tracking_file, 'w') as f:
            json.dump({'executed_scripts': list(executed)}, f, indent=2)
    except IOError as e:
        db.session.rollback()  # Rollback failed transaction
        print(f"Warning: Could not save script tracking file: {e}")

def find_runnable_scripts():
    """Find all Python scripts in the backend directory that should be auto-run"""
    backend_dir = Path(__file__).parent
    scripts = []
    
    # Files to exclude from auto-execution
    excluded_files = {
        'app.py',  # Main application file
        'verify_members.py',  # Scheduled cron job, not a one-time script
        'intervals_icu.py',  # Library module, not a script
        'add_trial_start_date_column.py',  # Already handled by migration/auto-script
    }
    
    # Directories to exclude
    excluded_dirs = {
        '__pycache__',
        'migrations',
        'instance',
        'game_content',
    }
    
    # Find all .py files in the backend directory
    for py_file in backend_dir.glob('*.py'):
        if py_file.name not in excluded_files:
            scripts.append(py_file)
    
    return scripts

def is_script_runnable(script_path):
    """Check if a script looks like it should be auto-run"""
    try:
        with open(script_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
            # Skip if it's a library module (has class/function definitions but no main execution)
            # Look for common patterns that indicate it's a runnable script
            has_main_block = 'if __name__' in content and '__main__' in content
            has_shebang = content.startswith('#!/')
            has_executable_content = 'def main(' in content or 'if __name__' in content
            
            # If it has a main block or shebang, it's likely a runnable script
            # Also check if it imports app/db (migration scripts often do)
            imports_app = 'from app import' in content or 'import app' in content
            
            return has_main_block or has_shebang or (has_executable_content and imports_app)
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f"Warning: Could not read script {script_path}: {e}")
        return False
    
    return False

def run_script_safely(script_path):
    """Run a script safely with error handling"""
    script_name = script_path.name
    print(f"\n{'='*80}")
    print(f"Running new script: {script_name}")
    print(f"{'='*80}")
    
    try:
        # Run the script using subprocess
        result = subprocess.run(
            ['python3', str(script_path)],
            cwd=str(script_path.parent),
            capture_output=True,
            text=True,
            timeout=300,  # 5 minute timeout
            env=os.environ.copy()
        )
        
        if result.returncode == 0:
            print(f"✓ Script {script_name} executed successfully")
            if result.stdout:
                print(f"Output:\n{result.stdout}")
            return True
        else:
            print(f"✗ Script {script_name} failed with return code {result.returncode}")
            if result.stderr:
                print(f"Error output:\n{result.stderr}")
            if result.stdout:
                print(f"Standard output:\n{result.stdout}")
            return False
            
    except subprocess.TimeoutExpired:
        print(f"✗ Script {script_name} timed out after 5 minutes")
        return False
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f"✗ Error running script {script_name}: {e}")
        return False

def run_new_scripts_at_startup():
    """Scan for new scripts and run them automatically"""
    print("\n" + "="*80)
    print("AUTOMATIC SCRIPT RUNNER - Checking for new scripts...")
    print("="*80)
    
    # Check if auto-run is disabled via environment variable
    if os.environ.get('DISABLE_AUTO_SCRIPT_RUN', '').lower() in ('true', '1', 'yes'):
        print("Auto-script execution is disabled (DISABLE_AUTO_SCRIPT_RUN is set)")
        return
    
    executed_scripts = load_executed_scripts()
    all_scripts = find_runnable_scripts()
    
    new_scripts = []
    for script in all_scripts:
        script_path = str(script)
        if script_path not in executed_scripts:
            if is_script_runnable(script):
                new_scripts.append(script)
    
    if not new_scripts:
        print("No new scripts found to execute.")
        return
    
    print(f"Found {len(new_scripts)} new script(s) to execute:")
    for script in new_scripts:
        print(f"  - {script.name}")
    
    # Run each new script
    for script in new_scripts:
        script_path = str(script)
        success = run_script_safely(script)
        
        # Mark as executed regardless of success/failure to avoid retrying failed scripts
        # (You can manually remove from .executed_scripts.json if you want to retry)
        save_executed_script(script_path)
        
        if not success:
            print(f"Warning: Script {script.name} failed, but marked as executed.")
            print("  To retry, remove it from .executed_scripts.json")
    
    print("="*80 + "\n")

# Web3/ENS Configuration - UPDATED TO USE ALCHEMY
ENS_DOMAIN = 'isharehow.eth'  # Your ENS domain
ALCHEMY_API_KEY = os.environ.get('ALCHEMY_API_KEY', '')
ALCHEMY_NETWORK = os.environ.get('ALCHEMY_NETWORK', 'eth-mainnet')

# Build Alchemy provider URL
if ALCHEMY_API_KEY:
    WEB3_PROVIDER_URL = f'https://{ALCHEMY_NETWORK}.g.alchemy.com/v2/{ALCHEMY_API_KEY}'
else:
    # Fallback to Infura if Alchemy not configured
    WEB3_PROVIDER_URL = os.environ.get('ENS_PROVIDER_URL', 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY')

ENS_PRIVATE_KEY = os.environ.get('ENS_PRIVATE_KEY')  # For setting records (optional)
ISHAREHOW_ETH_ADDRESS = os.environ.get('ISHAREHOW_ETH_ADDRESS', '0x0000000000000000000000000000000000000000')

# Google OAuth Configuration
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET', '')
GOOGLE_REDIRECT_URI = os.environ.get('GOOGLE_REDIRECT_URI', 'https://api.ventures.isharehow.app/api/auth/google/callback')

# Initialize Web3 and ENS if available
w3 = None
ens = None
if WEB3_AVAILABLE:
    try:
        # Connect to Ethereum mainnet via Alchemy or Infura
        w3 = Web3(Web3.HTTPProvider(WEB3_PROVIDER_URL))
        if w3.is_connected():
            ens = ENS.from_web3(w3)
            provider_name = "Alchemy" if ALCHEMY_API_KEY else "Infura"
            print(f"✓ Web3 connected to Ethereum mainnet via {provider_name}")
            print(f"✓ ENS module initialized for domain: {ENS_DOMAIN}")
            print(f"✓ isharehow.eth address: {ISHAREHOW_ETH_ADDRESS}")
        else:
            print("Warning: Web3 connection failed. ENS features will be limited.")
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
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
        db.session.rollback()  # Rollback failed transaction
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
        db.session.rollback()  # Rollback failed transaction
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
        db.session.rollback()  # Rollback failed transaction
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
        category = db.Column(db.String(50), nullable=True, default='work')  # work, creative, wellness, rise
        support_request_id = db.Column(db.String(36), db.ForeignKey('support_requests.id'), nullable=True, index=True)  # Link to support request (deprecated, use linked_entity_type/id)
        
        # Polymorphic linking fields - allows tasks to link to any entity type
        linked_entity_type = db.Column(db.String(50), nullable=True, index=True)  # venture, client, employee, rise_journey, rise_journal, support_request
        linked_entity_id = db.Column(db.String(100), nullable=True, index=True)  # ID of the linked entity
        
        # User assignment fields
        created_by = db.Column(db.String(100), nullable=True)  # User ID who created the task
        created_by_name = db.Column(db.String(200), nullable=True)  # Display name of creator
        assigned_to = db.Column(db.String(100), nullable=True)  # User ID assigned to the task
        assigned_to_name = db.Column(db.String(200), nullable=True)  # Display name of assigned user
        notes = db.Column(db.Text, nullable=True)  # Collaborative notes
        created_at = db.Column(db.DateTime, default=datetime.utcnow)
        updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

        def to_dict(self):
            # Safely access new columns that might not exist yet
            category = getattr(self, 'category', None) or 'work' if hasattr(self, 'category') else 'work'
            linked_entity_type = getattr(self, 'linked_entity_type', None) if hasattr(self, 'linked_entity_type') else None
            linked_entity_id = getattr(self, 'linked_entity_id', None) if hasattr(self, 'linked_entity_id') else None
            
            # If new polymorphic fields are not set but support_request_id is, use that for backward compatibility
            if not linked_entity_type and not linked_entity_id and self.support_request_id:
                linked_entity_type = 'support_request'
                linked_entity_id = self.support_request_id
            
            return {
                'id': self.id,
                'title': self.title,
                'description': self.description,
                'hyperlinks': json.loads(self.hyperlinks) if self.hyperlinks else [],
                'status': self.status,
                'category': category,
                'supportRequestId': self.support_request_id,  # Keep for backward compatibility
                'linkedEntityType': linked_entity_type,
                'linkedEntityId': linked_entity_id,
                'createdBy': self.created_by,
                'createdByName': self.created_by_name,
                'assignedTo': self.assigned_to,
                'assignedToName': self.assigned_to_name,
                'notes': self.notes or '',
                'createdAt': self.created_at.isoformat() if self.created_at else None,
                'updatedAt': self.updated_at.isoformat() if self.updated_at else None
            }

    # Authentication User Model
    class User(db.Model):
        __tablename__ = 'users'
        
        id = db.Column(db.Integer, primary_key=True)
        username = db.Column(db.String(80), unique=True, nullable=True, index=True)
        email = db.Column(db.String(120), unique=True, nullable=True, index=True)
        password_hash = db.Column(db.String(255), nullable=True)
        # Deprecated Patreon fields (kept for migration compatibility, will be removed)
        patreon_id = db.Column(db.String(50), unique=True, nullable=True, index=True)  # DEPRECATED
        access_token = db.Column(db.String(500), nullable=True)  # DEPRECATED
        refresh_token = db.Column(db.String(500), nullable=True)  # DEPRECATED
        patreon_connected = db.Column(db.Boolean, default=False, nullable=False)  # DEPRECATED
        token_expires_at = db.Column(db.DateTime, nullable=True)  # DEPRECATED
        # Shopify/Bold Subscriptions fields
        has_subscription_update = db.Column(db.Boolean, default=False, nullable=False)  # Has member updated their subscription?
        subscription_update_active = db.Column(db.Boolean, default=False, nullable=False)  # Is subscription update active?
        shopify_customer_id = db.Column(db.String(50), nullable=True, index=True)  # Shopify customer ID
        bold_subscription_id = db.Column(db.String(50), nullable=True, index=True)  # Bold Subscriptions subscription ID
        membership_paid = db.Column(db.Boolean, default=False, nullable=False)  # Active subscription status
        is_employee = db.Column(db.Boolean, default=False, nullable=False, index=True)  # Employee flag for Creative Dashboard
        is_admin = db.Column(db.Boolean, default=False, nullable=False, index=True)  # Admin flag for system administration
        last_checked = db.Column(db.DateTime, nullable=True)  # Last subscription check
        # OAuth and Auth Provider fields
        google_id = db.Column(db.String(100), unique=True, nullable=True, index=True)  # Google OAuth ID
        auth_provider = db.Column(db.String(20), default='email', nullable=False)  # 'email', 'google', 'wallet'
        # Web3/ENS fields
        ens_name = db.Column(db.String(255), unique=True, nullable=True, index=True)  # e.g., "isharehow.isharehow.eth"
        crypto_address = db.Column(db.String(42), nullable=True, index=True)  # Ethereum address (0x...)
        content_hash = db.Column(db.String(255), nullable=True)  # IPFS content hash
        # ETH payment verification fields
        eth_payment_verified = db.Column(db.Boolean, default=False, nullable=False)
        eth_payment_amount = db.Column(db.Numeric(18, 8), nullable=True)
        eth_payment_tx_hash = db.Column(db.String(66), nullable=True, index=True)
        eth_payment_date = db.Column(db.DateTime, nullable=True)
        trial_start_date = db.Column(db.DateTime, nullable=True)
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
            # Use ENS name as ID if available, otherwise fall back to username or email-based ID, or numeric id
            user_id = self.ens_name or self.username or (self.email.split('@')[0] if self.email else None) or str(self.id)
            return {
                'id': user_id,
                'userId': str(self.id),  # Always include numeric ID
                'ensName': self.ens_name,  # Web3 domain: username.isharehow.eth
                'cryptoAddress': self.crypto_address,  # Ethereum address
                'contentHash': self.content_hash,  # IPFS content hash
                'username': self.username,
                'email': self.email,
                'membershipPaid': self.membership_paid,
                'isPaidMember': self.membership_paid,  # Alias for consistency
                'isEmployee': self.is_employee,
                'isAdmin': self.is_admin,
                'hasSubscriptionUpdate': self.has_subscription_update,
                'subscriptionUpdateActive': self.subscription_update_active,
                'shopifyCustomerId': self.shopify_customer_id,
                'boldSubscriptionId': self.bold_subscription_id,
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
            db.session.rollback()  # Rollback failed transaction
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
                # Ensure SHOPIFY_STORE_URL includes the GraphQL endpoint
                graphql_url = SHOPIFY_STORE_URL
                if not graphql_url.endswith('/graphql.json'):
                        # Check if /admin/api/ is already in the URL to avoid duplication
                        if '/admin/api/' in graphql_url:
                                # URL already contains /admin/api/, just append /graphql.json
                                graphql_url = f"{graphql_url.rstrip('/')}/graphql.json"
                        elif 'myshopify.com' in graphql_url:
                                # Clean domain and add full path
                                graphql_url = f"https://{graphql_url.replace('https://', '').replace('http://', '')}/admin/api/{SHOPIFY_API_VERSION}/graphql.json"
                        else:
                                # Add full admin API path
                                graphql_url = f"{graphql_url.rstrip('/')}/admin/api/{SHOPIFY_API_VERSION}/graphql.json"
                
                resp = requests.post(
                        graphql_url,
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
                db.session.rollback()  # Rollback failed transaction
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

PRODUCT_BY_HANDLE_QUERY = '''
    query getProductByHandle($handle: String!) {
        product(handle: $handle) {
            id
            title
            handle
            description
            descriptionHtml
            media(first: 10) {
                edges {
                    node {
                        ... on MediaImage {
                            image {
                                url
                                altText
                            }
                        }
                    }
                }
            }
            variants(first: 1) {
                edges {
                    node {
                        price
                        compareAtPrice
                    }
                }
            }
            priceRange {
                minVariantPrice {
                    amount
                    currencyCode
                }
                maxVariantPrice {
                    amount
                    currencyCode
                }
            }
        }
    }
'''

@app.route('/api/products/<handle>', methods=['GET'])
def api_product_by_handle(handle):
        """Get a specific product by its handle"""
        variables = {'handle': handle}
        data, error = shopify_graphql(PRODUCT_BY_HANDLE_QUERY, variables)
        if error:
                return jsonify(error), 500
        if not data or 'product' not in data or not data['product']:
                return jsonify({'error': 'Product not found'}), 404
        
        product = data['product']
        media_images = []
        if product.get('media') and product['media'].get('edges'):
                for edge in product['media']['edges']:
                        if edge['node'].get('image'):
                                media_images.append({
                                        'url': edge['node']['image']['url'],
                                        'altText': edge['node']['image'].get('altText')
                                })
        
        price = '0.00'
        if product.get('variants') and product['variants'].get('edges'):
                price = product['variants']['edges'][0]['node']['price']
        
        return jsonify({
                'id': product['id'],
                'title': product['title'],
                'handle': product['handle'],
                'description': product.get('description', ''),
                'descriptionHtml': product.get('descriptionHtml', ''),
                'images': media_images,
                'price': price,
                'priceRange': product.get('priceRange', {})
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

# Shopify Customers Query for CRM
CUSTOMERS_QUERY = '''
    query getCustomers($first: Int!, $after: String) {
        customers(first: $first, after: $after, sortKey: CREATED_AT, reverse: true) {
            edges {
                node {
                    id
                    email
                    firstName
                    lastName
                    phone
                    totalSpent {
                        amount
                        currencyCode
                    }
                    ordersCount
                    createdAt
                    tags
                }
            }
            pageInfo { hasNextPage endCursor }
        }
    }
'''

# Shopify Analytics Query for Orders and Revenue
ORDERS_ANALYTICS_QUERY = '''
    query getOrdersAnalytics($first: Int!, $after: String, $query: String) {
        orders(first: $first, after: $after, query: $query, sortKey: CREATED_AT, reverse: true) {
            edges {
                node {
                    id
                    name
                    createdAt
                    totalPriceSet {
                        shopMoney {
                            amount
                            currencyCode
                        }
                    }
                    financialStatus
                    fulfillmentStatus
                    customer {
                        id
                        email
                    }
                }
            }
            pageInfo { hasNextPage endCursor }
        }
    }
'''

@app.route('/api/shopify/customers', methods=['GET'])
@jwt_required(optional=True)
def api_shopify_customers():
    """Fetch Shopify customers for CRM dashboard"""
    try:
        # Check if Shopify is configured
        if not SHOPIFY_STORE_URL or not SHOPIFY_ACCESS_TOKEN:
            return jsonify({
                'error': 'Shopify not configured',
                'message': 'SHOPIFY_STORE_URL and SHOPIFY_ACCESS_TOKEN must be set',
                'customers': []
            }), 200
        
        first = int(request.args.get('first', 50))
        after = request.args.get('after')
        variables = {'first': first, 'after': after}
        
        data, error = shopify_graphql(CUSTOMERS_QUERY, variables)
        if error:
            return jsonify({
                'error': error.get('error', 'Shopify API error'),
                'message': error.get('message', 'Failed to fetch from Shopify'),
                'customers': []
            }), 200
        
        if not data or 'customers' not in data or 'edges' not in data['customers']:
            return jsonify({'error': 'Invalid response from Shopify API', 'customers': []}), 200
        
        customers = []
        for edge in data['customers']['edges']:
            node = edge['node']
            total_spent = float(node.get('totalSpent', {}).get('amount', 0)) if node.get('totalSpent') else 0
            customers.append({
                'id': node['id'],
                'email': node.get('email', ''),
                'firstName': node.get('firstName'),
                'lastName': node.get('lastName'),
                'phone': node.get('phone'),
                'totalSpent': total_spent,
                'ordersCount': node.get('ordersCount', 0),
                'createdAt': node.get('createdAt'),
                'tags': node.get('tags', []),
            })
        
        return jsonify({
            'customers': customers,
            'pageInfo': data['customers']['pageInfo']
        })
    except Exception as e:
        print(f"Error fetching Shopify customers: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to fetch customers', 'message': str(e), 'customers': []}), 200

@app.route('/api/shopify/store-url', methods=['GET'])
@jwt_required(optional=True)
def get_shopify_store_url():
    """Get Shopify store URL for customer portal"""
    try:
        if not SHOPIFY_STORE_URL:
            return jsonify({'error': 'Shopify store URL not configured'}), 503
        
        # Extract base store URL (remove /admin/api/... if present)
        store_url = SHOPIFY_STORE_URL
        if '/admin/api/' in store_url:
            store_url = store_url.split('/admin/api/')[0]
        
        # Ensure it's a full URL
        if not store_url.startswith('http'):
            # If it's just a domain, add https://
            if 'myshopify.com' in store_url:
                store_url = f"https://{store_url.replace('https://', '').replace('http://', '')}"
            else:
                store_url = f"https://{store_url}"
        
        return jsonify({'storeUrl': store_url}), 200
    except Exception as e:
        print(f"Error getting Shopify store URL: {e}")
        return jsonify({'error': 'Failed to get store URL'}), 500

@app.route('/api/shopify/analytics', methods=['GET'])
@jwt_required(optional=True)
def api_shopify_analytics():
    """Fetch Shopify analytics data (orders, revenue) for CRM dashboard"""
    try:
        # Check if Shopify is configured
        if not SHOPIFY_STORE_URL or not SHOPIFY_ACCESS_TOKEN:
            return jsonify({
                'error': 'Shopify not configured',
                'message': 'SHOPIFY_STORE_URL and SHOPIFY_ACCESS_TOKEN must be set',
                'analytics': {
                    'totalRevenue': 0,
                    'totalOrders': 0,
                    'averageOrderValue': 0,
                    'ordersByDay': [],
                    'revenueByDay': []
                }
            }), 200
        
        # Get time period filter (default: last 30 days)
        days = int(request.args.get('days', 30))
        created_at_filter = f"created_at:>={datetime.utcnow() - timedelta(days=days)}"
        
        first = 250  # Shopify allows up to 250 per page
        variables = {'first': first, 'after': None, 'query': created_at_filter}
        
        all_orders = []
        has_next_page = True
        cursor = None
        
        # Paginate through all orders
        while has_next_page:
            if cursor:
                variables['after'] = cursor
            else:
                variables.pop('after', None)
            
            data, error = shopify_graphql(ORDERS_ANALYTICS_QUERY, variables)
            if error:
                break
            
            if not data or 'orders' not in data or 'edges' not in data['orders']:
                break
            
            for edge in data['orders']['edges']:
                node = edge['node']
                total_amount = float(node.get('totalPriceSet', {}).get('shopMoney', {}).get('amount', 0)) if node.get('totalPriceSet') else 0
                all_orders.append({
                    'id': node['id'],
                    'name': node.get('name', ''),
                    'createdAt': node.get('createdAt'),
                    'totalPrice': total_amount,
                    'currencyCode': node.get('totalPriceSet', {}).get('shopMoney', {}).get('currencyCode', 'USD'),
                    'financialStatus': node.get('financialStatus'),
                    'fulfillmentStatus': node.get('fulfillmentStatus'),
                    'customerId': node.get('customer', {}).get('id') if node.get('customer') else None,
                    'customerEmail': node.get('customer', {}).get('email') if node.get('customer') else None,
                })
            
            page_info = data['orders']['pageInfo']
            has_next_page = page_info.get('hasNextPage', False)
            cursor = page_info.get('endCursor')
        
        # Calculate analytics
        total_revenue = sum(order['totalPrice'] for order in all_orders)
        total_orders = len(all_orders)
        average_order_value = total_revenue / total_orders if total_orders > 0 else 0
        
        # Group orders by day
        orders_by_day = {}
        revenue_by_day = {}
        
        for order in all_orders:
            if order['createdAt']:
                try:
                    order_date = datetime.fromisoformat(order['createdAt'].replace('Z', '+00:00'))
                    day_key = order_date.strftime('%Y-%m-%d')
                    orders_by_day[day_key] = orders_by_day.get(day_key, 0) + 1
                    revenue_by_day[day_key] = revenue_by_day.get(day_key, 0) + order['totalPrice']
                except:
                    pass
        
        # Convert to arrays for charting
        orders_by_day_array = [{'date': k, 'count': v} for k, v in sorted(orders_by_day.items())]
        revenue_by_day_array = [{'date': k, 'revenue': v} for k, v in sorted(revenue_by_day.items())]
        
        return jsonify({
            'analytics': {
                'totalRevenue': total_revenue,
                'totalOrders': total_orders,
                'averageOrderValue': average_order_value,
                'ordersByDay': orders_by_day_array,
                'revenueByDay': revenue_by_day_array,
                'orders': all_orders[:100]  # Return first 100 orders for display
            }
        })
    except Exception as e:
        print(f"Error fetching Shopify analytics: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': 'Failed to fetch analytics',
            'message': str(e),
            'analytics': {
                'totalRevenue': 0,
                'totalOrders': 0,
                'averageOrderValue': 0,
                'ordersByDay': [],
                'revenueByDay': []
            }
        }), 200

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
                    # Use email-based ID or username or numeric ID
                    return user.email.split('@')[0] if user.email else (user.username or str(user.id))
            return str(user_id)
    except Exception:
        db.session.rollback()  # Rollback failed transaction
        pass
    return 'anonymous'

def safe_get_user(user_id):
    """Get user by ID - handles missing columns gracefully"""
    if not user_id or not DB_AVAILABLE:
        return None
    
    # Try normal SQLAlchemy query first
    try:
        user = None
        if str(user_id).isdigit():
            user = User.query.get(int(user_id))
        if not user:
            user = User.query.filter_by(username=str(user_id)).first()
        if not user:
            user = User.query.filter_by(patreon_id=str(user_id)).first()
        if not user:
            user = User.query.filter_by(ens_name=str(user_id)).first()
        if not user:
            user = User.query.filter_by(email=str(user_id)).first()
        
        return user
    except Exception as query_error:
        # Rollback failed transaction immediately
        db.session.rollback()
        error_str = str(query_error).lower()
        # Check if error is due to missing columns
        if 'column' in error_str and ('has_subscription_update' in error_str or 'is_employee' in error_str or 'google_id' in error_str):
            print(f"Warning: Missing column when querying user {user_id}, attempting to add missing columns...")
            
            # Try to add missing columns immediately
            try:
                with db.engine.connect() as conn:
                    with conn.begin():
                        # Check and add missing columns
                        from sqlalchemy import inspect
                        inspector = inspect(conn)
                        existing_columns = {col['name'] for col in inspector.get_columns('users')}
                        
                        missing_columns = []
                        if 'has_subscription_update' not in existing_columns:
                            missing_columns.append(('has_subscription_update', 'BOOLEAN', 'FALSE'))
                        if 'subscription_update_active' not in existing_columns:
                            missing_columns.append(('subscription_update_active', 'BOOLEAN', 'FALSE'))
                        if 'shopify_customer_id' not in existing_columns:
                            missing_columns.append(('shopify_customer_id', 'VARCHAR(50)', 'NULL'))
                        if 'bold_subscription_id' not in existing_columns:
                            missing_columns.append(('bold_subscription_id', 'VARCHAR(50)', 'NULL'))
                        if 'is_employee' not in existing_columns:
                            missing_columns.append(('is_employee', 'BOOLEAN', 'FALSE'))
                        if 'is_admin' not in existing_columns:
                            missing_columns.append(('is_admin', 'BOOLEAN', 'FALSE'))
                        if 'google_id' not in existing_columns:
                            missing_columns.append(('google_id', 'VARCHAR(100)', 'NULL'))
                        if 'auth_provider' not in existing_columns:
                            missing_columns.append(('auth_provider', 'VARCHAR(20)', "'email'"))
                        
                        for col_name, col_type, default in missing_columns:
                            try:
                                if col_type == 'BOOLEAN':
                                    sql = f"ALTER TABLE users ADD COLUMN {col_name} BOOLEAN NOT NULL DEFAULT FALSE"
                                elif col_type.startswith('VARCHAR'):
                                    if default == 'NULL':
                                        sql = f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"
                                    else:
                                        sql = f"ALTER TABLE users ADD COLUMN {col_name} {col_type} NOT NULL DEFAULT {default}"
                                else:
                                    sql = f"ALTER TABLE users ADD COLUMN {col_name} {col_type} DEFAULT {default}"
                                
                                conn.execute(db.text(sql))
                                
                                # Create index for google_id if it was added
                                if col_name == 'google_id':
                                    try:
                                        conn.execute(db.text("CREATE UNIQUE INDEX ix_users_google_id ON users (google_id)"))
                                    except Exception:
                                        db.session.rollback()  # Rollback failed transaction
                                        pass  # Index might already exist
                                
                                print(f"  ✓ Added missing column: {col_name}")
                            except Exception as col_error:
                                db.session.rollback()  # Rollback failed transaction
                                error_msg = str(col_error).lower()
                                if 'already exists' in error_msg or 'duplicate' in error_msg:
                                    print(f"  ✓ Column {col_name} already exists")
                                else:
                                    print(f"  ✗ Could not add {col_name}: {col_error}")
                
                # Retry the query after adding columns
                if str(user_id).isdigit():
                    user = User.query.get(int(user_id))
                if not user:
                    user = User.query.filter_by(username=str(user_id)).first()
                if not user:
                    user = User.query.filter_by(patreon_id=str(user_id)).first()
                if not user:
                    user = User.query.filter_by(ens_name=str(user_id)).first()
                if not user:
                    user = User.query.filter_by(email=str(user_id)).first()
                
                return user
            except Exception as add_error:
                db.session.rollback()  # Rollback failed transaction
                print(f"Error adding missing columns: {add_error}")
                # Fall through to raw SQL fallback
        
        # Fallback to raw SQL if columns still missing
        try:
            with db.engine.connect() as conn:
                try:
                    user_id_int = int(user_id)
                    id_condition = "id = CAST(:user_id_int AS INTEGER)"
                    params = {'user_id': str(user_id), 'user_id_int': user_id_int}
                except (ValueError, TypeError):
                    db.session.rollback()  # Rollback failed transaction
                    id_condition = "FALSE"
                    params = {'user_id': str(user_id)}
                
                result = conn.execute(db.text(f"""
                    SELECT id, username, email, password_hash, membership_paid,
                           last_checked, created_at, updated_at
                    FROM users 
                    WHERE ({id_condition} OR username = :user_id OR patreon_id = :user_id OR ens_name = :user_id OR email = :user_id)
                    LIMIT 1
                """), params)
                row = result.fetchone()
                if row:
                    from types import SimpleNamespace
                    user = SimpleNamespace(
                        id=row[0],
                        username=row[1],
                        email=row[2],
                        password_hash=row[3],
                        membership_paid=row[4],
                        last_checked=row[5],
                        created_at=row[6],
                        updated_at=row[7]
                    )
                    return user
        except Exception as raw_error:
            db.session.rollback()  # Rollback failed transaction
            print(f"Error in raw SQL fallback: {raw_error}")
            return None
        
        # If all else fails, re-raise the original error
        raise

def get_current_user():
    """Get current user from JWT token"""
    try:
        user_id = get_jwt_identity()
        if not user_id:
            return None
        return safe_get_user(user_id)
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
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

def login_required(f):
    """Decorator to require authenticated user (JWT required)"""
    @wraps(f)
    @jwt_required()
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
                db.session.rollback()  # Rollback failed transaction
                app.logger.error(f"Error sending push to subscription {subscription.id}: {e}")
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
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
        db.session.rollback()  # Rollback failed transaction
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
        db.session.rollback()  # Rollback failed transaction
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
        db.session.rollback()  # Rollback failed transaction
        # Column doesn't exist in database yet
        pass
    return False

def get_user_info():
    """Get user info from JWT token including id and role"""
    user = get_current_user()
    if not user:
        return None
    # Use email-based ID or username or numeric ID
    user_id_str = user.email.split('@')[0] if user.email else (user.username or str(user.id))
    return {
        'id': user_id_str,
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
            db.session.rollback()  # Rollback failed transaction
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
            db.session.rollback()  # Rollback failed transaction
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
            db.session.rollback()  # Rollback failed transaction
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
                    db.session.rollback()  # Rollback failed transaction
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
                        db.session.rollback()  # Rollback failed transaction
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
                        db.session.rollback()  # Rollback failed transaction
                        pass  # Silent fail for sync
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
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
            db.session.rollback()  # Rollback failed transaction
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
                    db.session.rollback()  # Rollback failed transaction
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
                        db.session.rollback()  # Rollback failed transaction
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
                        db.session.rollback()  # Rollback failed transaction
                        pass  # Silent fail for sync
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
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
                db.session.rollback()  # Rollback failed transaction
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
                            db.session.rollback()  # Rollback failed transaction
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
                                db.session.rollback()  # Rollback failed transaction
                                print(f'Error processing file: {e}')
                                continue
                except Exception as e:
                    db.session.rollback()  # Rollback failed transaction
                    print(f'Error fetching files for project {project.get("id")}: {e}')
                    continue
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
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
        db.session.rollback()  # Rollback failed transaction
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
    # Handle HTTP exceptions for API routes
    if HTTPException and isinstance(e, HTTPException):
        if request.path.startswith('/api/'):
            # Special handling for 405 Method Not Allowed
            if (MethodNotAllowed and isinstance(e, MethodNotAllowed)) or (hasattr(e, 'code') and e.code == 405):
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
@app.route('/api/auth/register', methods=['POST', 'OPTIONS'])
def register():
    """Register a new user with username and password"""
    # Handle OPTIONS preflight request
    if request.method == 'OPTIONS':
        return '', 200
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
                db.session.rollback()  # Rollback failed transaction
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
            db.session.rollback()  # Rollback failed transaction
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
            db.session.rollback()  # Rollback failed transaction
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
        db.session.rollback()  # Rollback failed transaction
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

@app.route('/api/auth/login', methods=['POST', 'OPTIONS'])
def login():
    """Login with username/email and password"""
    # Handle OPTIONS preflight request
    if request.method == 'OPTIONS':
        return '', 200
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
                db.session.rollback()  # Rollback failed transaction
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
            db.session.rollback()  # Rollback failed transaction
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
                    db.session.rollback()  # Rollback failed transaction
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
        db.session.rollback()  # Rollback failed transaction
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

# --- REMOVED: Patreon verification endpoint ---
# Replaced with Shopify subscription verification

@app.route('/api/subscriptions/verify', methods=['POST'])
@jwt_required()
def verify_subscription():
    """Verify Shopify Bold subscription and ETH payment status for user"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 500
    
    try:
        # Get user from JWT token
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Find user by ID
        user = None
        if isinstance(user_id, int) or (isinstance(user_id, str) and user_id.isdigit()):
            user = User.query.get(int(user_id))
        if not user:
            user = User.query.filter_by(username=str(user_id)).first()
        if not user:
            user = User.query.filter_by(email=str(user_id)).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check Shopify Bold subscription status
        has_shopify_subscription = (
            bool(user.bold_subscription_id) or
            user.subscription_update_active or
            user.membership_paid
        )
        
        # Check ETH payment ($20 minimum to isharehow.eth)
        has_eth_payment = False
        eth_payment_amount = 0
        if user.eth_payment_verified and user.eth_payment_amount:
            try:
                eth_payment_amount = float(user.eth_payment_amount)
                # Check if payment is at least $20 USD
                # Note: eth_payment_amount is stored in ETH, we need to check USD value
                # For now, we'll check if eth_payment_verified is True and amount exists
                # The actual USD conversion should be done when payment is verified
                has_eth_payment = user.eth_payment_verified and eth_payment_amount > 0
            except (ValueError, TypeError):
                has_eth_payment = False
        
        # User is a paid member if they have either Shopify subscription OR ETH payment
        has_active_membership = has_shopify_subscription or has_eth_payment
        
        # Update user membership status
        user.membership_paid = has_active_membership
        user.last_checked = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Subscription status verified',
            'membershipPaid': has_active_membership,
            'shopifySubscription': {
                'active': has_shopify_subscription,
                'boldSubscriptionId': user.bold_subscription_id,
                'shopifyCustomerId': user.shopify_customer_id,
            },
            'ethPayment': {
                'verified': has_eth_payment,
                'amount': str(eth_payment_amount) if eth_payment_amount else None,
                'txHash': user.eth_payment_tx_hash,
                'date': user.eth_payment_date.isoformat() if user.eth_payment_date else None,
            },
            'user': user.to_dict()
        })
        
    except Exception as e:
        print(f"Error verifying subscription: {e}")
        app.logger.error(f"Error in verify_subscription: {e}")
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/hyperbeam/create-session', methods=['POST'])
@jwt_required(optional=True)
def create_hyperbeam_session():
    """Create a new Hyperbeam VM session"""
    # Flask-CORS handles OPTIONS preflight automatically
    try:
        # Get Hyperbeam API key from environment (check both uppercase and lowercase)
        hyperbeam_key = os.environ.get('HYPERBEAM_KEY') or os.environ.get('hyperbeam_key')
        if not hyperbeam_key:
            return jsonify({'error': 'Hyperbeam API key not configured. Please set HYPERBEAM_KEY or hyperbeam_key in environment variables.'}), 500
        
        # Get parent domain from request (for iframe embedding)
        parent_domain = request.json.get('parent') if request.json else None
        if not parent_domain:
            # Try to get from referer header
            referer = request.headers.get('Referer', '')
            if referer:
                from urllib.parse import urlparse
                parsed = urlparse(referer)
                parent_domain = parsed.hostname
        
        # Make request to Hyperbeam API to create VM
        headers = {
            'Authorization': f'Bearer {hyperbeam_key}',
            'Content-Type': 'application/json'
        }
        
        # Optional: Add parent domain to request if provided
        payload = {}
        if parent_domain:
            payload['parent'] = parent_domain
        
        response = requests.post(
            'https://engine.hyperbeam.com/v0/vm',
            headers=headers,
            json=payload,
            timeout=30
        )
        
        if response.status_code != 200:
            app.logger.error(f"Hyperbeam API error: {response.status_code} - {response.text}")
            return jsonify({
                'error': 'Failed to create Hyperbeam session',
                'details': response.text
            }), response.status_code
        
        data = response.json()
        
        # Extract session URL from response
        # Hyperbeam API typically returns: { "embed_url": "...", "session_id": "...", etc. }
        embed_url = data.get('embed_url') or data.get('url') or data.get('session_url')
        session_id = data.get('session_id') or data.get('id')
        
        if not embed_url:
            return jsonify({
                'error': 'Invalid response from Hyperbeam API',
                'response': data
            }), 500
        
        # Add parent parameter to URL if provided
        if parent_domain and 'parent=' not in embed_url:
            separator = '&' if '?' in embed_url else '?'
            embed_url = f"{embed_url}{separator}parent={parent_domain}"
        
        return jsonify({
            'success': True,
            'embedUrl': embed_url,
            'sessionId': session_id,
            'data': data
        })
        
    except requests.exceptions.RequestException as e:
        app.logger.error(f"Hyperbeam API request error: {e}")
        return jsonify({
            'error': 'Failed to connect to Hyperbeam API',
            'details': str(e)
        }), 500
    except Exception as e:
        app.logger.error(f"Error creating Hyperbeam session: {e}")
        return jsonify({
            'error': 'Internal server error',
            'details': str(e)
        }), 500

@app.route('/api/auth/me', methods=['GET', 'OPTIONS'])
@jwt_required(optional=True)
def auth_me():
    """Get current authenticated user info - optimized for speed"""
    # Handle OPTIONS preflight request
    if request.method == 'OPTIONS':
        return '', 200
    
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
            db.session.rollback()  # Rollback failed transaction
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
                db.session.rollback()  # Rollback failed transaction
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
                    # Try to convert user_id to integer for id comparison, but keep as string for username/patreon_id
                    try:
                        user_id_int = int(user_id)
                        id_condition = "id = :user_id_int"
                        params = {'user_id': user_id, 'user_id_int': user_id_int}
                    except (ValueError, TypeError):
                        db.session.rollback()  # Rollback failed transaction
                        # If user_id is not numeric, only check username and patreon_id
                        id_condition = "FALSE"
                        params = {'user_id': user_id}
                    
                    result = conn.execute(db.text(f"""
                        SELECT id, username, email, password_hash, patreon_id, 
                               access_token, refresh_token, membership_paid,
                               last_checked, token_expires_at, patreon_connected,
                               created_at, updated_at
                        FROM users 
                        WHERE ({id_condition} OR username = :user_id OR patreon_id = :user_id)
                        LIMIT 1
                    """), params)
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
                db.session.rollback()  # Rollback failed transaction
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
            db.session.rollback()  # Rollback failed transaction
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
            db.session.rollback()  # Rollback failed transaction
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
        db.session.rollback()  # Rollback failed transaction
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


# ============================================================================
# WALLET AUTHENTICATION ENDPOINTS
# ============================================================================

@app.route('/api/auth/wallet/nonce', methods=['POST', 'OPTIONS'])
def wallet_nonce():
    """Generate nonce for wallet authentication"""
    if request.method == 'OPTIONS':
        return '', 200
    
    if not WALLET_AUTH_HELPERS_AVAILABLE or not WEB3_AVAILABLE:
        return jsonify({'error': 'Wallet authentication not available'}), 503
    
    try:
        data = request.json
        address = data.get('address')
        
        if not address:
            return jsonify({'error': 'Wallet address required'}), 400
        
        # Validate address format
        try:
            checksum_address = Web3.to_checksum_address(address)
        except Exception:
            db.session.rollback()  # Rollback failed transaction
            return jsonify({'error': 'Invalid Ethereum address'}), 400
        
        # Generate nonce
        nonce = generate_nonce(checksum_address)
        message = format_signing_message(nonce)
        
        return jsonify({
            'success': True,
            'nonce': nonce,
            'message': message,
            'address': checksum_address
        })
    
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f"Error generating wallet nonce: {e}")
        return jsonify({'error': 'Failed to generate nonce', 'details': str(e)}), 500


@app.route('/api/auth/wallet/login', methods=['POST', 'OPTIONS'])
def wallet_login():
    """Login with wallet signature"""
    if request.method == 'OPTIONS':
        return '', 200
    
    if not WALLET_AUTH_HELPERS_AVAILABLE or not WEB3_AVAILABLE:
        return jsonify({'error': 'Wallet authentication not available'}), 503
    
    try:
        data = request.json
        address = data.get('address')
        signature = data.get('signature')
        nonce = data.get('nonce')
        
        if not all([address, signature, nonce]):
            return jsonify({'error': 'Address, signature, and nonce required'}), 400
        
        # Normalize address
        address = Web3.to_checksum_address(address).lower()
        
        # Verify nonce exists and hasn't expired
        if not verify_nonce(address, nonce):
            return jsonify({'error': 'Invalid or expired nonce'}), 401
        
        # Verify signature
        message = format_signing_message(nonce)
        if not verify_wallet_signature(address, message, signature, w3):
            return jsonify({'error': 'Invalid signature'}), 401
        
        # Consume nonce (one-time use)
        consume_nonce(address)
        
        # Find user by crypto_address
        user = User.query.filter_by(crypto_address=address).first()
        
        if not user:
            # User doesn't exist - requires registration
            return jsonify({
                'requiresRegistration': True,
                'address': address,
                'message': 'Wallet not registered. Please provide email to create account.'
            }), 404
        
        # User exists - generate JWT token
        access_token = create_access_token(identity=str(user.id))
        
        # Get access level information
        access_info = get_dashboard_access(user)
        
        return jsonify({
            'success': True,
            'user': user.to_dict(),
            'access': access_info,
            'token': access_token,
            'authProvider': 'wallet'
        })
    
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f"Error in wallet login: {e}")
        return jsonify({'error': 'Wallet login failed', 'details': str(e)}), 500


@app.route('/api/auth/wallet/register', methods=['POST', 'OPTIONS'])
def wallet_register():
    """Register new account with wallet + email"""
    if request.method == 'OPTIONS':
        return '', 200
    
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 500
    
    if not WALLET_AUTH_HELPERS_AVAILABLE or not WEB3_AVAILABLE:
        return jsonify({'error': 'Wallet authentication not available'}), 503
    
    try:
        data = request.json
        address = data.get('address')
        signature = data.get('signature')
        nonce = data.get('nonce')
        email = data.get('email')
        username = data.get('username')  # Optional
        
        if not all([address, signature, nonce, email]):
            return jsonify({'error': 'Address, signature, nonce, and email required'}), 400
        
        # Normalize address
        address = Web3.to_checksum_address(address).lower()
        
        # Verify nonce
        if not verify_nonce(address, nonce):
            return jsonify({'error': 'Invalid or expired nonce'}), 401
        
        # Verify signature
        message = format_signing_message(nonce)
        if not verify_wallet_signature(address, message, signature, w3):
            return jsonify({'error': 'Invalid signature'}), 401
        
        # Consume nonce
        consume_nonce(address)
        
        # Check if address already registered
        existing_user = User.query.filter_by(crypto_address=address).first()
        if existing_user:
            return jsonify({'error': 'Wallet already registered'}), 409
        
        # Check if email already used
        existing_email = User.query.filter_by(email=email).first()
        if existing_email:
            return jsonify({'error': 'Email already registered'}), 409
        
        # Generate username from email if not provided
        if not username:
            existing_usernames = set(u.username for u in User.query.all() if u.username)
            username = generate_user_id_from_email(email, existing_usernames)
        
        # Generate ENS name
        ens_data = resolve_or_create_ens(None, username)
        
        # Create new user
        user = User(
            username=username,
            email=email,
            crypto_address=address,
            ens_name=ens_data.get('ens_name'),
            content_hash=ens_data.get('content_hash'),
            auth_provider='wallet',
            password_hash=None,  # Wallet-only account
            patreon_connected=False
        )
        
        db.session.add(user)
        db.session.commit()
        
        # Start 7-day trial for new users
        trial_expires = start_trial(user)
        db.session.commit()
        
        # Create UserProfile
        profile_id = ens_data.get('ens_name') or str(user.id)
        profile = UserProfile(
            id=profile_id,
            email=email,
            name=username,
            ens_name=ens_data.get('ens_name'),
            crypto_address=address,
            content_hash=ens_data.get('content_hash'),
            is_employee=False,
            is_paid_member=False
        )
        db.session.add(profile)
        db.session.commit()
        
        # Generate JWT token
        access_token = create_access_token(identity=str(user.id))
        
        # Get access info
        access_info = get_dashboard_access(user)
        
        return jsonify({
            'success': True,
            'user': user.to_dict(),
            'access': access_info,
            'token': access_token,
            'trialExpires': trial_expires.isoformat(),
            'authProvider': 'wallet'
        })
    
    except Exception as e:
        db.session.rollback()
        print(f"Error in wallet registration: {e}")
        return jsonify({'error': 'Registration failed', 'details': str(e)}), 500


@app.route('/api/auth/wallet/link', methods=['POST', 'OPTIONS'])
@jwt_required()
def wallet_link():
    """Link wallet to existing account"""
    if request.method == 'OPTIONS':
        return '', 200
    
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 500
    
    if not WALLET_AUTH_HELPERS_AVAILABLE or not WEB3_AVAILABLE:
        return jsonify({'error': 'Wallet authentication not available'}), 503
    
    try:
        user_id = get_jwt_identity()
        data = request.json
        address = data.get('address')
        signature = data.get('signature')
        nonce = data.get('nonce')
        
        if not all([address, signature, nonce]):
            return jsonify({'error': 'Address, signature, and nonce required'}), 400
        
        # Normalize address
        address = Web3.to_checksum_address(address).lower()
        
        # Verify nonce
        if not verify_nonce(address, nonce):
            return jsonify({'error': 'Invalid or expired nonce'}), 401
        
        # Verify signature
        message = format_signing_message(nonce)
        if not verify_wallet_signature(address, message, signature, w3):
            return jsonify({'error': 'Invalid signature'}), 401
        
        # Consume nonce
        consume_nonce(address)
        
        # Get current user
        user = User.query.get(int(user_id))
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if wallet already linked to another user
        existing_wallet = User.query.filter_by(crypto_address=address).first()
        if existing_wallet and existing_wallet.id != user.id:
            return jsonify({'error': 'Wallet already linked to another account'}), 409
        
        # Link wallet to user
        user.crypto_address = address
        
        # Resolve and update ENS data
        ens_data = resolve_or_create_ens(user.id, user.username or user.email)
        if ens_data.get('ens_name'):
            user.ens_name = ens_data.get('ens_name')
        if ens_data.get('content_hash'):
            user.content_hash = ens_data.get('content_hash')
        
        db.session.commit()
        
        # Update UserProfile if exists
        try:
            profile_id = user.ens_name or user.patreon_id or user.username or str(user.id)
            profile = UserProfile.query.get(profile_id)
            if profile:
                profile.crypto_address = address
                profile.ens_name = ens_data.get('ens_name')
                profile.content_hash = ens_data.get('content_hash')
                db.session.commit()
        except:
            pass
        
        return jsonify({
            'success': True,
            'message': 'Wallet linked successfully',
            'cryptoAddress': address,
            'ensName': user.ens_name
        })
    
    except Exception as e:
        db.session.rollback()
        print(f"Error linking wallet: {e}")
        return jsonify({'error': 'Failed to link wallet', 'details': str(e)}), 500


# ============================================================================
# GOOGLE OAUTH ENDPOINTS
# ============================================================================

@app.route('/api/auth/google/login', methods=['GET'])
def google_login():
    """Redirect to Google OAuth consent screen"""
    if not GOOGLE_AUTH_AVAILABLE:
        return jsonify({
            'error': 'Google OAuth not available',
            'message': 'Google OAuth libraries are not installed. Install with: pip install google-auth-oauthlib google-auth'
        }), 503
    
    if not GOOGLE_CLIENT_ID:
        return jsonify({
            'error': 'Google OAuth not configured',
            'message': 'GOOGLE_CLIENT_ID environment variable is not set. See GOOGLE_OAUTH_SETUP.md for setup instructions.',
            'required_vars': ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
            'optional_vars': ['GOOGLE_REDIRECT_URI']
        }), 503
    
    try:
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [GOOGLE_REDIRECT_URI]
                }
            },
            scopes=[
                'openid',
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile'
            ]
        )
        flow.redirect_uri = GOOGLE_REDIRECT_URI
        
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true'
        )
        
        # Store state in session for verification (would use Redis in production)
        # For now, just redirect
        return redirect(authorization_url)
    
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f"Error initiating Google OAuth: {e}")
        return jsonify({'error': 'Failed to initiate Google login', 'details': str(e)}), 500


@app.route('/api/auth/google/callback', methods=['GET'])
def google_callback():
    """Handle Google OAuth callback"""
    if not GOOGLE_AUTH_AVAILABLE:
        return jsonify({
            'error': 'Google OAuth not available',
            'message': 'Google OAuth libraries are not installed. Install with: pip install google-auth-oauthlib google-auth'
        }), 503
    
    if not GOOGLE_CLIENT_ID:
        return jsonify({
            'error': 'Google OAuth not configured',
            'message': 'GOOGLE_CLIENT_ID environment variable is not set. See GOOGLE_OAUTH_SETUP.md for setup instructions.',
            'required_vars': ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
            'optional_vars': ['GOOGLE_REDIRECT_URI']
        }), 503
    
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 500
    
    try:
        # Get authorization code from query params
        code = request.args.get('code')
        if not code:
            return jsonify({'error': 'No authorization code received'}), 400
        
        # Exchange code for token
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [GOOGLE_REDIRECT_URI]
                }
            },
            scopes=[
                'openid',
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile'
            ]
        )
        flow.redirect_uri = GOOGLE_REDIRECT_URI
        flow.fetch_token(code=code)
        
        # Get user info
        credentials = flow.credentials
        id_info = id_token.verify_oauth2_token(
            credentials.id_token,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )
        
        google_id = id_info['sub']
        email = id_info.get('email')
        name = id_info.get('name', email)
        
        if not email:
            return jsonify({'error': 'Email not provided by Google'}), 400
        
        # Find or create user - handle missing google_id column gracefully
        user = None
        try:
            user = User.query.filter_by(google_id=google_id).first()
        except Exception as query_error:
            db.session.rollback()  # Rollback failed transaction
            error_str = str(query_error).lower()
            if 'column' in error_str and 'google_id' in error_str:
                print(f"Warning: google_id column missing, attempting to add it...")
                # Try to add the column
                try:
                    with db.engine.connect() as conn:
                        with conn.begin():
                            conn.execute(db.text("ALTER TABLE users ADD COLUMN google_id VARCHAR(100)"))
                            try:
                                conn.execute(db.text("CREATE UNIQUE INDEX ix_users_google_id ON users (google_id)"))
                            except Exception:
                                db.session.rollback()  # Rollback failed transaction
                                pass  # Index might already exist
                            print("  ✓ Added google_id column")
                except Exception as add_error:
                    db.session.rollback()  # Rollback failed transaction
                    error_msg = str(add_error).lower()
                    if 'already exists' in error_msg:
                        print("  ✓ google_id column already exists")
                    else:
                        print(f"  ✗ Could not add google_id column: {add_error}")
                        # Continue with email lookup as fallback
                # Retry the query
                try:
                    user = User.query.filter_by(google_id=google_id).first()
                except Exception:
                    db.session.rollback()  # Rollback failed transaction
                    # If still fails, fall back to email lookup
                    pass
            else:
                raise
        
        # Fallback to email lookup if google_id query failed
        if not user:
            # Check if email already exists
            user = User.query.filter_by(email=email).first()
            
            if user:
                # Link Google to existing account - handle missing column
                try:
                    user.google_id = google_id
                    user.auth_provider = 'google'
                except Exception as attr_error:
                    db.session.rollback()  # Rollback failed transaction
                    # If google_id column doesn't exist, add it first
                    error_str = str(attr_error).lower()
                    if 'google_id' in error_str or 'no property' in error_str:
                        print("Warning: google_id column missing, adding it now...")
                        try:
                            with db.engine.connect() as conn:
                                with conn.begin():
                                    conn.execute(db.text("ALTER TABLE users ADD COLUMN google_id VARCHAR(100)"))
                                    try:
                                        conn.execute(db.text("CREATE UNIQUE INDEX ix_users_google_id ON users (google_id)"))
                                    except Exception:
                                        db.session.rollback()  # Rollback failed transaction
                                        pass
                                    print("  ✓ Added google_id column")
                            # Refresh the user object
                            db.session.refresh(user)
                            user.google_id = google_id
                            user.auth_provider = 'google'
                        except Exception as add_error:
                            db.session.rollback()  # Rollback failed transaction
                            print(f"  ✗ Could not add google_id: {add_error}")
                            # Continue without google_id for now
                    else:
                        raise
            else:
                # Create new user - handle missing columns
                existing_usernames = set(u.username for u in User.query.all() if u.username)
                username = generate_user_id_from_email(email, existing_usernames)
                
                ens_data = resolve_or_create_ens(None, username)
                
                # Check if google_id column exists before using it
                try:
                    with db.engine.connect() as conn:
                        from sqlalchemy import inspect
                        inspector = inspect(conn)
                        existing_columns = {col['name'] for col in inspector.get_columns('users')}
                        if 'google_id' not in existing_columns:
                            with conn.begin():
                                conn.execute(db.text("ALTER TABLE users ADD COLUMN google_id VARCHAR(100)"))
                                try:
                                    conn.execute(db.text("CREATE UNIQUE INDEX ix_users_google_id ON users (google_id)"))
                                except Exception:
                                    db.session.rollback()  # Rollback failed transaction
                                    pass
                                print("  ✓ Added google_id column before creating user")
                except Exception as check_error:
                    db.session.rollback()  # Rollback failed transaction
                    print(f"  ⚠ Could not check/add google_id: {check_error}")
                
                try:
                    user = User(
                        username=username,
                        email=email,
                        google_id=google_id,
                        auth_provider='google',
                        password_hash=None,
                        ens_name=ens_data.get('ens_name'),
                        content_hash=ens_data.get('content_hash'),
                        patreon_connected=False
                    )
                except Exception as create_error:
                    db.session.rollback()  # Rollback failed transaction
                    # If google_id still causes issues, create without it
                    error_str = str(create_error).lower()
                    if 'google_id' in error_str:
                        print("  ⚠ Creating user without google_id (will update after column is added)")
                        user = User(
                            username=username,
                            email=email,
                            auth_provider='google',
                            password_hash=None,
                            ens_name=ens_data.get('ens_name'),
                            content_hash=ens_data.get('content_hash'),
                            patreon_connected=False
                        )
                        db.session.add(user)
                        db.session.commit()
                        # Now try to add google_id via raw SQL
                        try:
                            with db.engine.connect() as conn:
                                with conn.begin():
                                    conn.execute(db.text(
                                        "UPDATE users SET google_id = :google_id WHERE id = :user_id"
                                    ), {'google_id': google_id, 'user_id': user.id})
                        except Exception:
                            db.session.rollback()  # Rollback failed transaction
                            pass
                    else:
                        raise
                else:
                    db.session.add(user)
                    db.session.commit()
                
                # Start trial
                trial_expires = start_trial(user)
                db.session.commit()
                
                # Create profile
                profile_id = ens_data.get('ens_name') or str(user.id)
                profile = UserProfile(
                    id=profile_id,
                    email=email,
                    name=name,
                    ens_name=ens_data.get('ens_name'),
                    is_employee=False,
                    is_paid_member=False
                )
                db.session.add(profile)
            
            db.session.commit()
        
        # Generate JWT
        access_token = create_access_token(identity=str(user.id))
        
        # Set JWT in httpOnly cookie and redirect to frontend
        frontend_url = os.environ.get('FRONTEND_URL', 'https://ventures.isharehow.app')
        redirect_url = f"{frontend_url}/?auth=success"
        
        response = redirect(redirect_url)
        set_access_cookies(response, access_token)
        
        return response
    
    except Exception as e:
        db.session.rollback()
        print(f"Error in Google OAuth callback: {e}")
        return jsonify({'error': 'Google authentication failed', 'details': str(e)}), 500


# ============================================================================
# USER ACCESS & TIER ENDPOINTS
# ============================================================================

@app.route('/api/user/access', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_user_access():
    """Get current user's access level and dashboard permissions"""
    if request.method == 'OPTIONS':
        return '', 200
    
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 500
    
    try:
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get complete access information
        access_info = get_dashboard_access(user)
        
        return jsonify(access_info)
    
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f"Error getting user access: {e}")
        return jsonify({'error': 'Failed to get access info', 'details': str(e)}), 500


@app.route('/api/user/upgrade-options', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_user_upgrade_options():
    """Get available upgrade options for current user"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        options = get_upgrade_options(user)
        current_tier = get_user_tier(user)
        
        return jsonify({
            'currentTier': current_tier.value,
            'upgradeOptions': options
        })
    
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f"Error getting upgrade options: {e}")
        return jsonify({'error': 'Failed to get upgrade options', 'details': str(e)}), 500


@app.route('/api/auth/start-trial', methods=['POST', 'OPTIONS'])
def start_user_trial():
    """Start 7-day trial for a prospect"""
    if request.method == 'OPTIONS':
        return '', 200
    
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 500
    
    try:
        data = request.json
        email = data.get('email')
        
        if not email:
            return jsonify({'error': 'Email required'}), 400
        
        # Check if email already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            # Check if trial already used
            if existing_user.trial_start_date:
                return jsonify({'error': 'Trial already started for this email'}), 409
            
            # Start trial for existing user
            trial_expires = start_trial(existing_user)
            db.session.commit()
            
            access_token = create_access_token(identity=str(existing_user.id))
            
            return jsonify({
                'success': True,
                'trial_start': existing_user.trial_start_date.isoformat(),
                'trial_expires': trial_expires.isoformat(),
                'token': access_token
            })
        
        # Create new user with trial
        existing_usernames = set(u.username for u in User.query.all() if u.username)
        username = generate_user_id_from_email(email, existing_usernames)
        ens_data = resolve_or_create_ens(None, username)
        
        user = User(
            username=username,
            email=email,
            auth_provider='email',
            password_hash=None,  # Trial account without password
            ens_name=ens_data.get('ens_name'),
            patreon_connected=False
        )
        db.session.add(user)
        db.session.commit()
        
        # Start trial
        trial_expires = start_trial(user)
        db.session.commit()
        
        # Create profile
        profile_id = ens_data.get('ens_name') or str(user.id)
        profile = UserProfile(
            id=profile_id,
            email=email,
            name=username,
            ens_name=ens_data.get('ens_name'),
            is_employee=False,
            is_paid_member=False
        )
        db.session.add(profile)
        db.session.commit()
        
        # Generate token
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'success': True,
            'trial_start': user.trial_start_date.isoformat(),
            'trial_expires': trial_expires.isoformat(),
            'access_granted': ['rise', 'cowork', 'support'],
            'token': access_token
        })
    
    except Exception as e:
        db.session.rollback()
        print(f"Error starting trial: {e}")
        return jsonify({'error': 'Failed to start trial', 'details': str(e)}), 500



@app.route('/api/auth/logout', methods=['POST', 'OPTIONS'])
@jwt_required()
def auth_logout():
    """Logout user by clearing JWT cookie"""
    # Handle OPTIONS preflight request (decorator allows this)
    if request.method == 'OPTIONS':
        return '', 200
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
        db.session.rollback()  # Rollback failed transaction
        print(f"Error refreshing Patreon token: {e}")
    return None

@app.route('/api/auth/refresh', methods=['POST', 'OPTIONS'])
@jwt_required()
def refresh_token():
    """Refresh Patreon access token if expired"""
    # Handle OPTIONS preflight request (decorator allows this)
    if request.method == 'OPTIONS':
        return '', 200
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

# --- REMOVED: Patreon verify-and-create endpoint ---
# Replaced with Shopify subscription system

@app.route('/api/auth/verify-and-create', methods=['POST'])
def verify_and_create_user():
    """
    Create/update user account - now uses email/password registration instead of Patreon
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
                                # Check for Tier2/VIP/Vanity ($43.21/month)
                                if abs(membership_amount - 43.21) < 0.50 or membership_amount >= 43.21:
                                    membership_tier = 'Tier2'  # VIP/Vanity Tier2
                                elif membership_amount >= 10:
                                    membership_tier = 'Premium'
                                elif membership_amount >= 5:
                                    membership_tier = 'Standard'
                                else:
                                    membership_tier = 'Basic'
                            # Also check tier name for Tier2/VIP/Vanity variations
                            elif membership_tier and ('tier2' in membership_tier.lower() or 'vip' in membership_tier.lower() or 'vanity' in membership_tier.lower()):
                                membership_tier = 'Tier2'
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
            profile.patreon_id = api_user_id  # Ensure patreon_id is set
            if membership_tier:  # Only update if we have a tier from Patreon
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
            db.session.rollback()  # Rollback failed transaction
            print(f"Error in check_is_employee_column_exists for profile: {check_error}")
            column_exists = False  # Default to False (use fallback)
        
        if not column_exists:
            # Column doesn't exist - use raw SQL directly
            print(f"Warning: is_employee column missing in profile endpoint, using raw SQL fallback")
            try:
                with db.engine.connect() as conn:
                    # Try to convert user_id to integer for id comparison, but keep as string for username/patreon_id
                    try:
                        user_id_int = int(user_id_str)
                        id_condition = "id = :user_id_int"
                        params = {'user_id': user_id_str, 'user_id_int': user_id_int}
                    except (ValueError, TypeError):
                        db.session.rollback()  # Rollback failed transaction
                        # If user_id is not numeric, only check username and patreon_id
                        id_condition = "FALSE"
                        params = {'user_id': user_id_str}
                    
                    result = conn.execute(db.text(f"""
                        SELECT id, username, email, password_hash, patreon_id, 
                               access_token, refresh_token, membership_paid,
                               last_checked, token_expires_at, patreon_connected,
                               created_at, updated_at
                        FROM users 
                        WHERE ({id_condition} OR username = :user_id OR patreon_id = :user_id)
                        LIMIT 1
                    """), params)
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
                db.session.rollback()  # Rollback failed transaction
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
                    db.session.rollback()  # Rollback failed transaction
                    error_str = str(e).lower()
                    app.logger.error(f"Profile endpoint: Error looking up by integer ID: {e}")
                    # If we still get an is_employee error (shouldn't happen if check worked), use fallback
                    if 'is_employee' in error_str and 'column' in error_str:
                        print(f"Unexpected: is_employee error despite check, using raw SQL fallback")
                        # Use the same raw SQL fallback as above
                        try:
                            with db.engine.connect() as conn:
                                # Try to convert user_id to integer for id comparison, but keep as string for username/patreon_id
                                try:
                                    user_id_int = int(user_id_str)
                                    id_condition = "id = :user_id_int"
                                    params = {'user_id': user_id_str, 'user_id_int': user_id_int}
                                except (ValueError, TypeError):
                                    db.session.rollback()  # Rollback failed transaction
                                    # If user_id is not numeric, only check username and patreon_id
                                    id_condition = "FALSE"
                                    params = {'user_id': user_id_str}
                                
                                result = conn.execute(db.text(f"""
                                    SELECT id, username, email, password_hash, patreon_id, 
                                           access_token, refresh_token, membership_paid,
                                           last_checked, token_expires_at, patreon_connected,
                                           created_at, updated_at
                                    FROM users 
                                    WHERE ({id_condition} OR username = :user_id OR patreon_id = :user_id)
                                    LIMIT 1
                                """), params)
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
                            db.session.rollback()  # Rollback failed transaction
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
                    db.session.rollback()  # Rollback failed transaction
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
                    db.session.rollback()  # Rollback failed transaction
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
            db.session.rollback()  # Rollback failed transaction
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
            db.session.rollback()  # Rollback failed transaction
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
            'membershipTier': profile_data.get('membershipTier') or None,  # Return None instead of 'Not Set'
            'isPaidMember': profile_data.get('isPaidMember', False) or getattr(user, 'membership_paid', False),  # Show current payment status
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
        db.session.rollback()  # Rollback failed transaction
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
        return jsonify({
            'error': 'Database not available',
            'message': 'Database is not configured or unavailable. Please check your database configuration.'
        }), 503
    
    # Check if database is actually connected
    if not is_database_connected():
        error_info = {
            'error': 'Database connection failed',
            'message': 'Unable to connect to the database. The database server may be down or unreachable.',
            'details': 'Please check your database connection settings and ensure the database server is running.'
        }
        return jsonify(error_info), 503
    
    try:
        # Get user ID from JWT
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({'error': 'Not authenticated'}), 401
        
        # Find user by ID - use safe_get_user to handle missing columns gracefully
        user = safe_get_user(user_id)
        
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
        # Rollback failed transaction
        db.session.rollback()
        app.logger.error(f"Error fetching notifications: {e}")
        import traceback
        traceback.print_exc()
        
        # Check if it's a database connection error
        error_info = get_database_error_message(e)
        status_code = 503 if 'connection' in error_info['error'].lower() or 'unavailable' in error_info['error'].lower() else 500
        return jsonify(error_info), status_code

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
            db.session.rollback()  # Rollback failed transaction
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
                    db.session.rollback()  # Rollback failed transaction
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


@app.route('/api/tasks', methods=['GET'])
@jwt_required(optional=True)  # Allow unauthenticated access to see all tasks
def get_tasks():
    if not db:
        return jsonify({'tasks': [], 'error': 'Database not configured'}), 503
    
    try:
        # Get optional filters from query parameters
        client_id = request.args.get('client_id')
        linked_entity_type = request.args.get('linkedEntityType') or request.args.get('linked_entity_type')
        linked_entity_id = request.args.get('linkedEntityId') or request.args.get('linked_entity_id')
        
        # Build query
        query = Task.query
        
        # Check if new columns exist before using them
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        has_category_column = False
        has_linked_entity_columns = False
        try:
            # Table name is 'task' not 'tasks'
            table_name = 'task'
            table_names = [t.lower() if isinstance(t, str) else t for t in inspector.get_table_names()]
            if table_name in table_names or table_name in inspector.get_table_names():
                columns = [col['name'] for col in inspector.get_columns(table_name)]
                has_category_column = 'category' in columns
                has_linked_entity_columns = 'linked_entity_type' in columns and 'linked_entity_id' in columns
        except Exception as inspect_error:
            print(f"Warning: Could not inspect task table columns: {inspect_error}")
            pass
        
        # Filter by polymorphic entity linking (new method) - only if columns exist
        if linked_entity_type and linked_entity_id and has_linked_entity_columns:
            try:
                query = query.filter(
                    Task.linked_entity_type == linked_entity_type,
                    Task.linked_entity_id == linked_entity_id
                )
            except Exception:
                # If filter fails (columns might not exist), fall back
                query = Task.query
        # Filter by client_id if provided (through support requests - backward compatibility)
        elif client_id:
            try:
                # Try new polymorphic method first (only if columns exist)
                if has_linked_entity_columns:
                    try:
                        query = query.filter(
                            Task.linked_entity_type == 'client',
                            Task.linked_entity_id == client_id
                        )
                    except Exception:
                        query = Task.query
                # Also check old method through support requests
                try:
                    old_query = Task.query.join(SupportRequest, Task.support_request_id == SupportRequest.id).filter(
                        SupportRequest.client_id == client_id
                    )
                    # Combine both queries using union if new method worked
                    if has_linked_entity_columns and query != Task.query:
                        from sqlalchemy import or_
                        query = query.union(old_query)
                    else:
                        query = old_query
                except Exception:
                    pass  # If join fails, just use what we have
            except Exception as filter_error:
                # If new method fails, try old method
                try:
                    query = query.join(SupportRequest, Task.support_request_id == SupportRequest.id).filter(
                        SupportRequest.client_id == client_id
                    )
                except Exception as join_error:
                    # If join fails (e.g., column doesn't exist), fall back to all tasks
                    print(f"Warning: Could not filter by client_id: {join_error}")
                    query = Task.query
        
        # Get all tasks, ordered by most recent first
        # Use load_only to exclude missing columns if they don't exist
        if not has_category_column or not has_linked_entity_columns:
            # Exclude missing columns from the query
            from sqlalchemy.orm import load_only
            columns_to_load = [
                Task.id, Task.title, Task.description, Task.hyperlinks, 
                Task.status, Task.support_request_id,
                Task.created_by, Task.created_by_name, 
                Task.assigned_to, Task.assigned_to_name, Task.notes,
                Task.created_at, Task.updated_at
            ]
            # Only add new columns if they exist
            if has_category_column:
                columns_to_load.append(Task.category)
            if has_linked_entity_columns:
                columns_to_load.extend([Task.linked_entity_type, Task.linked_entity_id])
            
            query = query.options(load_only(*columns_to_load))
        
        tasks = query.order_by(Task.created_at.desc()).all()
        total_count = len(tasks)
        print(f"Fetched {total_count} tasks from database" + (f" for client_id: {client_id}" if client_id else ""))
        
        # Log task status breakdown for debugging
        if total_count > 0:
            status_counts = {}
            for task in tasks:
                status = task.status or 'unknown'
                status_counts[status] = status_counts.get(status, 0) + 1
            print(f"Task status breakdown: {status_counts}")
        else:
            print("WARNING: No tasks found in database. This could indicate:")
            print("  1. Tasks were deleted")
            print("  2. Database was reset")
            print("  3. Tasks table is empty")
            if client_id:
                print(f"  4. No tasks found for client_id: {client_id}")
        
        return jsonify({
            'tasks': [task.to_dict() for task in tasks],
            'totalCount': total_count
        })
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        error_str = str(e).lower()
        print(f"Error fetching tasks: {e}")
        import traceback
        traceback.print_exc()
        
        # Check if it's a database connection error
        if 'connection' in error_str or 'operational' in error_str or 'database' in error_str:
            return jsonify({'tasks': [], 'error': 'Database connection failed. Please check your database configuration.'}), 503
        # Return empty list for other errors
        return jsonify({'tasks': [], 'error': 'Database temporarily unavailable'}), 200

@require_session
@app.route('/api/tasks', methods=['POST'])
def create_task():
    if not db:
        return jsonify({
            'error': 'Database not available',
            'message': 'Database is not configured. Please check your database configuration.'
        }), 503
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Invalid request', 'message': 'Request body is required'}), 400
        
        # Validate required fields
        if not data.get('title') or not data['title'].strip():
            return jsonify({'error': 'Validation error', 'message': 'Title is required'}), 400
        
        # Create task - handle both 'title' and 'text' for backward compatibility
        task_title = data.get('title') or data.get('text', '').strip()
        if not task_title:
            return jsonify({'error': 'Validation error', 'message': 'Title is required'}), 400
        
        # Validate category if provided
        category = data.get('category', 'work')
        valid_categories = ['work', 'creative', 'wellness', 'rise']
        if category not in valid_categories:
            category = 'work'  # Default to 'work' if invalid
        
        # Handle entity linking - support both new polymorphic fields and backward compatibility
        linked_entity_type = data.get('linkedEntityType') or data.get('linked_entity_type')
        linked_entity_id = data.get('linkedEntityId') or data.get('linked_entity_id')
        support_request_id = data.get('supportRequestId') or data.get('support_request_id')
        
        # If new polymorphic fields are provided, use them
        # Otherwise, if support_request_id is provided, set entity type to 'support_request' for backward compatibility
        if not linked_entity_type and not linked_entity_id and support_request_id:
            linked_entity_type = 'support_request'
            linked_entity_id = support_request_id
        
        # Validate entity type if provided
        valid_entity_types = ['venture', 'client', 'employee', 'rise_journey', 'rise_journal', 'support_request']
        if linked_entity_type and linked_entity_type not in valid_entity_types:
            linked_entity_type = None
            linked_entity_id = None
        
        # Check if new columns exist before using them
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        has_category_column = False
        has_linked_entity_columns = False
        try:
            # Table name is 'task' not 'tasks'
            table_name = 'task'
            if table_name in [t.lower() for t in inspector.get_table_names()] or table_name in inspector.get_table_names():
                columns = [col['name'] for col in inspector.get_columns(table_name)]
                has_category_column = 'category' in columns
                has_linked_entity_columns = 'linked_entity_type' in columns and 'linked_entity_id' in columns
        except Exception as inspect_error:
            print(f"Warning: Could not inspect table columns: {inspect_error}")
            pass
        
        # Create task - use raw SQL if columns don't exist to avoid ORM trying to insert missing columns
        task_id = str(uuid.uuid4())
        created_at = datetime.utcnow()
        updated_at = datetime.utcnow()
        
        if not has_category_column or not has_linked_entity_columns:
            # All new columns missing - use raw SQL to insert only existing columns
            from sqlalchemy import text
            try:
                db.session.execute(
                    text("""
                        INSERT INTO task (id, title, description, hyperlinks, status, support_request_id, 
                                        created_by, created_by_name, assigned_to, assigned_to_name, notes, 
                                        created_at, updated_at)
                        VALUES (:id, :title, :description, :hyperlinks, :status, :support_request_id,
                                :created_by, :created_by_name, :assigned_to, :assigned_to_name, :notes,
                                :created_at, :updated_at)
                    """),
                    {
                        'id': task_id,
                        'title': task_title,
                        'description': data.get('description', '') or '',
                        'hyperlinks': json.dumps(data.get('hyperlinks', [])),
                        'status': data.get('status', 'pending'),
                        'support_request_id': support_request_id,
                        'created_by': data.get('createdBy'),
                        'created_by_name': data.get('createdByName'),
                        'assigned_to': data.get('assignedTo'),
                        'assigned_to_name': data.get('assignedToName'),
                        'notes': data.get('notes', '') or '',
                        'created_at': created_at,
                        'updated_at': updated_at
                    }
                )
                db.session.commit()
                # Fetch the created task using raw SQL to avoid loading missing columns
                from sqlalchemy import text
                result = db.session.execute(
                    text("SELECT * FROM task WHERE id = :task_id"),
                    {'task_id': task_id}
                ).fetchone()
                
                # Create a task-like object for the response
                if result:
                    task_dict = dict(result._mapping)
                    # Create a simple object that mimics Task.to_dict()
                    class SimpleTask:
                        def __init__(self, data):
                            self.id = data.get('id')
                            self.title = data.get('title')
                            self.description = data.get('description')
                            self.hyperlinks = data.get('hyperlinks', '[]')
                            self.status = data.get('status', 'pending')
                            self.support_request_id = data.get('support_request_id')
                            self.created_by = data.get('created_by')
                            self.created_by_name = data.get('created_by_name')
                            self.assigned_to = data.get('assigned_to')
                            self.assigned_to_name = data.get('assigned_to_name')
                            self.notes = data.get('notes', '')
                            self.created_at = data.get('created_at')
                            self.updated_at = data.get('updated_at')
                        
                        def to_dict(self):
                            return {
                                'id': self.id,
                                'title': self.title,
                                'description': self.description,
                                'hyperlinks': json.loads(self.hyperlinks) if self.hyperlinks else [],
                                'status': self.status,
                                'category': 'work',  # Default since column doesn't exist
                                'supportRequestId': self.support_request_id,
                                'linkedEntityType': None,  # Column doesn't exist
                                'linkedEntityId': None,  # Column doesn't exist
                                'createdBy': self.created_by,
                                'createdByName': self.created_by_name,
                                'assignedTo': self.assigned_to,
                                'assignedToName': self.assigned_to_name,
                                'notes': self.notes or '',
                                'createdAt': self.created_at.isoformat() if self.created_at else None,
                                'updatedAt': self.updated_at.isoformat() if self.updated_at else None
                            }
                    task = SimpleTask(task_dict)
                else:
                    # Fallback: create minimal task object
                    task = Task.query.get(task_id)
                print(f"✓ Task created successfully (raw SQL): {task_id}")
            except Exception as raw_sql_error:
                db.session.rollback()
                raise raw_sql_error
        else:
            # Some or all new columns exist - use ORM
            task = Task(
                id=task_id,
                title=task_title,
                description=data.get('description', '') or '',
                hyperlinks=json.dumps(data.get('hyperlinks', [])),
                status=data.get('status', 'pending'),
                support_request_id=support_request_id,
                created_by=data.get('createdBy'),
                created_by_name=data.get('createdByName'),
                assigned_to=data.get('assignedTo'),
                assigned_to_name=data.get('assignedToName'),
                notes=data.get('notes', '') or ''
            )
            # Only set if columns exist
            if has_category_column:
                task.category = category
            if has_linked_entity_columns:
                task.linked_entity_type = linked_entity_type
                task.linked_entity_id = linked_entity_id
            
            try:
                db.session.add(task)
                db.session.commit()
                print(f"✓ Task created successfully: {task.id}")
            except Exception as orm_error:
                db.session.rollback()
                raise orm_error
        
        # Return the created task and emit socket events
        try:
            # Ensure task has to_dict method
            if hasattr(task, 'to_dict'):
                task_data = task.to_dict()
            else:
                # Fallback if to_dict doesn't exist
                task_data = {
                    'id': getattr(task, 'id', task_id),
                    'title': getattr(task, 'title', task_title),
                    'description': getattr(task, 'description', ''),
                    'hyperlinks': json.loads(getattr(task, 'hyperlinks', '[]')),
                    'status': getattr(task, 'status', 'pending'),
                    'category': getattr(task, 'category', 'work'),
                    'linkedEntityType': getattr(task, 'linked_entity_type', None),
                    'linkedEntityId': getattr(task, 'linked_entity_id', None),
                    'supportRequestId': getattr(task, 'support_request_id', None),
                    'createdBy': getattr(task, 'created_by', None),
                    'createdByName': getattr(task, 'created_by_name', None),
                    'assignedTo': getattr(task, 'assigned_to', None),
                    'assignedToName': getattr(task, 'assigned_to_name', None),
                    'notes': getattr(task, 'notes', '') or '',
                    'createdAt': getattr(task, 'created_at', datetime.utcnow()).isoformat() if hasattr(task, 'created_at') and task.created_at else None,
                    'updatedAt': getattr(task, 'updated_at', datetime.utcnow()).isoformat() if hasattr(task, 'updated_at') and task.updated_at else None
                }
            
            # Emit socket events
            user_info = get_user_info()
            task_data['userId'] = user_info['id'] if user_info else 'anonymous'
            task_data['userRole'] = user_info['role'] if user_info else 'mentee'
            socketio.emit('task_created', task_data)
            
            # Notify assigned user if task is assigned
            if task_data.get('assignedTo'):
                socketio.emit('task_assigned', {
                    'task': task_data,
                    'assignedTo': task_data['assignedTo'],
                    'assignedToName': task_data.get('assignedToName'),
                    'createdBy': task_data.get('createdBy'),
                    'createdByName': task_data.get('createdByName')
                })
            
            return jsonify({'task': task_data}), 201
        except Exception as db_error:
            if db and hasattr(db, 'session'):
                try:
                    db.session.rollback()
                except:
                    pass  # Ignore rollback errors if session is broken
            print(f"✗ Database error creating task: {db_error}")
            print(f"  Error type: {type(db_error).__name__}")
            import traceback
            traceback.print_exc()
            # Check if it's a connection error
            error_str = str(db_error).lower()
            error_type_str = str(type(db_error).__name__).lower()
            if ('connection' in error_str or 'database' in error_str or 'operational' in error_str or 
                'import' in error_str or 'psycopg' in error_str or 'operationalerror' in error_type_str or
                'connectionerror' in error_type_str):
                return jsonify({
                    'error': 'Database unavailable', 
                    'message': f'Database connection failed: {str(db_error)[:200]}. Please check your database configuration.'
                }), 503
            # For other database errors, return 500
            return jsonify({
                'error': 'Database error',
                'message': f'Failed to create task: {str(db_error)[:200]}'
            }), 500
    except KeyError as e:
        db.session.rollback()  # Rollback failed transaction
        print(f"Missing required field: {e}")
        return jsonify({'error': 'Validation error', 'message': f'Missing required field: {str(e)}'}), 400
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f"Error creating task: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to create task', 'message': str(e)}), 500

# @require_session  # Tasks work without authentication
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
        
        # Check if category column exists before updating
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        has_category_column = False
        has_linked_entity_columns = False
        try:
            if 'tasks' in inspector.get_table_names():
                columns = [col['name'] for col in inspector.get_columns('tasks')]
                has_category_column = 'category' in columns
                has_linked_entity_columns = 'linked_entity_type' in columns and 'linked_entity_id' in columns
        except Exception:
            pass
        
        # Update category if provided and column exists
        if 'category' in data and has_category_column:
            category = data.get('category', 'work')
            valid_categories = ['work', 'creative', 'wellness', 'rise']
            if category in valid_categories:
                task.category = category
        
        # Update user assignment fields if provided
        if 'assignedTo' in data:
            task.assigned_to = data.get('assignedTo') or None
        if 'assignedToName' in data:
            task.assigned_to_name = data.get('assignedToName') or None
        if 'notes' in data:
            task.notes = data.get('notes') or ''
        
        # Update entity linking - support both new polymorphic fields and backward compatibility
        # Only update if columns exist
        if has_linked_entity_columns and ('linkedEntityType' in data or 'linked_entity_type' in data):
            linked_entity_type = data.get('linkedEntityType') or data.get('linked_entity_type')
            linked_entity_id = data.get('linkedEntityId') or data.get('linked_entity_id')
            
            # Validate entity type
            valid_entity_types = ['venture', 'client', 'employee', 'rise_journey', 'rise_journal', 'support_request']
            if linked_entity_type and linked_entity_type in valid_entity_types:
                task.linked_entity_type = linked_entity_type
                task.linked_entity_id = linked_entity_id
            elif linked_entity_type is None:  # Allow clearing the link
                task.linked_entity_type = None
                task.linked_entity_id = None
        
        # Update support request link if provided (backward compatibility)
        if 'supportRequestId' in data or 'support_request_id' in data:
            support_request_id = data.get('supportRequestId') or data.get('support_request_id') or None
            task.support_request_id = support_request_id
            # Also update polymorphic fields for backward compatibility
            if support_request_id and not task.linked_entity_type:
                task.linked_entity_type = 'support_request'
                task.linked_entity_id = support_request_id
        db.session.commit()
        user_info = get_user_info()
        task_data = task.to_dict()
        task_data['userId'] = user_info['id'] if user_info else 'anonymous'
        task_data['userRole'] = user_info['role'] if user_info else 'mentee'
        socketio.emit('task_updated', task_data)
        
        # Notify assigned user if assignment changed
        if task_data.get('assignedTo'):
            socketio.emit('task_assigned', {
                'task': task_data,
                'assignedTo': task_data['assignedTo'],
                'assignedToName': task_data.get('assignedToName'),
                'updatedBy': user_info['id'] if user_info else 'anonymous'
            })
        return jsonify({'task': task.to_dict()})
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f"Error updating task: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to update task', 'message': str(e)}), 500

# @require_session  # Tasks work without authentication
@app.route('/api/tasks/<task_id>', methods=['DELETE'])
def delete_task(task_id):
    if not db:
        return jsonify({
            'error': 'Database not available',
            'message': 'Database is not configured. Please check your database configuration.'
        }), 503
    try:
        task = Task.query.get_or_404(task_id)
        db.session.delete(task)
        db.session.commit()
        user_info = get_user_info()
        socketio.emit('task_deleted', {'id': task_id, 'userId': user_info['id'] if user_info else 'anonymous'})
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f"Error deleting task: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to delete task', 'message': str(e)}), 500

@app.route('/api/admin/tasks/link-to-user', methods=['POST'])
@jwt_required()
def link_tasks_to_user():
    """Admin endpoint to link old tasks to a specific user (isharehow)"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    try:
        # Get current user and verify admin access
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Check if user is admin
        is_admin = hasattr(user, 'is_admin') and user.is_admin
        if not is_admin:
            # Also check if user is isharehow
            username = getattr(user, 'username', '').lower()
            email = getattr(user, 'email', '').lower()
            if username not in ['isharehow', 'admin'] and email != 'jeliyah@isharehowlabs.com':
                return jsonify({'error': 'Admin access required'}), 403
        
        data = request.get_json() or {}
        target_username = data.get('username', 'isharehow')
        
        # Find the target user
        target_user = User.query.filter_by(username=target_username).first()
        if not target_user:
            # Try email
            target_user = User.query.filter_by(email=target_username).first()
        if not target_user:
            return jsonify({'error': f'User "{target_username}" not found'}), 404
        
        # Find all tasks that don't have created_by set or have empty/null values
        old_tasks = Task.query.filter(
            (Task.created_by == None) | (Task.created_by == '') | (Task.created_by == 'anonymous')
        ).all()
        
        linked_count = 0
        user_id_str = str(target_user.id)
        user_name = target_user.username or target_user.email or 'isharehow'
        
        for task in old_tasks:
            # Link task to user
            task.created_by = user_id_str
            if not task.created_by_name:
                task.created_by_name = user_name
            # If task is not assigned, assign it to the user
            if not task.assigned_to:
                task.assigned_to = user_id_str
                task.assigned_to_name = user_name
            linked_count += 1
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Linked {linked_count} tasks to user "{target_username}"',
            'linkedCount': linked_count,
            'userId': target_user.id,
            'username': target_username
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error linking tasks to user: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to link tasks', 'message': str(e)}), 500

# Track active/logged-in users via Socket.io connections
active_users = {}  # user_id -> { name, email, last_seen, socket_id }

@app.route('/api/users/workspace', methods=['GET'])
@jwt_required()
def get_workspace_users():
    """Get list of logged-in/active users for task assignment and co-drawing"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    try:
        # Get all users from database (not just active, since we track active via Socket.io)
        users = User.query.all()
        
        # Also include currently active users from Socket.io
        users_data = []
        user_ids_seen = set()
        
        # First, add all database users
        for user in users:
            user_id = user.patreon_id or user.username or str(user.id)
            username = user.username or user.email or 'Unknown'
            
            # Check if user is currently active (connected via Socket.io)
            is_active = user_id in active_users
            
            users_data.append({
                'id': user_id,
                'name': username,
                'email': user.email if hasattr(user, 'email') else None,
                'isActive': is_active,
                'lastSeen': active_users[user_id]['last_seen'].isoformat() if is_active else None
            })
            user_ids_seen.add(user_id)
        
        # Add any active users not in database (anonymous or not yet in DB)
        for user_id, user_data in active_users.items():
            if user_id not in user_ids_seen:
                users_data.append({
                    'id': user_id,
                    'name': user_data['name'],
                    'email': user_data.get('email'),
                    'isActive': True,
                    'lastSeen': user_data['last_seen'].isoformat()
                })
        
        # Sort by active status first, then by name
        users_data.sort(key=lambda u: (not u.get('isActive', False), u['name'].lower()))
        
        return jsonify(users_data), 200
        
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f"Error fetching workspace users: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to fetch users', 'message': str(e)}), 500


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
    except (ValueError, TypeError):
        db.session.rollback()  # Rollback failed transaction
        # If parsing fails, return None
        return None


# ============================================================================
# COLLABORATIVE DRAWING PAD - Socket.io handlers
# ============================================================================

# Store drawing state in memory (could be moved to database for persistence)
drawing_sessions = {}  # session_id -> { strokes: [], users: set() }

@socketio.on('drawing:join')
def handle_drawing_join():
    """Handle user joining drawing session"""
    session_id = 'default'  # Could be per-workspace or per-user
    if session_id not in drawing_sessions:
        drawing_sessions[session_id] = {'strokes': [], 'users': set()}
    
    user_id = request.sid
    drawing_sessions[session_id]['users'].add(user_id)
    
    # Send current canvas state to the new user
    emit('drawing:state', {
        'strokes': drawing_sessions[session_id]['strokes']
    })
    
    # Notify other users
    socketio.emit('drawing:user_joined', {
        'userId': user_id,
        'userName': 'User'  # Could get from session
    }, skip_sid=request.sid)

@socketio.on('drawing:refresh')
def handle_drawing_refresh():
    """Handle refresh request - send current drawing state"""
    session_id = 'default'
    if session_id in drawing_sessions:
        # Send current canvas state to the requesting user
        emit('drawing:state', {
            'strokes': drawing_sessions[session_id]['strokes']
        })

@socketio.on('drawing:leave')
def handle_drawing_leave():
    """Handle user leaving drawing session"""
    session_id = 'default'
    if session_id in drawing_sessions:
        user_id = request.sid
        drawing_sessions[session_id]['users'].discard(user_id)
        
        # Notify other users
        socketio.emit('drawing:user_left', {
            'userId': user_id
        }, skip_sid=request.sid)

@socketio.on('drawing:stroke')
def handle_drawing_stroke(data):
    """Handle drawing stroke from client"""
    session_id = 'default'
    if session_id not in drawing_sessions:
        drawing_sessions[session_id] = {'strokes': [], 'users': set()}
    
    stroke = data.get('stroke')
    if stroke:
        # Store stroke
        drawing_sessions[session_id]['strokes'].append(stroke)
        
        # Limit stored strokes to prevent memory issues (keep last 1000)
        if len(drawing_sessions[session_id]['strokes']) > 1000:
            drawing_sessions[session_id]['strokes'] = drawing_sessions[session_id]['strokes'][-1000:]
        
        # Broadcast to all other users
        socketio.emit('drawing:stroke', {
            'stroke': stroke,
            'userId': data.get('userId', 'anonymous'),
            'userName': data.get('userName', 'Anonymous')
        }, skip_sid=request.sid)

@socketio.on('drawing:clear')
def handle_drawing_clear():
    """Handle canvas clear request"""
    session_id = 'default'
    if session_id in drawing_sessions:
        drawing_sessions[session_id]['strokes'] = []
    
    # Broadcast clear to all users
    socketio.emit('drawing:clear', skip_sid=request.sid)

@socketio.on('drawing:assign_user')
def handle_drawing_assign_user(data):
    """Handle user assignment for co-drawing"""
    assigned_user_id = data.get('assignedUserId')
    assigned_user_name = data.get('assignedUserName')
    
    # Broadcast assignment to all users
    socketio.emit('drawing:user_assigned', {
        'assignedUserId': assigned_user_id,
        'assignedUserName': assigned_user_name,
        'assignedBy': request.sid
    })

# Socket.io handler for real-time task notes updates
@socketio.on('task_notes_update')
def handle_task_notes_update(data):
    """Handle real-time task notes updates"""
    try:
        task_id = data.get('task_id')
        notes = data.get('notes', '')
        
        if not task_id:
            emit('error', {'message': 'Task ID required'})
            return
        
        # Update task in database
        if DB_AVAILABLE:
            task = Task.query.get(task_id)
            if task:
                task.notes = notes
                task.updated_at = datetime.utcnow()
                db.session.commit()
                
                # Broadcast to all connected clients
                socketio.emit('task_notes_updated', {
                    'task_id': task_id,
                    'notes': notes,
                    'updated_at': task.updated_at.isoformat() if task.updated_at else None
                })
                
                print(f"Task notes updated: {task_id}")
            else:
                emit('error', {'message': 'Task not found'})
        else:
            emit('error', {'message': 'Database not available'})
            
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f"Error updating task notes: {e}")
        import traceback
        traceback.print_exc()
        emit('error', {'message': str(e)})

    except (ValueError, AttributeError):
        db.session.rollback()  # Rollback failed transaction
        try:
            # Try date-only format (YYYY-MM-DD) and add time
            if 'T' not in date_string:
                return datetime.fromisoformat(date_string + 'T00:00:00')
            raise
        except Exception as e:
            db.session.rollback()  # Rollback failed transaction
            print(f"Error parsing date '{date_string}': {e}")
            return None

def get_or_create_user_profile():
    """Get or create user profile from JWT authentication"""
    try:
        # Ensure JWT is verified (safety check in case decorator didn't work)
        # This should already be done by @jwt_required() decorator
        try:
            verify_jwt_in_request(optional=False)
        except Exception as verify_err:
            db.session.rollback()  # Rollback failed transaction
            # JWT verification failed - return auth error
            print(f"JWT verification failed in get_or_create_user_profile: {verify_err}")
            return None, jsonify({
                'error': 'Authentication required', 
                'message': 'Invalid or missing authentication token. Please log in again.'
            }), 401
        
        # Get user ID from JWT token (set by @jwt_required() decorator)
        user_id = get_jwt_identity()
    except RuntimeError as e:
        db.session.rollback()  # Rollback failed transaction
        # JWT context not available - this means @jwt_required() didn't run or JWT is invalid
        error_msg = str(e)
        print(f"Error getting JWT identity: {error_msg}")
        return None, jsonify({
            'error': 'Authentication required', 
            'message': 'JWT token not verified. Please ensure you are logged in.'
        }), 401
    
    if not user_id:
        return None, jsonify({'error': 'Not authenticated'}), 401
    
    # Find the User record first to get user data
    user = None
    user_id_str = str(user_id)
    
    # Try to find user by ID (could be integer ID, username, or patreon_id)
    # Use safe_get_user to handle missing columns gracefully
    user = safe_get_user(user_id_str)
    
    if not user:
        return None, jsonify({'error': 'User not found'}), 404
    
    # Use ENS name as profile ID if available, otherwise use user ID
    profile_id = user.ens_name or str(user.id)
    
    # Check if profile exists
    profile = UserProfile.query.get(profile_id)
    
    # Create profile if it doesn't exist
    if not profile:
        # Try to get membership tier from UserProfile if it exists elsewhere, or check User model
        membership_tier = None
        lifetime_support = None
        
        # Check if there's another profile with same patreon_id to get tier info
        if user.patreon_id:
            existing_profile = UserProfile.query.filter_by(patreon_id=user.patreon_id).first()
            if existing_profile:
                membership_tier = existing_profile.membership_tier
                lifetime_support = existing_profile.lifetime_support_amount
        
        profile = UserProfile(
            id=profile_id,
            email=user.email,
            name=user.username or user.email or 'User',
            patreon_id=user.patreon_id,
            membership_tier=membership_tier,  # Will be synced from Patreon callback
            is_paid_member=user.membership_paid if hasattr(user, 'membership_paid') else False,
            lifetime_support_amount=lifetime_support,
            ens_name=user.ens_name,
            crypto_address=getattr(user, 'crypto_address', None),
            content_hash=getattr(user, 'content_hash', None)
        )
        db.session.add(profile)
        db.session.commit()
        print(f"✓ Created new user profile: {profile_id}")
    else:
        # Update profile with latest User data if Patreon info is missing
        if not profile.patreon_id and user.patreon_id:
            profile.patreon_id = user.patreon_id
        if not profile.membership_tier and user.patreon_id:
            # Try to find another profile with same patreon_id to get tier
            existing_profile = UserProfile.query.filter_by(patreon_id=user.patreon_id).first()
            if existing_profile and existing_profile.membership_tier:
                profile.membership_tier = existing_profile.membership_tier
                profile.lifetime_support_amount = existing_profile.lifetime_support_amount
        if hasattr(user, 'membership_paid'):
            profile.is_paid_member = user.membership_paid
        db.session.commit()
    
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
        db.session.rollback()  # Rollback failed transaction
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
        db.session.rollback()  # Rollback failed transaction
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
        db.session.rollback()  # Rollback failed transaction
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
        db.session.rollback()  # Rollback failed transaction
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
        db.session.rollback()  # Rollback failed transaction
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
        db.session.rollback()  # Rollback failed transaction
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
        db.session.rollback()  # Rollback failed transaction
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
        db.session.rollback()  # Rollback failed transaction
        print(f"Error in Gemini chat: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Internal server error', 'message': str(e)}), 500

@socketio.on('connect')
def handle_connect():
    """Track user when they connect (for notifications and user list)"""
    print('Client connected')
    try:
        # Try to get user info from JWT if available
        user_id = None
        user_name = 'Anonymous'
        user_email = None
        
        # Check if there's a JWT token in the connection
        try:
            from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
            verify_jwt_in_request(optional=True)
            user_id = get_jwt_identity()
            if user_id and DB_AVAILABLE:
                # Get user from database
                user = None
                if str(user_id).isdigit():
                    user = User.query.get(int(user_id))
                if not user:
                    user = User.query.filter_by(username=str(user_id)).first()
                if not user:
                    user = User.query.filter_by(patreon_id=str(user_id)).first()
                
                if user:
                    user_id = user.patreon_id or user.username or str(user.id)
                    user_name = user.username or user.email or 'Unknown'
                    user_email = user.email
        except:
            pass  # Not authenticated, use anonymous
        
        if user_id:
            active_users[user_id] = {
                'name': user_name,
                'email': user_email,
                'last_seen': datetime.utcnow(),
                'socket_id': request.sid
            }
            print(f"User {user_id} ({user_name}) connected and tracked")
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f"Error tracking user connection: {e}")

@socketio.on('disconnect')
def handle_disconnect():
    """Remove user when they disconnect"""
    print('Client disconnected')
    try:
        # Find and remove user by socket ID
        for user_id, user_data in list(active_users.items()):
            if user_data.get('socket_id') == request.sid:
                del active_users[user_id]
                print(f"User {user_id} disconnected and removed from active users")
                break
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f"Error tracking user disconnection: {e}")

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
def get_clients():
    """Get all clients with optional filtering - no authentication required"""
    if not DB_AVAILABLE:
        return jsonify({
            'error': 'Database not available',
            'message': 'Database is not configured or unavailable. Please check your database configuration.'
        }), 503
    
    # Check if database is actually connected
    if not is_database_connected():
        error_info = {
            'error': 'Database connection failed',
            'message': 'Unable to connect to the database. The database server may be down or unreachable.',
            'details': 'Please check your database connection settings and ensure the database server is running.'
        }
        return jsonify(error_info), 503
    
    try:
        # No authentication required - anyone can view clients
        
        # Check if clients table exists first
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        table_exists = False
        try:
            tables = inspector.get_table_names()
            table_exists = 'clients' in tables
        except Exception:
            db.session.rollback()
            pass
        
        # If table doesn't exist, return empty array instead of error
        if not table_exists:
            return jsonify({
                'clients': [],
                'message': 'Clients table not yet initialized. No clients available.'
            }), 200
        
        # Get query parameters
        status = request.args.get('status', 'all')
        employee_id = request.args.get('employee_id', None)
        search = request.args.get('search', '')
        
        # Check if budget and deadline columns exist before using ORM
        # This prevents errors if migration hasn't run yet
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        has_budget_column = False
        has_deadline_column = False
        try:
            if 'clients' in inspector.get_table_names():
                columns = [col['name'] for col in inspector.get_columns('clients')]
                has_budget_column = 'budget' in columns
                has_deadline_column = 'deadline' in columns
        except Exception:
            pass
        
        # Build query - use load_only to exclude columns that don't exist yet
        if has_budget_column and has_deadline_column:
            # All columns exist, use normal query
            query = Client.query
        else:
            # Some columns missing, use load_only to exclude them
            from sqlalchemy.orm import load_only
            columns_to_load = [
                Client.id, Client.name, Client.email, Client.company, Client.phone,
                Client.status, Client.tier, Client.notes, Client.tags,
                Client.marketing_budget, Client.google_analytics_property_key,
                Client.user_id, Client.created_at, Client.updated_at
            ]
            if has_budget_column:
                columns_to_load.append(Client.budget)
            if has_deadline_column:
                columns_to_load.append(Client.deadline)
            query = db.session.query(Client).options(load_only(*columns_to_load))
        
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
        
        # No user filtering - show all clients
        # Optional employee filter if specified
        if employee_id:
            try:
                emp_id_int = int(employee_id)
                clients = [c for c in clients if c.employee_assignments and 
                          any(a.employee_id == emp_id_int for a in c.employee_assignments)]
            except (ValueError, TypeError):
                db.session.rollback()  # Rollback failed transaction
                pass  # Invalid employee_id, ignore filter
        
        return jsonify({
            'clients': [client.to_dict() for client in clients]
        }), 200
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f"Error fetching clients: {e}")
        import traceback
        traceback.print_exc()
        
        error_msg = str(e).lower()
        
        # If table doesn't exist, return empty array instead of error
        if 'clients' in error_msg or 'does not exist' in error_msg or 'relation' in error_msg or 'table' in error_msg:
            return jsonify({
                'clients': [],
                'message': 'Clients table not yet initialized. No clients available.'
            }), 200
        
        # Check if it's a database connection error
        error_info = get_database_error_message(e)
        status_code = 503 if 'connection' in error_info['error'].lower() or 'unavailable' in error_info['error'].lower() else 500
        return jsonify(error_info), status_code

@app.route('/api/demo/leads', methods=['POST'])
def create_demo_lead():
    """Create a demo lead as a prospect - public endpoint, no authentication required"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('name') or not data.get('email') or not data.get('phone'):
            return jsonify({'error': 'Name, email, and phone are required'}), 400
        
        # Check if email already exists
        existing = Client.query.filter_by(email=data['email']).first()
        if existing:
            # Update existing client/prospect with new demo request info
            existing.notes = (existing.notes or '') + f'\n\nDemo Request: {datetime.utcnow().isoformat()} - {data.get("message", "No message")}'
            if data.get('marketingBudget'):
                existing.marketing_budget = data.get('marketingBudget')
            if existing.status == 'inactive':
                existing.status = 'prospect'  # Reactivate as prospect
            db.session.commit()
            return jsonify({
                'message': 'Demo request received (existing prospect updated)',
                'clientId': existing.id
            }), 200
        
        # Create new prospect (status='prospect')
        client = Client(
            name=data['name'],
            email=data['email'],
            company=data.get('company'),
            phone=data['phone'],
            status='prospect',  # Mark as prospect
            marketing_budget=data.get('marketingBudget'),
            notes=f'Demo Request: {data.get("message", "No message")}\nSource: {data.get("source", "book_demo_form")}',
        )
        
        db.session.add(client)
        db.session.commit()
        
        print(f"✓ Created prospect from demo form: {client.email} ({client.id})")
        
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

def send_password_reset_email(email, name, reset_token):
    """Send password reset email to client"""
    try:
        frontend_url = os.environ.get('FRONTEND_URL', 'https://ventures.isharehow.app')
        reset_url = f"{frontend_url}/reset-password?token={reset_token}&email={email}"
        
        # Email configuration from environment variables
        smtp_host = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
        smtp_port = int(os.environ.get('SMTP_PORT', '587'))
        smtp_user = os.environ.get('SMTP_USER')
        smtp_password = os.environ.get('SMTP_PASSWORD')
        smtp_from = os.environ.get('SMTP_FROM', smtp_user or 'noreply@ventures.isharehow.app')
        
        if not smtp_user or not smtp_password:
            print("⚠ SMTP credentials not configured. Password reset email not sent.")
            print(f"   Reset URL for {email}: {reset_url}")
            return False
        
        # Create email message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = 'Welcome to iShareHow Ventures - Set Your Password'
        msg['From'] = smtp_from
        msg['To'] = email
        
        # Email body
        text_content = f"""
Hello {name},

Welcome to iShareHow Ventures! Your client account has been created.

To set your password and access your account, please click the link below:
{reset_url}

This link will expire in 24 hours.

If you did not request this account, please ignore this email.

Best regards,
iShareHow Ventures Team
"""
        
        html_content = f"""
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4a90e2;">Welcome to iShareHow Ventures!</h2>
        <p>Hello {name},</p>
        <p>Your client account has been created. To set your password and access your account, please click the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{reset_url}" style="background-color: #4a90e2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Set Your Password</a>
        </div>
        <p style="font-size: 12px; color: #666;">This link will expire in 24 hours.</p>
        <p style="font-size: 12px; color: #666;">If you did not request this account, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #999;">Best regards,<br>iShareHow Ventures Team</p>
    </div>
</body>
</html>
"""
        
        # Attach both plain text and HTML versions
        msg.attach(MIMEText(text_content, 'plain'))
        msg.attach(MIMEText(html_content, 'html'))
        
        # Send email
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
        
        print(f"✓ Password reset email sent to {email}")
        return True
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f"⚠ Error sending password reset email to {email}: {e}")
        import traceback
        traceback.print_exc()
        return False

@app.route('/api/creative/clients', methods=['POST'])
def create_client():
    """Create a new client - requires employee access"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('name') or not data.get('email') or not data.get('phone'):
            return jsonify({'error': 'Name, email, and phone are required'}), 400
        
        # Check if email already exists in clients
        existing_client = Client.query.filter_by(email=data['email']).first()
        if existing_client:
            return jsonify({'error': 'Client with this email already exists'}), 409
        
        # Check if user account already exists
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            # User exists, link it to the client
            user = existing_user
            print(f"✓ Linking existing user account to new client: {user.email}")
        else:
            # Create new user account for the client
            # Generate username from email (before @)
            username_base = data['email'].split('@')[0]
            username = username_base
            counter = 1
            # Ensure username is unique
            while User.query.filter_by(username=username).first():
                username = f"{username_base}{counter}"
                counter += 1
            
            # Create user account
            user = User(
                username=username,
                email=data['email'],
                patreon_connected=False
            )
            # Set a temporary random password (user will reset it)
            temp_password = secrets.token_urlsafe(16)
            user.set_password(temp_password)
            db.session.add(user)
            db.session.flush()  # Get user.id without committing
            
            print(f"✓ Created user account for client: {user.email} (ID: {user.id})")
        
        # Create client and link to user account
        client = Client(
            name=data['name'],
            email=data['email'],
            company=data.get('company'),
            phone=data['phone'],
            status=data.get('status', 'pending'),
            tier=data.get('tier'),
            notes=data.get('notes'),
            tags=json.dumps(data.get('tags', [])) if data.get('tags') else None,
            marketing_budget=data.get('marketingBudget'),
            google_analytics_property_key=data.get('googleAnalyticsPropertyKey'),
            user_id=user.id
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
        
        # Generate password reset token and send email
        if not existing_user:  # Only send email for newly created accounts
            reset_token = create_access_token(
                identity=str(user.id),
                expires_delta=timedelta(hours=24)
            )
            send_password_reset_email(data['email'], data['name'], reset_token)
        
        return jsonify(client.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error creating client: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to create client'}), 500

@app.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    """Reset password using token from email"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    try:
        data = request.get_json()
        token = data.get('token')
        new_password = data.get('password')
        email = data.get('email')
        
        if not token or not new_password:
            return jsonify({'error': 'Token and password are required'}), 400
        
        # Verify JWT token
        try:
            from flask_jwt_extended import decode_token
            from jwt import ExpiredSignatureError, DecodeError
            decoded = decode_token(token)
            user_id = decoded.get('sub')
        except ExpiredSignatureError:
            db.session.rollback()  # Rollback failed transaction
            return jsonify({'error': 'Token has expired. Please request a new password reset link.'}), 400
        except DecodeError:
            db.session.rollback()  # Rollback failed transaction
            return jsonify({'error': 'Invalid token'}), 400
        except Exception as e:
            db.session.rollback()  # Rollback failed transaction
            print(f"Token verification error: {e}")
            return jsonify({'error': 'Invalid or expired token'}), 400
        
        # Find user
        user = User.query.get(int(user_id))
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Verify email matches if provided
        if email and user.email and user.email.lower() != email.lower():
            return jsonify({'error': 'Email does not match token'}), 400
        
        # Validate password strength (optional - basic check)
        if len(new_password) < 8:
            return jsonify({'error': 'Password must be at least 8 characters long'}), 400
        
        # Set new password
        user.set_password(new_password)
        db.session.commit()
        
        print(f"✓ Password reset successful for user: {user.email}")
        return jsonify({'message': 'Password reset successfully'}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error resetting password: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to reset password'}), 500

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
        db.session.rollback()  # Rollback failed transaction
        print(f"Error fetching client: {e}")
        return jsonify({'error': 'Failed to fetch client'}), 500

@app.route('/api/creative/clients/<client_id>', methods=['PUT'])
def update_client(client_id):
    """Update a client - requires authentication and access"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    try:
        client = Client.query.get(client_id)
        if not client:
            return jsonify({'error': 'Client not found'}), 404
        
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
        if 'googleAnalyticsPropertyKey' in data:
            client.google_analytics_property_key = data['googleAnalyticsPropertyKey']
        
        client.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify(client.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error updating client: {e}")
        return jsonify({'error': 'Failed to update client'}), 500

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

@app.route('/api/creative/clients/<client_id>/employees', methods=['GET'])
@jwt_required(optional=True)
def get_client_employees(client_id):
    """Get all employees assigned to a client"""
    if not DB_AVAILABLE:
        return jsonify({'employees': [], 'error': 'Database not available'}), 503
    
    try:
        # Get all employee assignments for this client
        assignments = ClientEmployeeAssignment.query.filter_by(client_id=client_id).all()
        
        employees = []
        for assignment in assignments:
            employee_data = {
                'id': assignment.employee_id,
                'name': assignment.employee_name or 'Unknown',
                'email': '',
                'role': assignment.employee_name or 'Team Member',
                'avatar': None,
                'assignedAt': assignment.assigned_at.isoformat() if assignment.assigned_at else None
            }
            
            # Try to get user details if employee_id exists
            if assignment.employee_id:
                try:
                    user = User.query.get(assignment.employee_id)
                    if user:
                        employee_data['id'] = user.id
                        employee_data['name'] = f"{user.first_name or ''} {user.last_name or ''}".strip() or user.username or assignment.employee_name or 'Unknown'
                        employee_data['email'] = user.email or ''
                        employee_data['role'] = assignment.employee_name or 'Team Member'
                except Exception as e:
                    print(f"Error fetching user details for employee_id {assignment.employee_id}: {e}")
            
            employees.append(employee_data)
        
        return jsonify({'employees': employees}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error fetching client employees: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'employees': [], 'error': 'Failed to fetch employees'}), 500

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
                db.session.rollback()  # Rollback failed transaction
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
        db.session.rollback()  # Rollback failed transaction
        print(f"Error fetching dashboard connections: {e}")
        return jsonify({'error': 'Failed to fetch connections'}), 500

@app.route('/api/creative/clients/<client_id>/dashboard-connections', methods=['POST'])
def update_dashboard_connections(client_id):
    """Update dashboard connections for a client - requires authentication and access"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    try:
        client = Client.query.get(client_id)
        if not client:
            return jsonify({'error': 'Client not found'}), 404
        
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
        return jsonify({
            'error': 'Database not available',
            'message': 'Database is not configured or unavailable. Please check your database configuration.'
        }), 503
    
    # Check if database is actually connected
    if not is_database_connected():
        error_info = {
            'error': 'Database connection failed',
            'message': 'Unable to connect to the database. The database server may be down or unreachable.',
            'details': 'Please check your database connection settings and ensure the database server is running.'
        }
        return jsonify(error_info), 503
    
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
                db.session.rollback()  # Rollback failed transaction
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
        db.session.rollback()  # Rollback failed transaction
        print(f"Error fetching employees: {e}")
        import traceback
        traceback.print_exc()
        
        # Check if it's a database connection error
        error_info = get_database_error_message(e)
        status_code = 503 if 'connection' in error_info['error'].lower() or 'unavailable' in error_info['error'].lower() else 500
        return jsonify(error_info), status_code

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
        try:
            active_clients_query = db.session.query(Client).join(
                ClientEmployeeAssignment,
                Client.id == ClientEmployeeAssignment.client_id
            ).filter(
                ClientEmployeeAssignment.employee_id == employee_db_id,
                Client.status == 'active'
            )
            active_clients_count = active_clients_query.count()
        except Exception as e:
            db.session.rollback()  # Rollback failed transaction
            app.logger.warning(f"Error counting active clients: {e}")
            active_clients_count = 0
        
        # Count clients created this month (assigned to employee)
        try:
            first_day_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            clients_this_month = db.session.query(Client).join(
                ClientEmployeeAssignment,
                Client.id == ClientEmployeeAssignment.client_id
            ).filter(
                ClientEmployeeAssignment.employee_id == employee_db_id,
                Client.created_at >= first_day_of_month
            ).count()
        except Exception as e:
            db.session.rollback()  # Rollback failed transaction
            app.logger.warning(f"Error counting clients this month: {e}")
            clients_this_month = 0
        
        # Count support requests with status 'open' or 'in-progress' (assigned to employee's clients)
        # Handle case where client_id column might not exist in support_requests table
        try:
            # Try to use client_id join if column exists
            open_support_requests = db.session.query(SupportRequest).join(
                ClientEmployeeAssignment,
                SupportRequest.client_id == ClientEmployeeAssignment.client_id
            ).filter(
                ClientEmployeeAssignment.employee_id == employee_db_id,
                SupportRequest.status.in_(['open', 'in-progress'])
            ).count()
        except Exception as e:
            db.session.rollback()  # Rollback failed transaction
            # Check if it's a column error
            error_str = str(e).lower()
            if 'client_id' in error_str or 'column' in error_str or 'undefinedcolumn' in error_str:
                app.logger.info("client_id column not found in support_requests, using fallback")
            else:
                app.logger.warning(f"Error counting support requests: {e}")
            # Fallback: count all open/in-progress support requests if client_id column doesn't exist
            try:
                open_support_requests = db.session.query(SupportRequest).filter(
                    SupportRequest.status.in_(['open', 'in-progress'])
                ).count()
            except Exception as e2:
                db.session.rollback()  # Rollback failed transaction
                app.logger.warning(f"Error in fallback support request count: {e2}")
                open_support_requests = 0
        
        # Count total clients assigned to employee (for progress calculation)
        try:
            total_clients = db.session.query(Client).join(
                ClientEmployeeAssignment,
                Client.id == ClientEmployeeAssignment.client_id
            ).filter(
                ClientEmployeeAssignment.employee_id == employee_db_id
            ).count()
        except Exception as e:
            db.session.rollback()  # Rollback failed transaction
            app.logger.warning(f"Error counting total clients: {e}")
            total_clients = 0
        
        # Calculate progress: percentage of active clients out of total
        # Or use a different metric - for now, use active/total * 100
        progress = 0
        if total_clients > 0:
            progress = int((active_clients_count / total_clients) * 100)
        
        # Count tasks completed today (from support requests resolved today)
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        try:
            # Try to use client_id join if column exists
            tasks_completed_today = db.session.query(SupportRequest).join(
                ClientEmployeeAssignment,
                SupportRequest.client_id == ClientEmployeeAssignment.client_id
            ).filter(
                ClientEmployeeAssignment.employee_id == employee_db_id,
                SupportRequest.status == 'resolved',
                SupportRequest.updated_at >= today_start
            ).count()
        except Exception as e:
            db.session.rollback()  # Rollback failed transaction
            # Check if it's a column error
            error_str = str(e).lower()
            if 'client_id' in error_str or 'column' in error_str or 'undefinedcolumn' in error_str:
                app.logger.info("client_id column not found in support_requests, using fallback for tasks")
            else:
                app.logger.warning(f"Error counting tasks completed today: {e}")
            # Fallback: count all resolved support requests from today if client_id column doesn't exist
            try:
                tasks_completed_today = db.session.query(SupportRequest).filter(
                    SupportRequest.status == 'resolved',
                    SupportRequest.updated_at >= today_start
                ).count()
            except Exception as e2:
                db.session.rollback()  # Rollback failed transaction
                app.logger.warning(f"Error in fallback task count: {e2}")
                tasks_completed_today = 0
        
        return jsonify({
            'clients': active_clients_count,
            'clientsThisMonth': clients_this_month,
            'projects': open_support_requests,  # Using open support requests as "projects in progress"
            'tasks': tasks_completed_today,
            'completion': progress,
            'totalClients': total_clients
        })
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error fetching creative metrics: {e}")
        print(f"Traceback: {error_trace}")
        app.logger.error(f"Error fetching creative metrics: {e}")
        app.logger.error(f"Traceback: {error_trace}")
        
        # Check if it's a database connection error
        error_info = get_database_error_message(e)
        status_code = 503 if 'connection' in error_info['error'].lower() or 'unavailable' in error_info['error'].lower() else 500
        return jsonify(error_info), status_code

@app.route('/api/creative/support-requests', methods=['GET'])
def get_support_requests():
    """Get all support requests with optional filtering - no authentication required"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    try:
        # Check if support_requests table exists first
        from sqlalchemy import inspect, text
        inspector = inspect(db.engine)
        table_exists = False
        try:
            tables = inspector.get_table_names()
            table_exists = 'support_requests' in tables
        except Exception:
            db.session.rollback()
            pass
        
        # If table doesn't exist, return empty array instead of error
        if not table_exists:
            return jsonify({
                'requests': [],
                'message': 'Support requests table not yet initialized. No requests available.'
            }), 200
        
        # Get query parameters
        status = request.args.get('status', 'all')
        client_id = request.args.get('client_id', None)
        priority = request.args.get('priority', None)
        
        # Check if client_id column exists before using ORM
        has_client_id_column = False
        try:
            columns = [col['name'] for col in inspector.get_columns('support_requests')]
            has_client_id_column = 'client_id' in columns
        except Exception:
            db.session.rollback()  # Rollback failed transaction
            # Table might not exist
            pass
        
        # If client_id column doesn't exist, use raw SQL
        if not has_client_id_column:
            print("⚠ client_id column not found in support_requests table, using raw SQL query")
            sql = "SELECT id, client_name, subject, description, priority, status, assigned_to, created_at, updated_at FROM support_requests"
            conditions = []
            params = {}
            
            if status != 'all':
                conditions.append("status = :status")
                params['status'] = status
            
            if priority:
                conditions.append("priority = :priority")
                params['priority'] = priority
            
            if conditions:
                sql += " WHERE " + " AND ".join(conditions)
            
            sql += " ORDER BY created_at DESC"
            
            result = db.session.execute(text(sql), params)
            rows = result.fetchall()
            
            # Convert rows to SupportRequest-like objects
            requests = []
            for row in rows:
                req_dict = dict(row._mapping)
                # Create a simple object with the data
                class SimpleRequest:
                    def __init__(self, data):
                        for key, value in data.items():
                            setattr(self, key, value)
                    def to_dict(self):
                        return {
                            'id': getattr(self, 'id', None),
                            'client': getattr(self, 'client_name', None) or 'N/A',
                            'clientId': None,  # Column doesn't exist
                            'subject': getattr(self, 'subject', ''),
                            'description': getattr(self, 'description', ''),
                            'priority': getattr(self, 'priority', 'medium'),
                            'status': getattr(self, 'status', 'open'),
                            'assignedTo': getattr(self, 'assigned_to', None),
                            'linkedTasksCount': 0,
                            'createdAt': getattr(self, 'created_at', None).isoformat() if hasattr(getattr(self, 'created_at', None), 'isoformat') else None,
                            'updatedAt': getattr(self, 'updated_at', None).isoformat() if hasattr(getattr(self, 'updated_at', None), 'isoformat') else None
                        }
                requests.append(SimpleRequest(req_dict))
        else:
            # Use ORM since column exists
            # Use load_only to exclude client_name column that doesn't exist in DB
            from sqlalchemy.orm import load_only
            query = db.session.query(SupportRequest).options(
                load_only(SupportRequest.id, SupportRequest.client_id, SupportRequest.subject,
                         SupportRequest.description, SupportRequest.priority, SupportRequest.status,
                         SupportRequest.assigned_to, SupportRequest.created_at, SupportRequest.updated_at)
            )
            
            if status != 'all':
                query = query.filter(SupportRequest.status == status)
            
            if client_id:
                query = query.filter(SupportRequest.client_id == client_id)
            
            if priority:
                query = query.filter(SupportRequest.priority == priority)
            
            requests = query.order_by(SupportRequest.created_at.desc()).all()
        
        # Return all requests
        return jsonify({
            'requests': [req.to_dict() for req in requests]
        }), 200
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f"Error fetching support requests: {e}")
        import traceback
        traceback.print_exc()
        error_msg = str(e).lower()
        
        # If table doesn't exist, return empty array instead of error
        if 'support_requests' in error_msg or 'does not exist' in error_msg or 'relation' in error_msg or 'table' in error_msg:
            return jsonify({
                'requests': [],
                'message': 'Support requests table not yet initialized. No requests available.'
            }), 200
        
        # Check if it's a database connection error
        error_info = get_database_error_message(e)
        status_code = 503 if 'connection' in error_info['error'].lower() or 'unavailable' in error_info['error'].lower() else 500
        return jsonify(error_info), status_code

@app.route('/api/creative/support-requests', methods=['POST'])
@jwt_required(optional=True)
def create_support_request():
    """Create a new support request - requires authentication"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    try:
        # Get current user for authentication
        user = get_current_user()
        if not user:
            # Try to get user from JWT
            try:
                user_id = get_jwt_identity()
                if user_id:
                    if str(user_id).isdigit():
                        user = User.query.get(int(user_id))
                    if not user:
                        user = User.query.filter_by(username=str(user_id)).first()
                    if not user:
                        user = User.query.filter_by(patreon_id=str(user_id)).first()
            except Exception as e:
                db.session.rollback()  # Rollback failed transaction
                app.logger.debug(f"Could not get user from JWT: {e}")
            
            if not user:
                return jsonify({'error': 'Authentication required'}), 401
        
        data = request.get_json()
        
        # Validate required fields
        if not data.get('subject') or not data.get('description'):
            return jsonify({'error': 'Subject and description are required'}), 400
        
        # Get client if client_id is provided
        client = None
        assigned_employee = None
        
        # Use explicitly provided assignedTo if available, otherwise auto-assign from client
        assigned_to_value = data.get('assignedTo')
        
        if data.get('clientId'):
            client = Client.query.get(data.get('clientId'))
            if client and not assigned_to_value:
                # Find assigned employee for this client (only if not explicitly provided)
                assignment = ClientEmployeeAssignment.query.filter_by(
                    client_id=client.id
                ).first()
                if assignment:
                    assigned_employee = User.query.get(assignment.employee_id)
                    if assigned_employee:
                        assigned_to_value = assigned_employee.username or assigned_employee.email or assigned_employee.name
                        data['assignedTo'] = assigned_to_value
        
        # Check if payment is required for this request
        requires_payment = False
        payment_status = 'free'  # 'free', 'paid', 'pending'
        
        if client:
            # Count total requests for this client
            total_requests = SupportRequest.query.filter_by(
                client_id=client.id
            ).count()
            
            # Check if client has exceeded free limit
            if total_requests >= FREE_REQUESTS_LIMIT:
                requires_payment = True
                # Check if payment was provided
                payment_id = data.get('paymentId')
                if payment_id:
                    payment_status = 'paid'
                else:
                    payment_status = 'pending'
                    # Don't create request if payment is required but not provided
                    return jsonify({
                        'error': 'Payment required',
                        'message': f'You have used your {FREE_REQUESTS_LIMIT} free requests. Additional requests cost ${CREATIVE_REQUEST_PRICE} each.',
                        'requiresPayment': True,
                        'price': CREATIVE_REQUEST_PRICE,
                        'checkoutUrl': f'/api/shopify/checkout?type=request&clientId={client.id}'
                    }), 402
        
        # Create support request
        request_obj = SupportRequest(
            user_id=user.id,  # Set user_id from authenticated user
            client_id=data.get('clientId'),
            # client_name column doesn't exist - will be computed from client relationship
            subject=data['subject'],
            description=data['description'],
            priority=data.get('priority', 'medium'),
            status='open',
            assigned_to=assigned_to_value
        )
        
        db.session.add(request_obj)
        db.session.commit()
        
        # If payment was required and provided, record it
        if requires_payment and payment_status == 'paid':
            # TODO: Create payment record in database
            print(f"✓ Payment recorded for request {request_obj.id}: ${CREATIVE_REQUEST_PRICE}")
        
        # Send notification to assigned employee if one exists
        if assigned_employee:
            try:
                notification = Notification(
                    user_id=assigned_employee.id,
                    type='support-request',
                    title=f'New Support Request: {request_obj.subject}',
                    message=f'A new support request has been created for client {request_obj.client_name or (client.name if client else "Unknown")}. Priority: {request_obj.priority}',
                    read=False,
                    notification_metadata=json.dumps({
                        'link': f'/creative?tab=support',
                        'support_request_id': request_obj.id,
                        'client_id': request_obj.client_id,
                        'priority': request_obj.priority
                    })
                )
                db.session.add(notification)
                db.session.commit()
                
                # Emit socket.io event for real-time notification
                socketio.emit('notification:new', notification.to_dict(), room=f'user_{assigned_employee.id}')
                
                # Send push notification if available
                try:
                    if WEBPUSH_AVAILABLE:
                        send_push_notification(assigned_employee.id, notification)
                except Exception as push_error:
                    db.session.rollback()  # Rollback failed transaction
                    app.logger.warning(f"Failed to send push notification: {push_error}")
                
                print(f"✓ Sent notification to employee {assigned_employee.id} for support request {request_obj.id}")
            except Exception as notif_error:
                db.session.rollback()  # Rollback failed transaction
                app.logger.error(f"Failed to send notification: {notif_error}")
                # Don't fail the request creation if notification fails
        
        client_name = request_obj.client_name or (client.name if client else None)
        print(f"✓ Created support request: {request_obj.id} for client {client_name or request_obj.client_id}")
        return jsonify(request_obj.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        error_msg = str(e)
        print(f"Error creating support request: {e}")
        import traceback
        traceback.print_exc()
        
        # Check if it's a table doesn't exist error
        if 'support_requests' in error_msg.lower() or 'does not exist' in error_msg.lower():
            return jsonify({
                'error': 'Support requests table not found. Please run database migrations.',
                'details': 'The support_requests table needs to be created. Run: flask db upgrade'
            }), 500
        
        return jsonify({
            'error': 'Failed to create support request',
            'details': error_msg
        }), 500

@app.route('/api/creative/support-requests/<request_id>', methods=['PUT'])
@jwt_required(optional=True)
def update_support_request(request_id):
    """Update a support request - requires authentication and access"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    try:
        # Get current user for authentication - try get_current_user first (more reliable)
        user = get_current_user()
        if not user:
            # Try to get user from JWT
            try:
                user_id = get_jwt_identity()
                if user_id:
                    if str(user_id).isdigit():
                        user = User.query.get(int(user_id))
                    if not user:
                        user = User.query.filter_by(username=str(user_id)).first()
                    if not user:
                        user = User.query.filter_by(patreon_id=str(user_id)).first()
            except Exception as e:
                db.session.rollback()  # Rollback failed transaction
                app.logger.debug(f"Could not get user from JWT: {e}")
            
            if not user:
                return jsonify({'error': 'Authentication required'}), 401
        
        request_obj = SupportRequest.query.get(request_id)
        if not request_obj:
            return jsonify({'error': 'Support request not found'}), 404
        
        # Check access - admins and employees can update any request, assigned employees can update their client's requests
        is_admin = hasattr(user, 'is_admin') and user.is_admin
        is_employee = hasattr(user, 'is_employee') and user.is_employee
        
        # Allow admins and employees to update any request
        if not is_admin and not is_employee and request_obj.client_id:
            # Check if user is assigned to this client
            assignment = ClientEmployeeAssignment.query.filter_by(
                client_id=request_obj.client_id,
                employee_id=user.id
            ).first()
            if not assignment:
                return jsonify({'error': 'Access denied. You must be assigned to this client or be an employee/admin.'}), 403
        
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

@app.route('/api/creative/support-requests/<request_id>/tasks', methods=['GET'])
@jwt_required(optional=True)
def get_support_request_tasks(request_id):
    """Get all tasks linked to a support request"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    try:
        # Verify support request exists
        request_obj = SupportRequest.query.get(request_id)
        if not request_obj:
            return jsonify({'error': 'Support request not found'}), 404
        
        # Get all tasks linked to this support request
        try:
            tasks = Task.query.filter_by(support_request_id=request_id).order_by(Task.created_at.desc()).all()
            return jsonify({
                'tasks': [task.to_dict() for task in tasks],
                'count': len(tasks)
            }), 200
        except Exception as e:
            db.session.rollback()  # Rollback failed transaction
            # If support_request_id column doesn't exist, return empty list
            error_str = str(e).lower()
            if 'support_request_id' in error_str or 'column' in error_str:
                return jsonify({
                    'tasks': [],
                    'count': 0,
                    'message': 'Task linking not available yet'
                }), 200
            raise
    
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        app.logger.error(f"Error fetching tasks for support request: {e}")
        return jsonify({'error': 'Failed to fetch tasks'}), 500

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
        db.session.rollback()  # Rollback failed transaction
        print(f"Error fetching subscription: {e}")
        return jsonify({'error': 'Failed to fetch subscription'}), 500

# Run new scripts automatically at startup
# This happens before the app starts serving requests
def seed_rise_journey_levels():
    """Seed the 7 journey levels if they don't exist - uses raw SQL to avoid model access issues"""
    if not DB_AVAILABLE or not db:
        print("⚠ Database not available, skipping Rise Journey levels seeding")
        return
    
    try:
        from sqlalchemy import text
        
        # Check if levels already exist using raw SQL
        with db.engine.connect() as conn:
            result = conn.execute(text("SELECT COUNT(*) FROM rise_journey_levels"))
            existing_count = result.scalar()
            if existing_count > 0:
                print(f"✓ Rise Journey levels already exist ({existing_count} levels)")
                return
            
            print("🌱 Seeding Rise Journey levels...")
            
            # Define the 7 journey levels
            levels_data = [
                {
                    'level_key': 'wellness',
                    'title': 'Wellness',
                    'description': 'Foundational physical health and energy management. Build the base for all other journeys.',
                    'focus': 'Foundational Physical Health & Energy',
                    'revenue_products': '["Wellness Products", "Nutrition Plans"]',
                    'order': 1
                },
                {
                    'level_key': 'mobility',
                    'title': 'Mobility',
                    'description': 'Physical movement, flexibility, and body awareness. Connect your mind and body.',
                    'focus': 'Physical Movement & Body Awareness',
                    'revenue_products': '["Fitness Programs", "Movement Classes"]',
                    'order': 2
                },
                {
                    'level_key': 'accountability',
                    'title': 'Accountability',
                    'description': 'Build systems and habits that keep you on track. Create sustainable change.',
                    'focus': 'Systems & Habit Formation',
                    'revenue_products': '["Coaching Programs", "Accountability Tools"]',
                    'order': 3
                },
                {
                    'level_key': 'creativity',
                    'title': 'Creativity',
                    'description': 'Unlock your creative potential. Express yourself and innovate.',
                    'focus': 'Creative Expression & Innovation',
                    'revenue_products': '["Creative Workshops", "Art Supplies"]',
                    'order': 4
                },
                {
                    'level_key': 'alignment',
                    'title': 'Alignment',
                    'description': 'Align your actions with your values. Live with purpose and intention.',
                    'focus': 'Values & Purpose Alignment',
                    'revenue_products': '["Life Coaching", "Alignment Tools"]',
                    'order': 5
                },
                {
                    'level_key': 'mindfulness',
                    'title': 'Mindfulness',
                    'description': 'Cultivate present-moment awareness. Develop inner peace and clarity.',
                    'focus': 'Present-Moment Awareness & Clarity',
                    'revenue_products': '["Meditation Programs", "Mindfulness Tools"]',
                    'order': 6
                },
                {
                    'level_key': 'destiny',
                    'title': 'Destiny',
                    'description': 'Step into your highest potential. Manifest your true calling.',
                    'focus': 'Highest Potential & True Calling',
                    'revenue_products': '["Mastermind Programs", "Destiny Coaching"]',
                    'order': 7
                }
            ]
            
            # Insert levels using raw SQL
            for level_data in levels_data:
                level_id = str(uuid.uuid4())
                conn.execute(
                    text("""
                        INSERT INTO rise_journey_levels 
                        (id, level_key, title, description, focus, revenue_products, "order", created_at)
                        VALUES (:id, :level_key, :title, :description, :focus, :revenue_products, :order, NOW())
                    """),
                    {
                        'id': level_id,
                        'level_key': level_data['level_key'],
                        'title': level_data['title'],
                        'description': level_data['description'],
                        'focus': level_data['focus'],
                        'revenue_products': level_data['revenue_products'],
                        'order': level_data['order']
                    }
                )
            
            conn.commit()
            print(f"✓ Successfully seeded {len(levels_data)} Rise Journey levels")
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f"✗ Error seeding Rise Journey levels: {e}")
        import traceback
        traceback.print_exc()
        try:
            if db:
                db.session.rollback()
        except:
            pass

run_new_scripts_at_startup()

def run_database_upgrade():
    """Run database migrations automatically at startup"""
    if not DB_AVAILABLE or not db:
        print("⚠ Database not available, skipping database upgrade")
        return
    
    try:
        print("\n" + "="*80)
        print("DATABASE MIGRATION - Running automatic upgrade...")
        print("="*80)
        
        with app.app_context():
            from flask_migrate import upgrade
            try:
                # Try to upgrade to head - this will handle multiple heads by upgrading to all
                upgrade()
                print("✓ Database upgrade completed successfully")
            except Exception as upgrade_error:
                error_str = str(upgrade_error).lower()
                if 'multiple head' in error_str or 'heads' in error_str:
                    print("⚠ Multiple migration heads detected, upgrading to all heads...")
                    try:
                        # Upgrade to all heads explicitly
                        upgrade(revision='heads')
                        print("✓ Database upgrade to all heads completed successfully")
                    except Exception as heads_error:
                        print(f"⚠ Error upgrading to heads: {heads_error}")
                        print("⚠ Continuing with application startup - migrations may need manual resolution")
                else:
                    print(f"⚠ Migration error: {upgrade_error}")
                    print("⚠ Continuing with application startup - migrations may need manual resolution")
            
            # After migration, ensure all required columns exist
            # This is a safety check in case migrations didn't run properly
            try:
                from sqlalchemy import inspect
                inspector = inspect(db.engine)
                
                if 'users' in inspector.get_table_names():
                    existing_columns = {col['name'] for col in inspector.get_columns('users')}
                    required_columns = {
                        'has_subscription_update', 'subscription_update_active',
                        'shopify_customer_id', 'bold_subscription_id',
                        'is_employee', 'is_admin',
                        'google_id', 'auth_provider'
                    }
                    
                    missing = required_columns - existing_columns
                    if missing:
                        print(f"⚠ Warning: Missing columns detected: {missing}")
                        print("  Attempting to add missing columns...")
                        
                        added_count = 0
                        with db.engine.connect() as conn:
                            with conn.begin():
                                for col_name in missing:
                                    try:
                                        if col_name in ['has_subscription_update', 'subscription_update_active']:
                                            conn.execute(db.text(f"ALTER TABLE users ADD COLUMN {col_name} BOOLEAN NOT NULL DEFAULT FALSE"))
                                        elif col_name in ['shopify_customer_id', 'bold_subscription_id']:
                                            conn.execute(db.text(f"ALTER TABLE users ADD COLUMN {col_name} VARCHAR(50)"))
                                        elif col_name == 'is_employee':
                                            conn.execute(db.text(f"ALTER TABLE users ADD COLUMN {col_name} BOOLEAN NOT NULL DEFAULT FALSE"))
                                        elif col_name == 'is_admin':
                                            conn.execute(db.text(f"ALTER TABLE users ADD COLUMN {col_name} BOOLEAN NOT NULL DEFAULT FALSE"))
                                        elif col_name == 'google_id':
                                            conn.execute(db.text(f"ALTER TABLE users ADD COLUMN {col_name} VARCHAR(100)"))
                                            # Create unique index for google_id
                                            try:
                                                conn.execute(db.text(f"CREATE UNIQUE INDEX ix_users_google_id ON users ({col_name})"))
                                            except Exception:
                                                db.session.rollback()  # Rollback failed transaction
                                                pass  # Index might already exist
                                        elif col_name == 'auth_provider':
                                            conn.execute(db.text(f"ALTER TABLE users ADD COLUMN {col_name} VARCHAR(20) NOT NULL DEFAULT 'email'"))
                                        print(f"  ✓ Added column: {col_name}")
                                        added_count += 1
                                    except Exception as col_error:
                                        db.session.rollback()  # Rollback failed transaction
                                        error_str = str(col_error).lower()
                                        if 'already exists' in error_str or 'duplicate' in error_str:
                                            print(f"  ✓ Column {col_name} already exists (ignoring)")
                                        else:
                                            print(f"  ✗ Could not add {col_name}: {col_error}")
                                            import traceback
                                            traceback.print_exc()
                        
                        if added_count > 0:
                            print(f"✓ Successfully added {added_count} missing column(s)")
                        print("✓ Missing columns check complete")
                    else:
                        print("✓ All required columns verified")
            except Exception as verify_error:
                db.session.rollback()  # Rollback failed transaction
                print(f"⚠ Could not verify columns (non-critical): {verify_error}")
                import traceback
                traceback.print_exc()
                
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f"⚠ Could not run database upgrade: {e}")
        import traceback
        traceback.print_exc()
        # Don't fail startup if upgrade fails - might be a connection issue

# Run database upgrade at startup (works for both 'python app.py' and 'flask run')
# Use a flag and lock to ensure it only runs once
_db_upgrade_run = False
import threading
_db_upgrade_lock = threading.Lock()

def ensure_database_upgrade():
    """Ensure database upgrade runs once at startup"""
    global _db_upgrade_run
    with _db_upgrade_lock:
        if _db_upgrade_run:
            return
        _db_upgrade_run = True
    
    if DB_AVAILABLE and db:
        run_database_upgrade()
        
        # Seed Rise Journey levels at startup (inside app context)
        try:
            with app.app_context():
                seed_rise_journey_levels()
        except Exception as e:
            db.session.rollback()  # Rollback failed transaction
            print(f"⚠ Could not seed Rise Journey levels at startup: {e}")
            import traceback
            traceback.print_exc()

# Register to run on first request (works with 'flask run')
# The flag ensures it only runs once, so it's efficient
@app.before_request
def initialize_on_first_request():
    """Initialize database and seed data on first request"""
    ensure_database_upgrade()

if __name__ == '__main__':
    # Run database upgrade at startup (for 'python app.py')
    ensure_database_upgrade()
    
    port = int(os.environ.get('PORT', 5000))
    # Allow Werkzeug for development/production (or use gunicorn for true production)
    socketio.run(app, host='0.0.0.0', port=port, allow_unsafe_werkzeug=True)


# --- Shopify & Bold Subscriptions Integration ---
# Bold Subscriptions Admin: https://sub.boldapps.net/admin
# Shopify App Proxy URL: https://shop.isharehow.app/apps/app-proxy
# Environment variables needed:
# SHOPIFY_SHOP_DOMAIN=shop.isharehow.app
# SHOPIFY_API_KEY=your_api_key
# SHOPIFY_API_SECRET=your_api_secret
# SHOPIFY_WEBHOOK_SECRET=your_webhook_secret
# BOLD_SUBSCRIPTIONS_API_KEY=your_bold_api_key
# BOLD_SUBSCRIPTIONS_SHOP_DOMAIN=your_shop_domain.myshopify.com

SHOPIFY_SHOP_DOMAIN = os.environ.get('SHOPIFY_SHOP_DOMAIN', 'shop.isharehow.app')
SHOPIFY_API_KEY = os.environ.get('SHOPIFY_API_KEY')
SHOPIFY_API_SECRET = os.environ.get('SHOPIFY_API_SECRET')
SHOPIFY_WEBHOOK_SECRET = os.environ.get('SHOPIFY_WEBHOOK_SECRET')
BOLD_SUBSCRIPTIONS_API_KEY = os.environ.get('BOLD_SUBSCRIPTIONS_API_KEY')
BOLD_SUBSCRIPTIONS_SHOP_DOMAIN = os.environ.get('BOLD_SUBSCRIPTIONS_SHOP_DOMAIN', '0e1cwk-u0.myshopify.com')

# Subscription pricing
SUBSCRIPTION_PRICE = 17.77  # Monthly subscription for Rise + Co-Work dashboards
CREATIVE_REQUEST_PRICE = 15.00  # Per request in creative dashboard
FREE_REQUESTS_LIMIT = 15  # First 15 requests are free for clients

def verify_shopify_webhook(data, hmac_header):
    """Verify Shopify webhook signature"""
    if not SHOPIFY_WEBHOOK_SECRET:
        return False
    import hmac
    import hashlib
    calculated_hmac = hmac.new(
        SHOPIFY_WEBHOOK_SECRET.encode('utf-8'),
        data.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(calculated_hmac, hmac_header)

@app.route('/api/shopify/webhook', methods=['POST'])
def shopify_webhook():
    """Handle Shopify webhooks for subscription and payment events"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    try:
        # Verify webhook signature
        hmac_header = request.headers.get('X-Shopify-Hmac-Sha256', '')
        data = request.get_data(as_text=True)
        
        if not verify_shopify_webhook(data, hmac_header):
            print("⚠ Invalid Shopify webhook signature")
            return jsonify({'error': 'Invalid signature'}), 401
        
        webhook_data = request.get_json()
        topic = request.headers.get('X-Shopify-Topic', '')
        
        print(f"📦 Shopify webhook received: {topic}")
        
        # Handle different webhook topics
        if topic == 'orders/create' or topic == 'orders/paid':
            # Handle order payment
            order = webhook_data
            customer_email = order.get('customer', {}).get('email')
            customer_id = order.get('customer', {}).get('id')
            order_id = order.get('id')
            total_price = float(order.get('total_price', 0))
            
            if customer_email:
                # Find or create user by email
                user = User.query.filter_by(email=customer_email).first()
                if user:
                    # Update Shopify customer ID
                    if customer_id:
                        user.shopify_customer_id = str(customer_id)
                    
                    # Check if this is a subscription order
                    line_items = order.get('line_items', [])
                    for item in line_items:
                        product_title = item.get('title', '').lower()
                        if 'subscription' in product_title or 'dashboard' in product_title:
                            # Create or update subscription
                            subscription = Subscription.query.filter_by(
                                user_id=str(user.id),
                                status='active'
                            ).first()
                            
                            if not subscription:
                                subscription = Subscription(
                                    user_id=str(user.id),
                                    tier='standard',
                                    billing_cycle='monthly',
                                    status='active',
                                    amount=SUBSCRIPTION_PRICE,
                                    currency='USD',
                                    payment_method='shopify',
                                    payment_method_id=str(order_id),
                                    started_at=datetime.utcnow(),
                                    expires_at=datetime.utcnow() + timedelta(days=30)
                                )
                                db.session.add(subscription)
                            else:
                                # Renew subscription
                                subscription.expires_at = datetime.utcnow() + timedelta(days=30)
                                subscription.status = 'active'
                            
                            # Update user subscription status
                            user.membership_paid = True
                            user.has_subscription_update = True
                            user.subscription_update_active = True
                            user.last_checked = datetime.utcnow()
                            
                            db.session.commit()
                            print(f"✓ Subscription updated for {customer_email}")
        
        elif topic == 'orders/cancelled':
            # Handle subscription cancellation
            order = webhook_data
            customer_email = order.get('customer', {}).get('email')
            
            if customer_email:
                user = User.query.filter_by(email=customer_email).first()
                if user:
                    subscription = Subscription.query.filter_by(
                        user_id=str(user.id),
                        status='active'
                    ).first()
                    if subscription:
                        subscription.status = 'cancelled'
                        subscription.cancelled_at = datetime.utcnow()
                    
                    # Update user subscription status
                    user.membership_paid = False
                    user.has_subscription_update = True
                    user.subscription_update_active = False
                    user.last_checked = datetime.utcnow()
                    
                    db.session.commit()
                    print(f"✓ Subscription cancelled for {customer_email}")
        
        return jsonify({'status': 'ok'}), 200
    except Exception as e:
        print(f"Error handling Shopify webhook: {e}")
        import traceback
        traceback.print_exc()
        db.session.rollback()
        return jsonify({'error': 'Webhook processing failed'}), 500

@app.route('/api/bold-subscriptions/webhook', methods=['POST'])
def bold_subscriptions_webhook():
    """Handle Bold Subscriptions webhooks for subscription updates"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    try:
        webhook_data = request.get_json()
        event_type = webhook_data.get('event_type', '')
        subscription_data = webhook_data.get('subscription', {})
        
        print(f"📦 Bold Subscriptions webhook received: {event_type}")
        
        customer_email = subscription_data.get('customer', {}).get('email')
        bold_subscription_id = subscription_data.get('id')
        status = subscription_data.get('status', '')
        
        if customer_email:
            user = User.query.filter_by(email=customer_email).first()
            if user:
                # Update Bold subscription ID
                if bold_subscription_id:
                    user.bold_subscription_id = str(bold_subscription_id)
                
                # Handle different event types
                if event_type in ['subscription.created', 'subscription.activated', 'subscription.renewed']:
                    user.membership_paid = True
                    user.has_subscription_update = True
                    user.subscription_update_active = True
                    user.last_checked = datetime.utcnow()
                    
                    # Update or create subscription record
                    subscription = Subscription.query.filter_by(
                        user_id=str(user.id),
                        status='active'
                    ).first()
                    
                    if not subscription:
                        subscription = Subscription(
                            user_id=str(user.id),
                            tier='standard',
                            billing_cycle='monthly',
                            status='active',
                            amount=SUBSCRIPTION_PRICE,
                            currency='USD',
                            payment_method='bold_subscriptions',
                            payment_method_id=str(bold_subscription_id),
                            started_at=datetime.utcnow(),
                            expires_at=datetime.utcnow() + timedelta(days=30)
                        )
                        db.session.add(subscription)
                    else:
                        subscription.status = 'active'
                        subscription.expires_at = datetime.utcnow() + timedelta(days=30)
                
                elif event_type in ['subscription.cancelled', 'subscription.expired']:
                    user.membership_paid = False
                    user.has_subscription_update = True
                    user.subscription_update_active = False
                    user.last_checked = datetime.utcnow()
                    
                    subscription = Subscription.query.filter_by(
                        user_id=str(user.id),
                        status='active'
                    ).first()
                    if subscription:
                        subscription.status = 'cancelled'
                        subscription.cancelled_at = datetime.utcnow()
                
                db.session.commit()
                print(f"✓ Bold subscription updated for {customer_email}: {event_type}")
        
        return jsonify({'status': 'ok'}), 200
    except Exception as e:
        print(f"Error handling Bold Subscriptions webhook: {e}")
        import traceback
        traceback.print_exc()
        db.session.rollback()
        return jsonify({'error': 'Webhook processing failed'}), 500

@app.route('/api/shopify/checkout', methods=['POST'])
def shopify_checkout():
    """Create Shopify checkout session for subscription"""
    try:
        data = request.get_json()
        user_id = data.get('userId')
        subscription_type = data.get('type', 'subscription')  # 'subscription' or 'request'
        
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400
        
        # Find user
        user = User.query.get(int(user_id)) if user_id.isdigit() else User.query.filter_by(email=user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Generate checkout URL
        if subscription_type == 'subscription':
            # Monthly subscription for dashboards
            price = SUBSCRIPTION_PRICE
            product_title = "Rise & Co-Work Dashboard Access"
        else:
            # Per-request payment
            price = CREATIVE_REQUEST_PRICE
            product_title = "Creative Dashboard Request"
        
        # Shopify checkout URL (using app proxy)
        checkout_url = f"https://{SHOPIFY_SHOP_DOMAIN}/apps/app-proxy/checkout?price={price}&title={product_title}&user_id={user_id}"
        
        return jsonify({
            'checkoutUrl': checkout_url,
            'price': price
        }), 200
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f"Error creating Shopify checkout: {e}")
        return jsonify({'error': 'Failed to create checkout'}), 500

# --- REMOVED: Patreon OAuth2 Integration ---
# All Patreon code has been removed and replaced with Shopify payment integration
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
        db.session.rollback()  # Rollback failed transaction
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
                                # Check for Tier2/VIP/Vanity ($43.21/month)
                                if abs(membership_amount - 43.21) < 0.50 or membership_amount >= 43.21:
                                    membership_tier = 'Tier2'  # VIP/Vanity Tier2
                                elif membership_amount >= 10:
                                    membership_tier = 'Premium'
                                elif membership_amount >= 5:
                                    membership_tier = 'Standard'
                                else:
                                    membership_tier = 'Basic'
                            # Also check tier name for Tier2/VIP/Vanity variations
                            elif membership_tier and ('tier2' in membership_tier.lower() or 'vip' in membership_tier.lower() or 'vanity' in membership_tier.lower()):
                                membership_tier = 'Tier2'
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
                    profile.patreon_id = user_id  # Ensure patreon_id is set
                    if membership_tier:  # Only update if we have a tier from Patreon
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
        db.session.rollback()  # Rollback failed transaction
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
        db.session.rollback()  # Rollback failed transaction
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
        db.session.rollback()  # Rollback failed transaction
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
        db.session.rollback()  # Rollback failed transaction
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
        db.session.rollback()  # Rollback failed transaction
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
        db.session.rollback()  # Rollback failed transaction
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
        db.session.rollback()  # Rollback failed transaction
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
        db.session.rollback()  # Rollback failed transaction
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
@jwt_required(optional=True)
def get_board_snapshot(board_id):
    """Get board snapshot for Firebase fallback"""
    try:
        # Try to get user info, but allow anonymous access
        user_info = None
        try:
            user_info = get_user_info()
        except Exception as auth_error:
            # If authentication fails, allow anonymous access
            print(f"Auth optional for board snapshot: {auth_error}")
        
        # In a full implementation, this would fetch from a database
        # For now, return a minimal snapshot structure
        owner_id = user_info['id'] if user_info else 'anonymous'
        snapshot = {
            'boardId': board_id,
            'canvasState': {
                'version': 0,
                'lastUpdated': datetime.utcnow().isoformat(),
                'ownerId': owner_id,
                'actions': [],
                'metadata': {}
            },
            'presence': {},
            'notifications': []
        }
        
        # Emit socket event only if user is authenticated
        if user_info:
            socketio.emit('board_snapshot_ready', {
                'boardId': board_id,
                'userId': user_info['id']
            })
        
        return jsonify(snapshot), 200
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f"Error getting board snapshot: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to get board snapshot'}), 500

@app.route('/api/boards/<board_id>/presence', methods=['GET', 'POST'])
@jwt_required(optional=True)
def board_presence(board_id):
    """Handle board presence updates"""
    try:
        # Try to get user info, but allow anonymous access
        user_info = None
        try:
            user_info = get_user_info()
        except Exception as auth_error:
            # If authentication fails, allow anonymous access
            print(f"Auth optional for board presence: {auth_error}")
        
        # For POST requests, we need at least a userId
        if request.method == 'POST' and not user_info:
            # Try to get userId from request body
            data = request.get_json() or {}
            if not data.get('userId'):
                return jsonify({'error': 'User ID required for presence updates'}), 400
        
        if request.method == 'GET':
            # Return current presence data
            # In full implementation, fetch from database/cache
            return jsonify({'presence': {}}), 200
        else:  # POST
            # Update presence
            data = request.get_json() or {}
            
            # Use user_info if available, otherwise use data from request
            user_id = user_info['id'] if user_info else data.get('userId', 'anonymous')
            user_name = user_info['name'] if user_info else data.get('userName', 'Anonymous User')
            
            presence_data = {
                'userId': user_id,
                'name': user_name,
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
        db.session.rollback()  # Rollback failed transaction
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

    # Rise Journey Models
    class RiseJourneyQuiz(db.Model):
        __tablename__ = 'rise_journey_quizzes'
        id = db.Column(db.String(36), primary_key=True)
        user_id = db.Column(db.String(36), db.ForeignKey('user_profiles.id'), nullable=False)
        answers = db.Column(db.Text)  # JSON string of quiz answers
        recommended_level = db.Column(db.String(50))  # wellness, mobility, accountability, creativity, alignment, mindfulness, destiny
        completed_at = db.Column(db.DateTime, default=datetime.utcnow)
        
        def to_dict(self):
            return {
                'id': self.id,
                'userId': self.user_id,
                'answers': json.loads(self.answers) if self.answers else {},
                'recommendedLevel': self.recommended_level,
                'completedAt': self.completed_at.isoformat() if self.completed_at else None
            }
    
    class RiseJourneyLevel(db.Model):
        __tablename__ = 'rise_journey_levels'
        id = db.Column(db.String(36), primary_key=True)
        level_key = db.Column(db.String(50), unique=True, nullable=False)  # wellness, mobility, etc.
        title = db.Column(db.String(200), nullable=False)
        description = db.Column(db.Text)
        focus = db.Column(db.String(200))  # e.g., "Foundational Physical Health & Energy"
        revenue_products = db.Column(db.Text)  # JSON array of product recommendations
        order = db.Column(db.Integer, default=0)  # Display order
        created_at = db.Column(db.DateTime, default=datetime.utcnow)
        
        def to_dict(self):
            return {
                'id': self.id,
                'levelKey': self.level_key,
                'title': self.title,
                'description': self.description,
                'focus': self.focus,
                'revenueProducts': json.loads(self.revenue_products) if self.revenue_products else [],
                'order': self.order,
                'createdAt': self.created_at.isoformat() if self.created_at else None
            }
    
    class RiseJourneyLesson(db.Model):
        __tablename__ = 'rise_journey_lessons'
        id = db.Column(db.String(36), primary_key=True)
        level_id = db.Column(db.String(36), db.ForeignKey('rise_journey_levels.id'), nullable=False)
        title = db.Column(db.String(200), nullable=False)
        description = db.Column(db.Text)
        video_url = db.Column(db.Text)  # YouTube embed URL
        pdf_url = db.Column(db.Text)  # PDF resource URL
        order = db.Column(db.Integer, default=0)  # Lesson order within level
        created_at = db.Column(db.DateTime, default=datetime.utcnow)
        
        def to_dict(self):
            return {
                'id': self.id,
                'levelId': self.level_id,
                'title': self.title,
                'description': self.description,
                'videoUrl': self.video_url,
                'pdfUrl': self.pdf_url,
                'order': self.order,
                'createdAt': self.created_at.isoformat() if self.created_at else None
            }
    
    class RiseJourneyProgress(db.Model):
        __tablename__ = 'rise_journey_progress'
        __table_args__ = (db.UniqueConstraint('user_id', 'level_id', name='unique_user_level'),)
        id = db.Column(db.String(36), primary_key=True)
        user_id = db.Column(db.String(36), db.ForeignKey('user_profiles.id'), nullable=False)
        level_id = db.Column(db.String(36), db.ForeignKey('rise_journey_levels.id'), nullable=False)
        state = db.Column(db.String(20), default='locked')  # locked, in-progress, completed
        started_at = db.Column(db.DateTime)
        completed_at = db.Column(db.DateTime)
        created_at = db.Column(db.DateTime, default=datetime.utcnow)
        updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
        
        def to_dict(self):
            return {
                'id': self.id,
                'userId': self.user_id,
                'levelId': self.level_id,
                'state': self.state,
                'startedAt': self.started_at.isoformat() if self.started_at else None,
                'completedAt': self.completed_at.isoformat() if self.completed_at else None,
                'createdAt': self.created_at.isoformat() if self.created_at else None,
                'updatedAt': self.updated_at.isoformat() if self.updated_at else None
            }
    
    class RiseJourneyLessonProgress(db.Model):
        __tablename__ = 'rise_journey_lesson_progress'
        __table_args__ = (db.UniqueConstraint('user_id', 'lesson_id', name='unique_user_lesson'),)
        id = db.Column(db.String(36), primary_key=True)
        user_id = db.Column(db.String(36), db.ForeignKey('user_profiles.id'), nullable=False)
        lesson_id = db.Column(db.String(36), db.ForeignKey('rise_journey_lessons.id'), nullable=False)
        completed = db.Column(db.Boolean, default=False)
        completed_at = db.Column(db.DateTime)
        created_at = db.Column(db.DateTime, default=datetime.utcnow)
        updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
        
        def to_dict(self):
            return {
                'id': self.id,
                'userId': self.user_id,
                'lessonId': self.lesson_id,
                'completed': self.completed,
                'completedAt': self.completed_at.isoformat() if self.completed_at else None,
                'createdAt': self.created_at.isoformat() if self.created_at else None,
                'updatedAt': self.updated_at.isoformat() if self.updated_at else None
            }
    
    class RiseJourneyNote(db.Model):
        __tablename__ = 'rise_journey_notes'
        id = db.Column(db.String(36), primary_key=True)
        user_id = db.Column(db.String(36), db.ForeignKey('user_profiles.id'), nullable=False)
        lesson_id = db.Column(db.String(36), db.ForeignKey('rise_journey_lessons.id'), nullable=False)
        content = db.Column(db.Text)
        is_shared = db.Column(db.Boolean, default=False)  # For collaborative notes
        created_at = db.Column(db.DateTime, default=datetime.utcnow)
        updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
        
        def to_dict(self):
            return {
                'id': self.id,
                'userId': self.user_id,
                'lessonId': self.lesson_id,
                'content': self.content,
                'isShared': self.is_shared,
                'createdAt': self.created_at.isoformat() if self.created_at else None,
                'updatedAt': self.updated_at.isoformat() if self.updated_at else None
            }
    
    class RiseJourneyTrial(db.Model):
        __tablename__ = 'rise_journey_trials'
        __table_args__ = (db.UniqueConstraint('user_id', name='unique_user_trial'),)
        id = db.Column(db.String(36), primary_key=True)
        user_id = db.Column(db.String(36), db.ForeignKey('user_profiles.id'), nullable=False, unique=True)
        started_at = db.Column(db.DateTime, default=datetime.utcnow)
        expires_at = db.Column(db.DateTime, nullable=False)
        is_active = db.Column(db.Boolean, default=True)
        
        def to_dict(self):
            return {
                'id': self.id,
                'userId': self.user_id,
                'startedAt': self.started_at.isoformat() if self.started_at else None,
                'expiresAt': self.expires_at.isoformat() if self.expires_at else None,
                'isActive': self.is_active,
                'daysRemaining': max(0, (self.expires_at - datetime.utcnow()).days) if self.expires_at else 0
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
        db.session.rollback()  # Rollback failed transaction
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
        db.session.rollback()  # Rollback failed transaction
        print(f"Error fetching wellness module: {e}")
        return jsonify({'error': 'Failed to fetch module'}), 500

@require_session
@app.route('/api/wellness/activate', methods=['POST'])
def activate_wellness_module():
    """Verify activation key and transition module state"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    try:
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
        db.session.rollback()  # Rollback failed transaction
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
        db.session.rollback()  # Rollback failed transaction
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
        company = db.Column(db.String(200), nullable=True)
        phone = db.Column(db.String(50), nullable=False)
        status = db.Column(db.String(20), default='pending', nullable=False)  # pending, active, inactive, prospect
        tier = db.Column(db.String(50), nullable=True)  # starter, professional, enterprise
        notes = db.Column(db.Text, nullable=True)
        tags = db.Column(db.Text, nullable=True)  # JSON array of tags
        marketing_budget = db.Column(db.String(500), nullable=True)  # Marketing budget information
        google_analytics_property_key = db.Column(db.String(100), nullable=True)  # Google Analytics Property ID (G-XXXXXXXXXX)
        budget = db.Column(db.Numeric(10, 2), default=0, nullable=True)  # Project budget for ventures
        deadline = db.Column(db.DateTime, nullable=True)  # Project deadline for timeline calculations and alerts
        user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True, index=True)  # Link to User account
        created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
        updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
        
        # Relationships
        employee_assignments = db.relationship('ClientEmployeeAssignment', backref='client', lazy=True, cascade='all, delete-orphan')
        dashboard_connections = db.relationship('ClientDashboardConnection', backref='client', lazy=True, cascade='all, delete-orphan')
        user = db.relationship('User', backref='client_account')
        
        def to_dict(self):
            # Safely access budget and deadline - they may not exist if migration hasn't run
            budget_value = 0
            deadline_value = None
            try:
                if hasattr(self, 'budget') and self.budget is not None:
                    budget_value = float(self.budget)
            except (AttributeError, ValueError):
                pass
            
            try:
                if hasattr(self, 'deadline') and self.deadline is not None:
                    deadline_value = self.deadline.isoformat()
            except (AttributeError, ValueError):
                pass
            
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
                'marketingBudget': self.marketing_budget,
                'googleAnalyticsPropertyKey': self.google_analytics_property_key,
                'budget': budget_value,
                'deadline': deadline_value,
                'userId': self.user_id,
                'hasAccount': self.user_id is not None,
                'createdAt': self.created_at.isoformat() if self.created_at else None,
                'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
                'assignedEmployee': self.employee_assignments[0].employee_name if (self.employee_assignments and len(self.employee_assignments) > 0) else None,
                'systemsConnected': [conn.dashboard_type for conn in (self.dashboard_connections or []) if conn.enabled]
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
        user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True, index=True)  # User who created the request
        client_id = db.Column(db.String(36), db.ForeignKey('clients.id'), nullable=True, index=True)
        # Note: client_name column does not exist in database - use client_name property instead
        subject = db.Column(db.String(255), nullable=False)
        description = db.Column(db.Text, nullable=False)
        priority = db.Column(db.String(20), default='medium', nullable=False)  # low, medium, high, urgent
        status = db.Column(db.String(20), default='open', nullable=False)  # open, in-progress, resolved, closed
        assigned_to = db.Column(db.String(200), nullable=True)
        created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
        updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
        
        # Venture/Project fields
        budget = db.Column(db.Numeric(10, 2), default=0, nullable=True)
        spent = db.Column(db.Numeric(10, 2), default=0, nullable=True)
        delivery_date = db.Column(db.DateTime, nullable=True)
        start_date = db.Column(db.DateTime, nullable=True)
        progress = db.Column(db.Integer, default=0, nullable=True)
        
        # Relationships
        client = db.relationship('Client', foreign_keys=[client_id], backref='support_requests')
        user = db.relationship('User', foreign_keys=[user_id], backref='support_requests')
        
        @property
        def client_name(self):
            """Get client name from Client relationship - handles missing columns gracefully"""
            if not self.client_id:
                return None
            try:
                # Try using raw SQL first to avoid column errors
                from sqlalchemy import text
                result = db.session.execute(
                    text("SELECT name FROM clients WHERE id = :client_id"),
                    {'client_id': self.client_id}
                ).fetchone()
                if result:
                    return result[0]
            except Exception:
                pass
            # Fallback to relationship (may fail if columns missing)
            try:
                if self.client:
                    return self.client.name
            except Exception:
                pass
            return None
        
        def to_dict(self):
            # Get linked tasks
            linked_tasks = []
            linked_tasks_count = 0
            try:
                linked_tasks_query = Task.query.filter_by(support_request_id=self.id).all()
                linked_tasks_count = len(linked_tasks_query)
                linked_tasks = [
                    {
                        'id': task.id,
                        'title': task.title,
                        'description': task.description,
                        'status': task.status,
                        'assignedTo': task.assigned_to,
                        'assignedToName': task.assigned_to_name,
                    }
                    for task in linked_tasks_query
                ]
            except Exception:
                db.session.rollback()  # Rollback failed transaction
                pass  # Ignore if tasks table doesn't exist or column doesn't exist
            
            # Get client name safely - handle missing columns gracefully
            client_name_value = None
            if self.client_id:
                try:
                    # Try to get client name using raw SQL to avoid column errors
                    from sqlalchemy import text
                    result = db.session.execute(
                        text("SELECT name FROM clients WHERE id = :client_id"),
                        {'client_id': self.client_id}
                    ).fetchone()
                    if result:
                        client_name_value = result[0]
                except Exception:
                    # If that fails, try using the relationship (may fail if columns missing)
                    try:
                        if self.client:
                            client_name_value = self.client.name
                    except Exception:
                        pass
            
            return {
                'id': self.id,
                'client': client_name_value or (self.client_id if self.client_id else 'N/A'),
                'clientId': self.client_id,
                'subject': self.subject,
                'description': self.description,
                'priority': self.priority,
                'status': self.status,
                'assignedTo': self.assigned_to,
                'linkedTasks': linked_tasks,
                'linkedTasksCount': linked_tasks_count,
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
        db.session.rollback()  # Rollback failed transaction
        print(f"Error fetching crypto balance: {e}")
        return jsonify({'error': 'Failed to fetch balance'}), 500

@require_session
@app.route('/api/crypto/award', methods=['POST'])
def award_crypto():
    """Award crypto to user (admin or system function)"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    try:
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
        db.session.rollback()  # Rollback failed transaction
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
        db.session.rollback()  # Rollback failed transaction
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
                    db.session.rollback()  # Rollback failed transaction
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
                db.session.rollback()  # Rollback failed transaction
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
        db.session.rollback()  # Rollback failed transaction
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
                db.session.rollback()  # Rollback failed transaction
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
                db.session.rollback()  # Rollback failed transaction
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
            db.session.rollback()  # Rollback failed transaction
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

@app.route('/api/admin/users/<user_id>', methods=['PUT', 'DELETE', 'OPTIONS'])
@jwt_required()
def update_or_delete_user(user_id):
    """Update or delete a user (admin only)"""
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        origin = request.headers.get('Origin', 'https://ventures.isharehow.app')
        allowed_origins = ['https://ventures.isharehow.app']
        if os.environ.get('FLASK_ENV') != 'production':
            allowed_origins.extend(['http://localhost:5000', 'http://localhost:3000'])
        
        if origin in allowed_origins:
            cors_origin = origin
        else:
            cors_origin = 'https://ventures.isharehow.app'
        
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', cors_origin)
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        response.headers.add('Access-Control-Allow-Methods', 'PUT, DELETE, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        return response
    
    # Check if requester is admin
    requester = get_current_user()
    if not requester:
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
    
    is_admin = getattr(requester, 'is_admin', False)
    if not is_admin:
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
    
    # Handle PUT request - update user
    if request.method == 'PUT':
        if not DB_AVAILABLE:
            return jsonify({'error': 'Database not available'}), 500
        
        try:
            # Find user by ID, username, patreon_id, or ens_name
            user = safe_get_user(user_id)
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            data = request.get_json() or {}
            
            # Update allowed fields
            if 'email' in data and data['email']:
                if hasattr(user, 'email'):
                    user.email = data['email']
            
            if 'username' in data and data['username']:
                if hasattr(user, 'username'):
                    user.username = data['username']
            
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': 'User updated successfully',
                'user': user.to_dict() if hasattr(user, 'to_dict') else {'id': str(getattr(user, 'id', ''))}
            }), 200
        except Exception as e:
            db.session.rollback()
            print(f"Error updating user: {e}")
            return jsonify({'error': f'Failed to update user: {str(e)}'}), 500
    
    # Handle DELETE request - delete user
    if request.method == 'DELETE':
        if not DB_AVAILABLE:
            return jsonify({'error': 'Database not available'}), 500
        
        try:
            # Get user to delete
            user_to_delete = safe_get_user(user_id)
            if not user_to_delete:
                return jsonify({'error': 'User not found'}), 404
            
            # Prevent self-deletion
            requester_id = getattr(requester, 'id', None)
            user_to_delete_id = getattr(user_to_delete, 'id', None)
            if requester_id and user_to_delete_id and str(requester_id) == str(user_to_delete_id):
                return jsonify({'error': 'Cannot delete your own account'}), 400
            
            user_id_to_delete = user_to_delete.id if hasattr(user_to_delete, 'id') else user_id
            
            # Ensure user_id_to_delete is an integer
            try:
                user_id_to_delete = int(user_id_to_delete)
            except (ValueError, TypeError):
                return jsonify({'error': 'Invalid user ID format'}), 400
            
            # Delete related records first (to avoid foreign key constraints)
            try:
                from sqlalchemy import text
                from sqlalchemy.exc import ProgrammingError, OperationalError, InternalError
                
                with db.engine.connect() as conn:
                    # Use a transaction with savepoints for each operation
                    trans = conn.begin()
                    try:
                        user_id_str = str(user_id_to_delete)
                        
                        # Get user info first (before any deletes)
                        user_result = conn.execute(text("SELECT email, ens_name FROM users WHERE id = :user_id"), 
                                                  {'user_id': user_id_to_delete})
                        user_row = user_result.fetchone()
                        
                        # Helper function to execute with savepoint
                        def execute_with_savepoint(statement, params, operation_name):
                            savepoint = conn.begin_nested()
                            try:
                                conn.execute(statement, params)
                                savepoint.commit()
                            except (ProgrammingError, OperationalError, InternalError) as e:
                                savepoint.rollback()
                                app.logger.warning(f"Could not {operation_name}: {e}")
                            except Exception as e:
                                savepoint.rollback()
                                app.logger.warning(f"Unexpected error in {operation_name}: {e}")
                        
                        # Delete user profiles (linked by email or ens_name)
                        if user_row and user_row[0]:
                            execute_with_savepoint(
                                text("DELETE FROM user_profiles WHERE email = :email OR ens_name = :ens_name"),
                                {'email': user_row[0], 'ens_name': user_row[1] if user_row[1] else ''},
                                "delete user_profiles"
                            )
                        
                        # Delete client assignments
                        execute_with_savepoint(
                            text("DELETE FROM client_employee_assignments WHERE employee_id = :user_id"),
                            {'user_id': user_id_to_delete},
                            "delete client_employee_assignments"
                        )
                        
                        # Update support requests assigned_to
                        execute_with_savepoint(
                            text("UPDATE support_requests SET assigned_to = NULL WHERE assigned_to = :user_id"),
                            {'user_id': user_id_str},
                            "update support_requests"
                        )
                        
                        # Delete notifications
                        execute_with_savepoint(
                            text("DELETE FROM notifications WHERE user_id = :user_id"),
                            {'user_id': user_id_to_delete},
                            "delete notifications"
                        )
                        
                        # Delete subscriptions
                        execute_with_savepoint(
                            text("DELETE FROM subscriptions WHERE user_id = :user_id"),
                            {'user_id': user_id_to_delete},
                            "delete subscriptions"
                        )
                        
                        # Delete tasks
                        execute_with_savepoint(
                            text("DELETE FROM tasks WHERE created_by = :user_id OR assigned_to = :user_id"),
                            {'user_id': user_id_to_delete},
                            "delete tasks"
                        )
                        
                        # Finally, delete the user (this must succeed)
                        conn.execute(text("DELETE FROM users WHERE id = :user_id"), 
                                    {'user_id': user_id_to_delete})
                        
                        # Commit the transaction
                        trans.commit()
                        
                    except Exception as e:
                        # Rollback on any error
                        trans.rollback()
                        raise
                
                return jsonify({'message': 'User deleted successfully'}), 200
            except Exception as delete_error:
                db.session.rollback()
                app.logger.error(f"Error deleting user: {delete_error}")
                import traceback
                traceback.print_exc()
                return jsonify({'error': 'Failed to delete user', 'details': str(delete_error)}), 500
        except Exception as e:
            db.session.rollback()
            app.logger.error(f"Error in delete operation: {e}")
            import traceback
            traceback.print_exc()
            return jsonify({'error': 'Failed to delete user', 'details': str(e)}), 500

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
# ============================================================================
# LookUp.Cafe Game Handlers - Complete Implementation
# Fixed version with 9-digit codes, proper room management, and all handlers
# ============================================================================

import random
import string
import hashlib
import time
from datetime import datetime
from flask_socketio import emit, join_room, leave_room
from flask import request

# Game room storage (in-memory for now, Redis later)
game_rooms = {}

# Maximum players per room
MAX_PLAYERS = 16

# Room code length
ROOM_CODE_LENGTH = 9

def generate_room_code():
    """Generate a unique 9-character room code"""
    while True:
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=ROOM_CODE_LENGTH))
        if code not in game_rooms:
            return code


# Load game content on startup
DRAWING_WORDS = {}
PUZZLES = []

def load_game_content():
    """Load game content from JSON files"""
    global DRAWING_WORDS, PUZZLES
    
    try:
        # Load drawing words
        words_path = os.path.join(os.path.dirname(__file__), 'game_content', 'drawing_words.json')
        with open(words_path, 'r') as f:
            DRAWING_WORDS = json.load(f)
        print(f'[LookUp.Cafe] Loaded {sum(len(words) for words in DRAWING_WORDS.values())} drawing words')
        
        # Load puzzles
        puzzles_path = os.path.join(os.path.dirname(__file__), 'game_content', 'puzzles.json')
        with open(puzzles_path, 'r') as f:
            PUZZLES = json.load(f)
        print(f'[LookUp.Cafe] Loaded {len(PUZZLES)} puzzles')
        
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f'[LookUp.Cafe] Warning: Could not load game content: {e}')
        print('[LookUp.Cafe] Using fallback content')
        # Fallback to simple lists
        DRAWING_WORDS = {
            'easy': ['cat', 'dog', 'house', 'tree', 'car', 'sun', 'moon', 'star']
        }
        PUZZLES = [{
            'question': 'What has keys but no locks?',
            'answer': 'keyboard',
            'hints': ['Used with computers', 'Has letters'],
            'difficulty': 'easy'
        }]

def get_word_for_drawing(difficulty='easy'):
    """Get a random word for drawing game - now loads from database"""
    if not DRAWING_WORDS:
        load_game_content()
    
    # Select difficulty, fallback to easy
    word_list = DRAWING_WORDS.get(difficulty, DRAWING_WORDS.get('easy', []))
    if not word_list:
        word_list = list(DRAWING_WORDS.values())[0] if DRAWING_WORDS else ['cat', 'dog', 'house']
    
    return random.choice(word_list)

def get_puzzle(difficulty=None):
    """Get a random puzzle - now loads from database"""
    if not PUZZLES:
        load_game_content()
    
    # Filter by difficulty if specified
    if difficulty:
        filtered = [p for p in PUZZLES if p.get('difficulty') == difficulty]
        if filtered:
            return random.choice(filtered)
    
    return random.choice(PUZZLES) if PUZZLES else {
        'question': 'What has keys but no locks?',
        'answer': 'keyboard',
        'hints': ['Used with computers'],
        'difficulty': 'easy'
    }

# Call load on import
load_game_content()


# ============================================================================
# Socket Event Handlers
# ============================================================================

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
            # If roomCode is provided (from userId), convert it to 9-char code
            if len(custom_room_code) > ROOM_CODE_LENGTH:
                # Hash the userId to create a consistent 9-char code
                hash_obj = hashlib.md5(custom_room_code.encode())
                room_code = hash_obj.hexdigest()[:ROOM_CODE_LENGTH].upper()
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
            'currentPuzzle': None,
            'roundStartTime': None,
            'createdAt': time.time(),
            # Guessing game fields
            'lastActivityTime': time.time(),
            'secretWords': [],
            'currentWord': None,
            'guesses': {},
            'votes': {},
            'roundPhase': None,
        }
        join_room(room_code)
        
        print(f'[LookUp.Cafe] Room created: {room_code} by {player_name}')
        emit('game:room-created', {'room': game_rooms[room_code]})
        # Broadcast room list update
        socketio.emit('game:rooms-updated')
        
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f'[LookUp.Cafe] Error creating room: {e}')
        emit('game:error', {'message': f'Failed to create room: {str(e)}'})


@socketio.on('game:join-room')
def handle_join_room(data):
    """Join an existing game room"""
    try:
        room_code = data.get('roomCode', '').strip().upper()
        player_name = data.get('playerName', 'Guest')
        user_id = data.get('userId')
        avatar = data.get('avatar')
        player_id = request.sid
        
        # Validate room exists
        if room_code not in game_rooms:
            emit('game:error', {'message': 'Room not found. Please check the code.'})
            return
        
        room = game_rooms[room_code]
        
        # Check if room is full
        if len(room['players']) >= MAX_PLAYERS:
            emit('game:error', {'message': f'Room is full. Maximum {MAX_PLAYERS} players allowed.'})
            return
        
        existing_player = next((p for p in room['players'] if p['userId'] == user_id and user_id), None)
        if existing_player:
            # Update socket ID for reconnection
            existing_player['id'] = player_id
            existing_player['isActive'] = True
        else:
            # Add new player
            new_player = {
                'id': player_id,
                'name': player_name,
                'score': 0,
                'isHost': False,
                'isActive': True,
                'avatar': avatar,
                'userId': user_id,
            }
            room['players'].append(new_player)
        
        # Join socket.io room
        join_room(room_code)
        
        print(f'[LookUp.Cafe] Player {player_name} joined room {room_code}')
        
        # Emit to the joining player
        emit('game:room-joined', {'room': room})
        
        # Notify all players in room (including sender)
        emit('game:player-joined', {
            'player': next(p for p in room['players'] if p['id'] == player_id),
            'room': room
        }, room=room_code)
        
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f'[LookUp.Cafe] Error joining room: {e}')
        emit('game:error', {'message': f'Failed to join room: {str(e)}'})


@socketio.on('game:leave-room')
def handle_leave_room(data):
    """Leave a game room"""
    try:
        room_code = data.get('roomCode')
        player_id = request.sid
        
        if room_code not in game_rooms:
            return
        
        room = game_rooms[room_code]
        
        # Get player name before removing
        leaving_player = next((p for p in room['players'] if p['id'] == player_id), None)
        player_name = leaving_player['name'] if leaving_player else 'Unknown'
        
        # Remove player
        room['players'] = [p for p in room['players'] if p['id'] != player_id]
        
        # Leave socket.io room
        leave_room(room_code)
        
        # If room is empty, delete it
        if not room['players']:
            del game_rooms[room_code]
            print(f'[LookUp.Cafe] Room {room_code} deleted (empty)')
            return
        
        # If host left, assign new host
        if room['hostId'] == player_id and room['players']:
            room['players'][0]['isHost'] = True
            room['hostId'] = room['players'][0]['id']
            print(f'[LookUp.Cafe] New host assigned in room {room_code}: {room["players"][0]["name"]}')
        
        print(f'[LookUp.Cafe] Player {player_name} left room {room_code}')
        
        # Notify others
        emit('game:player-left', {
            'playerId': player_id,
            'playerName': player_name,
            'room': room
        }, room=room_code)
        
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f'[LookUp.Cafe] Error leaving room: {e}')


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
            emit('game:error', {'message': 'Need at least 2 players to start'})
            return
        
        # Validate game type
        if game_type not in ['guessing', 'drawing', 'puzzle']:
            emit('game:error', {'message': 'Invalid game type'})
            return
        
        # Update room state
        room['gameType'] = game_type
        room['state'] = 'playing'
        room['currentRound'] = 1
        room['maxRounds'] = max_rounds
        room['roundStartTime'] = time.time()
        
        # Game-specific setup
        if game_type == 'drawing':
            room['currentDrawerId'] = room['players'][0]['id']
            room['currentWord'] = get_word_for_drawing()
        elif game_type == 'puzzle':
            room['currentPuzzle'] = get_puzzle()
        elif game_type == 'guessing':
            # Select first clue giver
            room['roundPhase'] = None  # Host needs to set words first
            room['currentDrawerId'] = room['players'][0]['id']  # Reuse as clue giver
        
        print(f'[LookUp.Cafe] Game started in room {room_code}: {game_type}')
        
        # Notify all players
        emit('game:started', {'room': room}, room=room_code)
        
        # Send round start with word only to drawer (for drawing game)
        if game_type == 'drawing':
            # Send word to drawer
            emit('game:round-start', {
                'room': room,
                'word': room['currentWord'],
                'isDrawer': True
            }, room=room['currentDrawerId'])
            
            # Send round start without word to others
            for player in room['players']:
                if player['id'] != room['currentDrawerId']:
                    emit('game:round-start', {
                        'room': room,
                        'word': None,
                        'isDrawer': False
                    }, room=player['id'])
        elif game_type == 'puzzle':
            # Send puzzle to everyone
            emit('game:round-start', {
                'room': room,
                'puzzle': room['currentPuzzle']
            }, room=room_code)
        else:
            # Guessing game
            emit('game:round-start', {
                'room': room,
                'clueGiverId': room['currentDrawerId']
            }, room=room_code)
        
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f'[LookUp.Cafe] Error starting game: {e}')
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
        
        # Get player info
        player = next((p for p in room['players'] if p['id'] == player_id), None)
        if not player:
            return
        
        correct = False
        points = 0
        
        # Check answer based on game type
        if room['gameType'] == 'drawing':
            correct_word = room.get('currentWord', '').lower()
            if answer == correct_word and player_id != room['currentDrawerId']:
                correct = True
                points = 100
                player['score'] += points
                
                print(f'[LookUp.Cafe] Correct answer in room {room_code}: {player["name"]} guessed {answer}')
                
                # Notify all players
                emit('game:correct-answer', {
                    'playerId': player_id,
                    'playerName': player['name'],
                    'answer': answer,
                    'points': points
                }, room=room_code)
        
        elif room['gameType'] == 'puzzle':
            correct_answer = room.get('currentPuzzle', {}).get('answer', '').lower()
            if answer == correct_answer:
                correct = True
                points = 200  # Team points for puzzle
                # Award points to all players
                for p in room['players']:
                    p['score'] += points
                
                print(f'[LookUp.Cafe] Puzzle solved in room {room_code} by {player["name"]}')
                
                # Notify all players
                emit('game:puzzle-solved', {
                    'playerId': player_id,
                    'playerName': player['name'],
                    'answer': answer,
                    'points': points
                }, room=room_code)
        
        elif room['gameType'] == 'guessing':
            # Store guess for evaluation (implement proper logic based on your game rules)
            emit('game:guess-submitted', {
                'playerId': player_id,
                'playerName': player['name'],
                'guess': answer
            }, room=room_code)
        
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f'[LookUp.Cafe] Error submitting answer: {e}')


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
        db.session.rollback()  # Rollback failed transaction
        print(f'[LookUp.Cafe] Error handling draw: {e}')


@socketio.on('game:clear-canvas')
def handle_clear_canvas(data):
    """Clear the canvas for all players"""
    try:
        room_code = data.get('roomCode')
        
        if room_code not in game_rooms:
            return
        
        room = game_rooms[room_code]
        player_id = request.sid
        
        # Only drawer can clear canvas
        if room.get('currentDrawerId') != player_id:
            return
        
        emit('game:canvas-cleared', {}, room=room_code)
        
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f'[LookUp.Cafe] Error clearing canvas: {e}')


@socketio.on('game:next-round')
def handle_next_round(data):
    """Start the next round"""
    try:
        room_code = data.get('roomCode')
        player_id = request.sid
        
        if room_code not in game_rooms:
            return
        
        room = game_rooms[room_code]
        
        # Only host can advance rounds
        if room['hostId'] != player_id:
            return
        
        # Check if game is over
        if room['currentRound'] >= room['maxRounds']:
            room['state'] = 'gameEnd'
            emit('game:ended', {'room': room}, room=room_code)
            return
        
        # Advance round
        room['currentRound'] += 1
        room['roundStartTime'] = time.time()
        
        # Rotate drawer/clue giver
        if room['gameType'] in ['drawing', 'guessing']:
            current_index = next((i for i, p in enumerate(room['players']) if p['id'] == room['currentDrawerId']), 0)
            next_index = (current_index + 1) % len(room['players'])
            room['currentDrawerId'] = room['players'][next_index]['id']
            
            if room['gameType'] == 'drawing':
                room['currentWord'] = get_word_for_drawing()
        
        elif room['gameType'] == 'puzzle':
            room['currentPuzzle'] = get_puzzle()
        
        # Emit round start
        emit('game:round-start', {'room': room}, room=room_code)
        
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f'[LookUp.Cafe] Error starting next round: {e}')


@socketio.on('game:chat')
def handle_chat(data):
    """Handle chat messages"""
    try:
        room_code = data.get('roomCode')
        message = data.get('message', '').strip()
        player_id = request.sid
        
        if not message or room_code not in game_rooms:
            return
        
        room = game_rooms[room_code]
        player = next((p for p in room['players'] if p['id'] == player_id), None)
        
        if not player:
            return
        
        # Broadcast chat message
        emit('game:chat-message', {
            'playerId': player_id,
            'playerName': player['name'],
            'message': message,
            'timestamp': time.time()
        }, room=room_code)
        
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f'[LookUp.Cafe] Error handling chat: {e}')


@socketio.on('disconnect')
def handle_disconnect():
    """Handle player disconnect"""
    try:
        player_id = request.sid
        
        # Find and remove player from any room they're in
        for room_code, room in list(game_rooms.items()):
            player = next((p for p in room['players'] if p['id'] == player_id), None)
            if player:
                player_name = player['name']
                
                # Mark as inactive instead of removing immediately (allow reconnection)
                player['isActive'] = False
                
                print(f'[LookUp.Cafe] Player {player_name} disconnected from room {room_code}')
                
                # Notify others
                emit('game:player-disconnected', {
                    'playerId': player_id,
                    'playerName': player_name
                }, room=room_code)
                
                # Clean up after 30 seconds if still inactive
                # (In production, use a background task)
                break
        
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f'[LookUp.Cafe] Error handling disconnect: {e}')



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
        db.session.rollback()  # Rollback failed transaction
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
        db.session.rollback()  # Rollback failed transaction
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
        db.session.rollback()  # Rollback failed transaction
        print(f"Error getting wellness metrics: {e}")
        return jsonify({'error': 'Failed to get wellness metrics'}), 500


# ============================================
# Rise Journey API Endpoints
# ============================================

@require_session
@app.route('/api/rise-journey/quiz', methods=['POST'])
def submit_rise_journey_quiz():
    """Submit quiz answers and get recommended starting level"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    profile, error_response, error_code = get_or_create_user_profile()
    if error_response:
        return error_response, error_code
    
    try:
        data = request.json
        answers = data.get('answers', {})
        
        if not answers:
            return jsonify({'error': 'No answers provided'}), 400
        
        # Simple scoring algorithm - can be enhanced
        scores = {
            'wellness': 0,
            'mobility': 0,
            'accountability': 0,
            'creativity': 0,
            'alignment': 0,
            'mindfulness': 0,
            'destiny': 0
        }
        
        # Question ID to category mapping (matches frontend quiz structure)
        question_categories = {
            'q1': 'wellness',      # Physical health and energy
            'q2': 'mobility',      # Movement/exercise
            'q3': 'accountability', # Responsibility/self-love
            'q4': 'creativity',    # Creative expression
            'q5': 'alignment',     # Alignment/intention
            'q6': 'mindfulness',   # Meditation/mindfulness
            'q7': 'destiny'        # Higher purpose
        }
        
        # Map answers to level scores based on question categories
        for question_id, answer_value in answers.items():
            category = question_categories.get(question_id)
            if category and category in scores:
                # Lower scores indicate areas needing more work
                # So we add the inverse (6 - value) to make lower answers = higher need
                value = answer_value if isinstance(answer_value, (int, float)) else 1
                scores[category] += (6 - value)  # Invert so lower answers = higher score (more need)
        
        # Find highest score (area needing most work) or default to wellness
        # If all scores are 0, default to wellness
        if all(score == 0 for score in scores.values()):
            recommended_level = 'wellness'
        else:
            recommended_level = max(scores, key=scores.get)
        
        # Save quiz result
        quiz = RiseJourneyQuiz(
            id=str(uuid.uuid4()),
            user_id=profile.id,
            answers=json.dumps(answers),
            recommended_level=recommended_level
        )
        db.session.add(quiz)
        
        # Start 7-day trial if not already started
        trial = RiseJourneyTrial.query.filter_by(user_id=profile.id).first()
        if not trial:
            trial = RiseJourneyTrial(
                id=str(uuid.uuid4()),
                user_id=profile.id,
                expires_at=datetime.utcnow() + timedelta(days=7)
            )
            db.session.add(trial)
        
        db.session.commit()
        
        return jsonify({
            'recommendedLevel': recommended_level,
            'scores': scores,
            'trial': trial.to_dict() if trial else None
        })
    except KeyError as e:
        db.session.rollback()
        print(f"Error submitting quiz - missing key: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Missing required data: {str(e)}'}), 400
    except AttributeError as e:
        db.session.rollback()
        print(f"Error submitting quiz - attribute error: {e}")
        import traceback
        traceback.print_exc()
        error_msg = str(e)
        if 'RiseJourneyQuiz' in error_msg or 'RiseJourneyTrial' in error_msg:
            return jsonify({
                'error': 'Database tables not found',
                'message': 'Rise Journey tables may not exist. Please run the database migration.',
                'detail': error_msg
            }), 500
        return jsonify({'error': f'Database error: {error_msg}'}), 500
    except Exception as e:
        db.session.rollback()
        error_msg = str(e)
        print(f"Error submitting quiz: {e}")
        import traceback
        traceback.print_exc()
        
        # Check for common database errors
        if 'relation' in error_msg.lower() and 'does not exist' in error_msg.lower():
            return jsonify({
                'error': 'Database tables not found',
                'message': 'Rise Journey tables may not exist. Please run the database migration: flask db upgrade',
                'detail': error_msg
            }), 500
        elif 'foreign key' in error_msg.lower():
            return jsonify({
                'error': 'Database constraint error',
                'message': 'User profile may not exist. Please ensure you have a valid user profile.',
                'detail': error_msg
            }), 500
        
        return jsonify({
            'error': 'Failed to submit quiz',
            'message': error_msg
        }), 500

@require_session
@app.route('/api/rise-journey/quiz', methods=['GET'])
def get_rise_journey_quiz():
    """Get user's quiz result if completed"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    profile, error_response, error_code = get_or_create_user_profile()
    if error_response:
        return error_response, error_code
    
    try:
        quiz = RiseJourneyQuiz.query.filter_by(user_id=profile.id).order_by(RiseJourneyQuiz.completed_at.desc()).first()
        if quiz:
            return jsonify({'quiz': quiz.to_dict()})
        return jsonify({'quiz': None})
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f"Error getting quiz: {e}")
        return jsonify({'error': 'Failed to get quiz'}), 500

@require_session
@app.route('/api/rise-journey/trial', methods=['GET'])
def get_rise_journey_trial():
    """Get user's trial status"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    profile, error_response, error_code = get_or_create_user_profile()
    if error_response:
        return error_response, error_code
    
    try:
        trial = RiseJourneyTrial.query.filter_by(user_id=profile.id).first()
        if trial:
            # Check if trial is still active
            if trial.expires_at < datetime.utcnow():
                trial.is_active = False
                db.session.commit()
            return jsonify({'trial': trial.to_dict()})
        return jsonify({'trial': None})
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f"Error getting trial: {e}")
        return jsonify({'error': 'Failed to get trial'}), 500

@require_session
@app.route('/api/rise-journey/access', methods=['GET'])
def check_rise_journey_access():
    """Check if user has full access to Rise Journey (Tier2, lifetime support > $50, admin, employee, or isharehow user)"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    profile, error_response, error_code = get_or_create_user_profile()
    if error_response:
        return error_response, error_code
    
    try:
        has_full_access = False
        reason = None
        
        # Get the User object to check admin/employee status
        user = None
        user_id = get_jwt_identity()
        if user_id:
            user_id_str = str(user_id)
            if user_id_str.isdigit():
                user = User.query.get(int(user_id_str))
            if not user:
                user = User.query.filter_by(username=user_id_str).first()
            if not user:
                user = User.query.filter_by(patreon_id=user_id_str).first()
        
        # Check if user is admin
        is_admin = False
        is_employee = False
        is_isharehow = False
        
        if user:
            # Check is_admin field
            if hasattr(user, 'is_admin'):
                is_admin = bool(user.is_admin)
            
            # Check is_employee field
            if hasattr(user, 'is_employee'):
                is_employee = bool(user.is_employee)
            
            # Check special identifiers for admin/isharehow
            if not is_admin:
                # Check patreon_id
                if hasattr(user, 'patreon_id') and user.patreon_id == '56776112':
                    is_admin = True
                # Check username (case-insensitive)
                elif hasattr(user, 'username') and user.username:
                    username_lower = user.username.lower()
                    if username_lower in ['isharehow', 'admin']:
                        is_admin = True
                        if username_lower == 'isharehow':
                            is_isharehow = True
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
                        if user_id_str == 'isharehow':
                            is_isharehow = True
            
            # Also check profile ID for isharehow
            if profile.id and 'isharehow' in str(profile.id).lower():
                is_isharehow = True
        
        # Grant access if admin, employee, or isharehow user
        if is_admin:
            has_full_access = True
            reason = 'Admin access'
        elif is_employee:
            has_full_access = True
            reason = 'Employee access'
        elif is_isharehow:
            has_full_access = True
            reason = 'iShareHow user access'
        # Check if user has Tier2 membership
        elif profile.membership_tier and ('tier2' in profile.membership_tier.lower() or 'vip' in profile.membership_tier.lower() or 'vanity' in profile.membership_tier.lower()):
            has_full_access = True
            reason = 'Tier2 membership'
        # Check if lifetime support is over $50
        elif profile.lifetime_support_amount and float(profile.lifetime_support_amount) >= 50.0:
            has_full_access = True
            reason = 'Lifetime support over $50'
        
        return jsonify({
            'hasFullAccess': has_full_access,
            'reason': reason,
            'membershipTier': profile.membership_tier,
            'lifetimeSupportAmount': float(profile.lifetime_support_amount) if profile.lifetime_support_amount else 0,
            'patreonId': profile.patreon_id,
            'isAdmin': is_admin,
            'isEmployee': is_employee,
            'isIsharehow': is_isharehow
        })
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f"Error checking Rise Journey access: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to check access'}), 500

@require_session
@app.route('/api/rise-journey/levels', methods=['GET'])
def get_rise_journey_levels():
    """Get all journey levels with user progress"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    profile, error_response, error_code = get_or_create_user_profile()
    if error_response:
        return error_response, error_code
    
    try:
        levels = RiseJourneyLevel.query.order_by(RiseJourneyLevel.order).all()
        
        # If no levels exist, try to seed them
        if len(levels) == 0:
            print("⚠ No levels found, attempting to seed...")
            try:
                with app.app_context():
                    seed_rise_journey_levels()
                # Query again after seeding
                levels = RiseJourneyLevel.query.order_by(RiseJourneyLevel.order).all()
                print(f"✓ After seeding, found {len(levels)} levels")
            except Exception as seed_error:
                db.session.rollback()  # Rollback failed transaction
                print(f"⚠ Failed to seed levels: {seed_error}")
                import traceback
                traceback.print_exc()
        
        progress_records = {p.level_id: p for p in RiseJourneyProgress.query.filter_by(user_id=profile.id).all()}
        
        result = []
        for level in levels:
            level_dict = level.to_dict()
            progress = progress_records.get(level.id)
            level_dict['progress'] = progress.to_dict() if progress else {'state': 'locked', 'startedAt': None, 'completedAt': None}
            result.append(level_dict)
        
        return jsonify({'levels': result})
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f"Error getting levels: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to get levels'}), 500

@require_session
@app.route('/api/rise-journey/levels/<level_id>/lessons', methods=['GET'])
def get_rise_journey_lessons(level_id):
    """Get lessons for a specific level"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    profile, error_response, error_code = get_or_create_user_profile()
    if error_response:
        return error_response, error_code
    
    try:
        lessons = RiseJourneyLesson.query.filter_by(level_id=level_id).order_by(RiseJourneyLesson.order).all()
        progress_records = {p.lesson_id: p for p in RiseJourneyLessonProgress.query.filter_by(user_id=profile.id).all()}
        
        result = []
        for lesson in lessons:
            lesson_dict = lesson.to_dict()
            progress = progress_records.get(lesson.id)
            lesson_dict['progress'] = progress.to_dict() if progress else {'completed': False, 'completedAt': None}
            result.append(lesson_dict)
        
        return jsonify({'lessons': result})
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f"Error getting lessons: {e}")
        return jsonify({'error': 'Failed to get lessons'}), 500

@require_session
@app.route('/api/rise-journey/lessons/<lesson_id>/notes', methods=['GET'])
def get_rise_journey_notes(lesson_id):
    """Get notes for a lesson (user's own and shared notes)"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    profile, error_response, error_code = get_or_create_user_profile()
    if error_response:
        return error_response, error_code
    
    try:
        # Get user's own note
        user_note = RiseJourneyNote.query.filter_by(user_id=profile.id, lesson_id=lesson_id).first()
        
        # Get shared notes from other users
        shared_notes = RiseJourneyNote.query.filter(
            RiseJourneyNote.lesson_id == lesson_id,
            RiseJourneyNote.is_shared == True,
            RiseJourneyNote.user_id != profile.id
        ).all()
        
        return jsonify({
            'userNote': user_note.to_dict() if user_note else None,
            'sharedNotes': [note.to_dict() for note in shared_notes]
        })
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f"Error getting notes: {e}")
        return jsonify({'error': 'Failed to get notes'}), 500

@require_session
@app.route('/api/rise-journey/lessons/<lesson_id>/notes', methods=['POST', 'PUT'])
def save_rise_journey_note(lesson_id):
    """Save or update notes for a lesson"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    profile, error_response, error_code = get_or_create_user_profile()
    if error_response:
        return error_response, error_code
    
    try:
        data = request.json
        content = data.get('content', '')
        is_shared = data.get('isShared', False)
        
        note = RiseJourneyNote.query.filter_by(user_id=profile.id, lesson_id=lesson_id).first()
        
        if note:
            note.content = content
            note.is_shared = is_shared
            note.updated_at = datetime.utcnow()
        else:
            note = RiseJourneyNote(
                id=str(uuid.uuid4()),
                user_id=profile.id,
                lesson_id=lesson_id,
                content=content,
                is_shared=is_shared
            )
            db.session.add(note)
        
        db.session.commit()
        return jsonify({'note': note.to_dict()})
    except Exception as e:
        db.session.rollback()
        print(f"Error saving note: {e}")
        return jsonify({'error': 'Failed to save note'}), 500

@require_session
@app.route('/api/rise-journey/lessons/<lesson_id>/complete', methods=['POST'])
def complete_rise_journey_lesson(lesson_id):
    """Mark a lesson as completed"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    profile, error_response, error_code = get_or_create_user_profile()
    if error_response:
        return error_response, error_code
    
    try:
        progress = RiseJourneyLessonProgress.query.filter_by(user_id=profile.id, lesson_id=lesson_id).first()
        
        if progress:
            progress.completed = True
            progress.completed_at = datetime.utcnow()
        else:
            progress = RiseJourneyLessonProgress(
                id=str(uuid.uuid4()),
                user_id=profile.id,
                lesson_id=lesson_id,
                completed=True,
                completed_at=datetime.utcnow()
            )
            db.session.add(progress)
        
        # Flush the session to make the current lesson's completion visible to subsequent queries
        db.session.flush()
        
        # Check if all lessons in level are completed
        lesson = RiseJourneyLesson.query.get(lesson_id)
        if lesson:
            all_lessons = RiseJourneyLesson.query.filter_by(level_id=lesson.level_id).all()
            completed_lessons = RiseJourneyLessonProgress.query.filter(
                RiseJourneyLessonProgress.user_id == profile.id,
                RiseJourneyLessonProgress.completed == True,
                RiseJourneyLessonProgress.lesson_id.in_([l.id for l in all_lessons])
            ).count()
            
            if completed_lessons >= len(all_lessons):
                # Mark level as completed
                level_progress = RiseJourneyProgress.query.filter_by(user_id=profile.id, level_id=lesson.level_id).first()
                if level_progress:
                    level_progress.state = 'completed'
                    level_progress.completed_at = datetime.utcnow()
                else:
                    level_progress = RiseJourneyProgress(
                        id=str(uuid.uuid4()),
                        user_id=profile.id,
                        level_id=lesson.level_id,
                        state='completed',
                        completed_at=datetime.utcnow()
                    )
                    db.session.add(level_progress)
        
        db.session.commit()
        return jsonify({'success': True, 'progress': progress.to_dict()})
    except Exception as e:
        db.session.rollback()
        print(f"Error completing lesson: {e}")
        return jsonify({'error': 'Failed to complete lesson'}), 500

@require_session
@app.route('/api/rise-journey/levels/<level_id>/start', methods=['POST'])
def start_rise_journey_level(level_id):
    """Start a journey level"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 503
    
    profile, error_response, error_code = get_or_create_user_profile()
    if error_response:
        return error_response, error_code
    
    try:
        progress = RiseJourneyProgress.query.filter_by(user_id=profile.id, level_id=level_id).first()
        
        if progress:
            if progress.state == 'locked':
                progress.state = 'in-progress'
                progress.started_at = datetime.utcnow()
        else:
            progress = RiseJourneyProgress(
                id=str(uuid.uuid4()),
                user_id=profile.id,
                level_id=level_id,
                state='in-progress',
                started_at=datetime.utcnow()
            )
            db.session.add(progress)
        
        db.session.commit()
        return jsonify({'progress': progress.to_dict()})
    except Exception as e:
        db.session.rollback()
        print(f"Error starting level: {e}")
        return jsonify({'error': 'Failed to start level'}), 500

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
            app.logger.warning(f"Missing API key in intervals_proxy_activities")
            return jsonify({'error': 'Missing X-Intervals-API-Key header'}), 401
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
                return jsonify({
                    'error': 'Intervals.icu API error',
                    'detail': error_data,
                    'statusCode': response.status_code
                }), response.status_code
            except:
                return jsonify({
                    'error': 'Intervals.icu API error',
                    'detail': {'error': response.text[:200], 'status': response.status_code},
                    'statusCode': response.status_code
                }), response.status_code
        
        # Try to parse as JSON to validate
        try:
            data = response.json()
            return jsonify(data), 200
        except ValueError as e:
            db.session.rollback()  # Rollback failed transaction
            app.logger.error(f"Failed to parse JSON response: {e}")
            return jsonify({'error': 'Invalid JSON response from Intervals.icu'}), 502
        
    except requests.RequestException as e:
        app.logger.error(f"Request exception in intervals_proxy_activities: {e}")
        return jsonify({'error': 'Upstream request failed', 'detail': str(e)}), 502
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
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
            db.session.rollback()  # Rollback failed transaction
            app.logger.error(f"Failed to parse JSON response: {e}")
            return jsonify({'error': 'Invalid JSON response from Intervals.icu'}), 502
        
    except requests.RequestException as e:
        app.logger.error(f"Request exception in intervals_proxy_wellness: {e}")
        return jsonify({'error': 'Upstream request failed', 'detail': str(e)}), 502
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        app.logger.error(f"Unexpected error in intervals_proxy_wellness: {e}", exc_info=True)
        return jsonify({'error': 'Internal server error', 'detail': str(e)}), 500


# ============================================
# Intervals.icu FTP Endpoint
# ============================================

@app.route('/api/intervals-proxy/athlete', methods=['GET', 'OPTIONS'])
def intervals_proxy_athlete():
    """Proxy endpoint to get athlete data including current FTP"""
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        api_key = request.headers.get('X-Intervals-API-Key', '').strip()
        
        if not api_key:
            app.logger.warning(f"Missing API key in intervals_proxy_athlete")
            return jsonify({'error': 'Missing X-Intervals-API-Key header', 'detail': {'error': 'Unauthorized', 'status': 401}}), 401
        
        # Intervals.icu uses basic auth with username "API_KEY" and password as the API key
        # Use "0" for athlete_id to use the athlete associated with the API key
        import base64
        auth_string = f"API_KEY:{api_key}"
        auth_header = f"Basic {base64.b64encode(auth_string.encode('utf-8')).decode('utf-8')}"
        
        response = requests.get(
            f'https://intervals.icu/api/v1/athlete/0',
            headers={'Authorization': auth_header},
            timeout=(5, 30)
        )
        
        # Check if response is successful
        if response.status_code >= 400:
            app.logger.error(f"Intervals.icu API error: {response.status_code} - {response.text[:200]}")
            try:
                error_data = response.json()
                # Return more detailed error information
                return jsonify({
                    'error': 'Intervals.icu API error',
                    'detail': error_data,
                    'statusCode': response.status_code,
                    'message': error_data.get('error', 'Unauthorized') if isinstance(error_data, dict) else str(error_data)
                }), response.status_code
            except:
                return jsonify({
                    'error': 'Intervals.icu API error',
                    'detail': {'error': response.text[:200], 'status': response.status_code},
                    'statusCode': response.status_code
                }), response.status_code
        
        # Try to parse as JSON to validate
        try:
            data = response.json()
            return jsonify(data), 200
        except ValueError as e:
            db.session.rollback()  # Rollback failed transaction
            app.logger.error(f"Failed to parse JSON response: {e}")
            return jsonify({'error': 'Invalid JSON response from Intervals.icu'}), 502
        
    except requests.RequestException as e:
        app.logger.error(f"Request exception in intervals_proxy_athlete: {e}")
        return jsonify({'error': 'Upstream request failed', 'detail': str(e)}), 502
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        app.logger.error(f"Unexpected error in intervals_proxy_athlete: {e}", exc_info=True)
        return jsonify({'error': 'Internal server error', 'detail': str(e)}), 500


@socketio.on('game:set-type')
def handle_set_game_type(data):
    """Set the game type for a room (host only, before starting)"""
    try:
        room_code = data.get('roomCode')
        game_type = data.get('gameType')
        player_id = request.sid
        
        if room_code not in game_rooms:
            emit('game:error', {'message': 'Room not found'})
            return
        
        room = game_rooms[room_code]
        
        # Verify host
        if room['hostId'] != player_id:
            emit('game:error', {'message': 'Only host can set game type'})
            return
        
        # Validate game type
        if game_type not in ['guessing', 'drawing', 'puzzle']:
            emit('game:error', {'message': 'Invalid game type'})
            return
        
        # Set game type
        room['gameType'] = game_type
        
        print(f'[LookUp.Cafe] Game type set to {game_type} in room {room_code}')
        
        # Notify all players in room
        emit('game:type-set', {'room': room}, room=room_code)
        
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f'[LookUp.Cafe] Error setting game type: {e}')
        emit('game:error', {'message': f'Failed to set game type: {str(e)}'})


# ============================================================================
# Guessing Game Handlers
# ============================================================================

@socketio.on('guessing:set-words')
def handle_set_words(data):
    """Host sets the 5 secret words for all rounds"""
    try:
        room_code = data.get('roomCode', '').strip().upper()
        words = data.get('words', [])
        
        if room_code not in game_rooms:
            emit('game:error', {'message': 'Room not found'})
            return
        
        room = game_rooms[room_code]
        player_id = request.sid
        
        # Only host can set words
        if player_id != room['hostId']:
            emit('game:error', {'message': 'Only host can set words'})
            return
        
        # Validate words
        if not isinstance(words, list) or len(words) != 5:
            emit('game:error', {'message': 'Must provide exactly 5 words'})
            return
        
        # Clean and validate each word
        cleaned_words = []
        for word in words:
            if not word or not isinstance(word, str):
                emit('game:error', {'message': 'All words must be non-empty strings'})
                return
            cleaned = word.strip().lower()
            if not cleaned:
                emit('game:error', {'message': 'Words cannot be empty'})
                return
            cleaned_words.append(cleaned)
        
        # Check for duplicates
        if len(set(cleaned_words)) != len(cleaned_words):
            emit('game:error', {'message': 'All words must be unique'})
            return
        
        # Initialize guessing game state
        room['secretWords'] = cleaned_words
        room['currentWord'] = cleaned_words[0]  # Start with first word
        room['guesses'] = {}  # {playerId: {guess: str, timestamp: float}}
        room['votes'] = {}  # {playerId: votedForPlayerId}
        room['roundPhase'] = 'guessing'  # 'guessing' | 'voting' | 'results'
        room['state'] = 'playing'
        room['currentRound'] = 1
        room['roundStartTime'] = time.time()
        
        print(f'[LookUp.Cafe] Words set for room {room_code}: {len(cleaned_words)} words')
        
        # Notify all players words are set and game is starting
        emit('guessing:words-set', {
            'room': room,
            'message': 'Game starting! Round 1 begins now.',
            'roundPhase': 'guessing'
        }, room=room_code)
        
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f'[LookUp.Cafe] Error setting words: {e}')
        emit('game:error', {'message': f'Failed to set words: {str(e)}'})


@socketio.on('guessing:submit-guess')
def handle_submit_guess(data):
    """Player submits their guess for the current word"""
    try:
        room_code = data.get('roomCode', '').strip().upper()
        guess = data.get('guess', '').strip()
        
        if room_code not in game_rooms:
            emit('game:error', {'message': 'Room not found'})
            return
        
        room = game_rooms[room_code]
        player_id = request.sid
        
        # Validate player is in room
        player = next((p for p in room['players'] if p['id'] == player_id), None)
        if not player:
            emit('game:error', {'message': 'You are not in this room'})
            return
        
        
        # Prevent host from guessing (they set the word)
        if player_id == room['hostId']:
            emit('game:error', {'message': 'Host cannot submit guesses'})
            return
        # Check game state
        if room.get('state') != 'playing':
            emit('game:error', {'message': 'Game is not in progress'})
            return
        
        if room.get('roundPhase') != 'guessing':
            emit('game:error', {'message': 'Not in guessing phase'})
            return
        
        # Validate guess
        if not guess:
            emit('game:error', {'message': 'Guess cannot be empty'})
            return
        
        # Store guess
        if 'guesses' not in room:
            room['guesses'] = {}
        
        room['guesses'][player_id] = {
            'guess': guess.lower(),
            'playerName': player['name'],
            'timestamp': time.time()
        }
        
        print(f'[LookUp.Cafe] Player {player["name"]} submitted guess in room {room_code}')
        
        # Notify all players (anonymized - don't show which player guessed what yet)
        emit('guessing:guess-submitted', {
            'totalGuesses': len(room['guesses']),
            'totalPlayers': len([p for p in room['players'] if p['isActive'] and p['id'] != room['hostId']]),
            'playerId': player_id  # Only send to that player so they know it was received
        }, room=room_code)
        
        active_non_host_players = [p for p in room['players'] if p['isActive'] and p['id'] != room['hostId']]
        if len(room['guesses']) >= len(active_non_host_players):
            # Move to voting phase
            room['roundPhase'] = 'voting'
            room['votes'] = {}
            
            print(f'[LookUp.Cafe] Moving to voting phase in room {room_code}')
            
            # Send all guesses for voting (still anonymized until results)
            guesses_for_voting = [
                {
                    'id': pid,
                    'guess': g['guess'],
                    'canVote': pid != player_id  # Can't vote for yourself
                }
                for pid, g in room['guesses'].items()
            ]
            
            emit('guessing:phase-changed', {
                'roundPhase': 'voting',
                'guesses': guesses_for_voting,
                'message': 'All guesses are in! Time to vote for the best guess.'
            }, room=room_code)
        
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f'[LookUp.Cafe] Error submitting guess: {e}')
        emit('game:error', {'message': f'Failed to submit guess: {str(e)}'})


@socketio.on('guessing:vote')
def handle_vote(data):
    """Player votes for the best guess"""
    try:
        room_code = data.get('roomCode', '').strip().upper()
        voted_for_player_id = data.get('votedForPlayerId')
        
        if room_code not in game_rooms:
            emit('game:error', {'message': 'Room not found'})
            return
        
        room = game_rooms[room_code]
        player_id = request.sid
        
        # Validate player is in room
        player = next((p for p in room['players'] if p['id'] == player_id), None)
        if not player:
            emit('game:error', {'message': 'You are not in this room'})
            return
        
        # Check phase
        if room.get('roundPhase') != 'voting':
            emit('game:error', {'message': 'Not in voting phase'})
        
        # Prevent host from voting
        if player_id == room['hostId']:
            emit('game:error', {'message': 'Host cannot vote'})
            return
            return
        
        # Can't vote for yourself
        if voted_for_player_id == player_id:
            emit('game:error', {'message': 'Cannot vote for your own guess'})
            return
        
        # Validate the voted player exists and has a guess
        if voted_for_player_id not in room.get('guesses', {}):
            emit('game:error', {'message': 'Invalid vote target'})
            return
        
        # Store vote
        if 'votes' not in room:
            room['votes'] = {}
        
        room['votes'][player_id] = voted_for_player_id
        
        print(f'[LookUp.Cafe] Player {player["name"]} voted in room {room_code}')
        
        # Notify vote received
        emit('guessing:vote-received', {
            'totalVotes': len(room['votes']),
            'totalPlayers': len([p for p in room['players'] if p['isActive'] and p['id'] in room['guesses']])
        }, room=room_code)
        
        # Check if all players who guessed have voted (can't vote if you didn't guess)
        players_who_guessed = list(room['guesses'].keys())
        if len(room['votes']) >= len(players_who_guessed):
            # Calculate results
            vote_counts = {}
            for voted_for in room['votes'].values():
                vote_counts[voted_for] = vote_counts.get(voted_for, 0) + 1
            
            # Find winner (most votes)
            if vote_counts:
                winner_id = max(vote_counts.items(), key=lambda x: x[1])[0]
                winner_guess = room['guesses'][winner_id]
                winner_player = next((p for p in room['players'] if p['id'] == winner_id), None)
                
                # Award points
                if winner_player:
                    winner_player['score'] += 10
                
                # Prepare results
                results = {
                    'winnerId': winner_id,
                    'winnerName': winner_player['name'] if winner_player else 'Unknown',
                    'winnerGuess': winner_guess['guess'],
                    'voteCount': vote_counts[winner_id],
                    'secretWord': room['currentWord'],
                    'allGuesses': [
                        {
                            'playerId': pid,
                            'playerName': room['guesses'][pid]['playerName'],
                            'guess': room['guesses'][pid]['guess'],
                            'votes': vote_counts.get(pid, 0)
                        }
                        for pid in room['guesses'].keys()
                    ],
                    'updatedPlayers': room['players']
                }
                
                room['roundPhase'] = 'results'
                
                print(f'[LookUp.Cafe] Voting complete in room {room_code}, winner: {winner_player["name"] if winner_player else "Unknown"}')
                
                emit('guessing:voting-complete', results, room=room_code)
        
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f'[LookUp.Cafe] Error processing vote: {e}')
        emit('game:error', {'message': f'Failed to process vote: {str(e)}'})


@socketio.on('guessing:next-round')
def handle_next_guessing_round(data):
    """Progress to the next round or end the game"""
    try:
        room_code = data.get('roomCode', '').strip().upper()
        
        if room_code not in game_rooms:
            emit('game:error', {'message': 'Room not found'})
            return
        
        room = game_rooms[room_code]
        player_id = request.sid
        
        # Only host can progress rounds
        if player_id != room['hostId']:
            emit('game:error', {'message': 'Only host can start next round'})
            return
        
        # Check if game is over
        if room['currentRound'] >= room['maxRounds']:
            # Game over
            room['state'] = 'gameEnd'
            
            # Sort players by score
            sorted_players = sorted(room['players'], key=lambda p: p['score'], reverse=True)
            emit('game:finished', {
                'room': room,
                'winner': sorted_players[0] if sorted_players else None,
                'players': sorted_players,
                'message': f"Game Over! {sorted_players[0]['name']} wins!" if sorted_players else "Game Over!"
            }, room=room_code)
            print(f'[LookUp.Cafe] Game finished in room {room_code}')
            
            return
        
        # Start next round
        room['currentRound'] += 1
        room['currentWord'] = room['secretWords'][room['currentRound'] - 1]
        room['guesses'] = {}
        room['votes'] = {}
        room['roundPhase'] = 'guessing'
        room['roundStartTime'] = time.time()
        
        print(f'[LookUp.Cafe] Starting round {room["currentRound"]} in room {room_code}')
        
        emit('guessing:round-started', {
            'room': room,
            'currentRound': room['currentRound'],
            'maxRounds': room['maxRounds'],
            'roundPhase': 'guessing',
            'message': f'Round {room["currentRound"]} starting!'
        }, room=room_code)
        
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f'[LookUp.Cafe] Error starting next round: {e}')
        emit('game:error', {'message': f'Failed to start next round: {str(e)}'})


# ============================================================================
# Room Management & Cleanup
# ============================================================================

import threading

def cleanup_inactive_rooms():
    """Background task to clean up rooms with all inactive players for >60 seconds"""
    while True:
        try:
            time.sleep(30)  # Run every 30 seconds
            current_time = time.time()
            rooms_to_delete = []
            
            for room_code, room in list(game_rooms.items()):
                # Check if all players are inactive for more than 60 seconds
                all_inactive = True
                for player in room.get('players', []):
                    if player.get('isActive', False):
                        all_inactive = False
                        break
                    
                    disconnect_time = player.get('disconnectTime', 0)
                    if disconnect_time == 0 or (current_time - disconnect_time) < 60:
                        all_inactive = False
                        break
                
                # If all players inactive for >60s, mark for deletion
                if all_inactive and (current_time - room.get('lastActivityTime', current_time)) > 60:
                    rooms_to_delete.append(room_code)
            
            # Delete inactive rooms
            for room_code in rooms_to_delete:
                if room_code in game_rooms:
                    print(f'[LookUp.Cafe] Auto-deleting inactive room: {room_code}')
                    # Notify any remaining connected players
                    socketio.emit('game:room-closed', {
                        'roomCode': room_code,
                        'reason': 'Room inactive for too long'
                    }, room=room_code)
                    del game_rooms[room_code]
        
        except Exception as e:
            db.session.rollback()  # Rollback failed transaction
            print(f'[LookUp.Cafe] Error in cleanup task: {e}')

# Start cleanup thread
cleanup_thread = threading.Thread(target=cleanup_inactive_rooms, daemon=True)
cleanup_thread.start()
print('[LookUp.Cafe] Room cleanup task started')


@socketio.on('game:rejoin-room')
def handle_rejoin_room(data):
    """Host rejoins their room after disconnecting"""
    try:
        room_code = data.get('roomCode', '').strip().upper()
        player_name = data.get('playerName', 'Guest')
        user_id = data.get('userId')
        avatar = data.get('avatar')
        
        if room_code not in game_rooms:
            emit('game:error', {'message': 'Room not found or has been closed'})
            return
        
        room = game_rooms[room_code]
        player_id = request.sid
        
        # Find if this player was the host
        was_host = False
        host_player = None
        for player in room['players']:
            if player['id'] == room['hostId']:
                # Match by userId or name
                if (user_id and player.get('userId') == user_id) or player['name'] == player_name:
                    was_host = True
                    host_player = player
                    break
        
        if not was_host:
            emit('game:error', {'message': 'Only the original host can rejoin this room'})
            return
        
        # Update host player with new socket ID
        host_player['id'] = player_id
        host_player['isActive'] = True
        host_player['disconnectTime'] = None
        room['hostId'] = player_id
        room['lastActivityTime'] = time.time()
        
        # Join socket.io room
        join_room(room_code)
        
        print(f'[LookUp.Cafe] Host {player_name} rejoined room {room_code}')
        
        # Send room state to rejoining host
        emit('game:room-joined', {'room': room})
        
        # Notify other players
        emit('game:player-rejoined', {
            'player': host_player,
            'room': room
        }, room=room_code, skip_sid=player_id)
        
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f'[LookUp.Cafe] Error rejoining room: {e}')
        emit('game:error', {'message': f'Failed to rejoin room: {str(e)}'})


@socketio.on('game:delete-room')
def handle_delete_room(data):
    """Host manually deletes/closes the room"""
    try:
        room_code = data.get('roomCode', '').strip().upper()
        
        if room_code not in game_rooms:
            emit('game:error', {'message': 'Room not found'})
            return
        
        room = game_rooms[room_code]
        player_id = request.sid
        
        # Only host can delete room
        if player_id != room['hostId']:
            emit('game:error', {'message': 'Only the host can delete the room'})
            return
        
        print(f'[LookUp.Cafe] Host manually deleted room {room_code}')
        
        # Notify all players before deletion
        emit('game:room-closed', {
            'roomCode': room_code,
            'reason': 'Host closed the room'
        }, room=room_code)
        
        # Delete room
        del game_rooms[room_code]
        
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f'[LookUp.Cafe] Error deleting room: {e}')
        emit('game:error', {'message': f'Failed to delete room: {str(e)}'})


@socketio.on('disconnect')
def handle_disconnect():
    """Handle player disconnect - mark as inactive instead of removing"""
    try:
        player_id = request.sid
        current_time = time.time()
        
        # Find player in any room
        for room_code, room in game_rooms.items():
            for player in room['players']:
                if player['id'] == player_id:
                    # Mark player as inactive
                    player['isActive'] = False
                    player['disconnectTime'] = current_time
                    room['lastActivityTime'] = current_time
                    
                    print(f'[LookUp.Cafe] Player {player["name"]} disconnected from room {room_code}')
                    
                    # Notify other players
                    socketio.emit('game:player-disconnected', {
                        'playerId': player_id,
                        'playerName': player['name'],
                        'room': room
                    }, room=room_code)
                    
                    return
    
    except Exception as e:
        db.session.rollback()  # Rollback failed transaction
        print(f'[LookUp.Cafe] Error handling disconnect: {e}')


# ============================================================================
# Active Rooms Endpoint
# ============================================================================

@app.route('/api/game/active-rooms', methods=['GET'])
def get_active_rooms():
    """Get list of all active (non-finished) game rooms"""
    try:
        active_rooms = []
        for room_code, room in game_rooms.items():
            # Skip finished games
            if room.get('state') == 'finished':
                continue
            
            # Count active players
            active_players = [p for p in room.get('players', []) if p.get('isActive', True)]
            
            active_rooms.append({
                'roomCode': room_code,
                'gameType': room.get('gameType'),
                'state': room.get('state'),
                'playerCount': len(active_players),
                'maxPlayers': MAX_PLAYERS,
                'currentRound': room.get('currentRound', 0),
                'maxRounds': room.get('maxRounds', 5),
                'hostName': next((p['name'] for p in room['players'] if p['id'] == room['hostId']), 'Unknown'),
            })
        
        # Sort by creation time (newest first)
        active_rooms.sort(key=lambda r: game_rooms[r['roomCode']].get('createdAt', 0), reverse=True)
        
        return jsonify({'rooms': active_rooms})
    
    except Exception as e:
        print(f'[LookUp.Cafe] Error fetching active rooms: {e}')
        return jsonify({'error': str(e)}), 500


# ============================================================================
# User Management Extended Routes - Client Assignment, Tasks, Support
# ============================================================================

@app.route('/api/admin/users/<user_id>/clients', methods=['GET'])
@login_required
def get_user_clients(user_id):
    """Get clients assigned to a specific user/employee"""
    try:
        # Check if requester is admin
        requester = get_current_user()
        if not requester or not requester.is_admin:
            return jsonify({'error': 'Admin access required'}), 403
        
        # Verify user exists - support ID, username, ENS name, or patreon_id
        user = safe_get_user(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get the actual user ID for the query
        actual_user_id = getattr(user, 'id', None)
        if not actual_user_id:
            return jsonify({'error': 'User ID not found'}), 404
        
        # Get assigned clients from creative_clients table
        # Assuming there's a client-employee relationship
        from sqlalchemy import text
        
        query = text("""
            SELECT c.id, c.name, c.email, c.company, c.status, 
                   c.assigned_employee_id, c.created_at
            FROM creative_clients c
            WHERE c.assigned_employee_id = :user_id
            ORDER BY c.created_at DESC
        """)
        
        result = db.session.execute(query, {'user_id': actual_user_id})
        clients = []
        
        for row in result:
            clients.append({
                'id': str(row.id),
                'name': row.name,
                'email': row.email,
                'company': row.company,
                'status': row.status,
                'assignedEmployeeId': row.assigned_employee_id,
                'createdAt': row.created_at.isoformat() if row.created_at else None
            })
        
        return jsonify({
            'success': True,
            'clients': clients,
            'count': len(clients)
        }), 200
        
    except Exception as e:
        print(f"Error getting user clients: {str(e)}")
        db.session.rollback()
        return jsonify({'error': f'Failed to get clients: {str(e)}'}), 500


@app.route('/api/admin/users/<user_id>/unassign-client/<client_id>', methods=['DELETE', 'OPTIONS'])
@login_required
def unassign_client_from_user(user_id, client_id):
    """Remove client assignment from user"""
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        # Check if requester is admin
        requester = get_current_user()
        if not requester or not requester.is_admin:
            return jsonify({'error': 'Admin access required'}), 403
        
        # Verify user exists - support ID, username, ENS name, or patreon_id
        user = safe_get_user(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get the actual user ID for the query
        actual_user_id = getattr(user, 'id', None)
        if not actual_user_id:
            return jsonify({'error': 'User ID not found'}), 404
        
        # Update client to remove assignment
        from sqlalchemy import text
        
        query = text("""
            UPDATE creative_clients 
            SET assigned_employee_id = NULL, 
                assigned_employee = NULL
            WHERE id = :client_id AND assigned_employee_id = :user_id
        """)
        
        result = db.session.execute(query, {
            'client_id': client_id,
            'user_id': actual_user_id
        })
        db.session.commit()
        
        if result.rowcount == 0:
            return jsonify({'error': 'Client assignment not found'}), 404
        
        return jsonify({
            'success': True,
            'message': 'Client unassigned successfully'
        }), 200
        
    except Exception as e:
        print(f"Error unassigning client: {str(e)}")
        db.session.rollback()
        return jsonify({'error': f'Failed to unassign client: {str(e)}'}), 500


@app.route('/api/admin/users/<user_id>/tasks', methods=['GET'])
@login_required
def get_user_tasks(user_id):
    """Get tasks assigned to a specific user"""
    try:
        # Verify user exists - support ID, username, ENS name, or patreon_id
        user = safe_get_user(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get the actual user ID for the query
        actual_user_id = getattr(user, 'id', None)
        if not actual_user_id:
            return jsonify({'error': 'User ID not found'}), 404
        
        # Check if requester is admin or the user themselves
        requester = get_current_user()
        if not requester:
            return jsonify({'error': 'Authentication required'}), 401
        
        requester_id = getattr(requester, 'id', None)
        is_admin = getattr(requester, 'is_admin', False)
        
        if not is_admin and requester_id != actual_user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        # Get tasks from tasks table
        from sqlalchemy import text
        
        query = text("""
            SELECT t.id, t.title, t.description, t.status, t.priority,
                   t.due_date, t.created_at, t.client_id, c.name as client_name
            FROM tasks t
            LEFT JOIN creative_clients c ON t.client_id = c.id
            WHERE t.assigned_to = :user_id
            ORDER BY 
                CASE t.priority
                    WHEN 'high' THEN 1
                    WHEN 'medium' THEN 2
                    WHEN 'low' THEN 3
                    ELSE 4
                END,
                t.due_date ASC
        """)
        
        result = db.session.execute(query, {'user_id': actual_user_id})
        tasks = []
        
        for row in result:
            tasks.append({
                'id': row.id,
                'title': row.title,
                'description': row.description,
                'status': row.status,
                'priority': row.priority,
                'due_date': row.due_date.isoformat() if row.due_date else None,
                'created_at': row.created_at.isoformat() if row.created_at else None,
                'client_id': row.client_id,
                'client_name': row.client_name
            })
        
        return jsonify({
            'success': True,
            'tasks': tasks,
            'count': len(tasks)
        }), 200
        
    except Exception as e:
        print(f"Error getting user tasks: {str(e)}")
        db.session.rollback()
        return jsonify({'error': f'Failed to get tasks: {str(e)}'}), 500


@app.route('/api/admin/users/<user_id>/support-requests', methods=['GET'])
@login_required
def get_user_support_requests(user_id):
    """Get support requests assigned to a specific user"""
    try:
        # Verify user exists - support ID, username, ENS name, or patreon_id
        user = safe_get_user(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get the actual user ID for the query
        actual_user_id = getattr(user, 'id', None)
        if not actual_user_id:
            return jsonify({'error': 'User ID not found'}), 404
        
        # Check if requester is admin or the user themselves
        requester = get_current_user()
        if not requester:
            return jsonify({'error': 'Authentication required'}), 401
        
        requester_id = getattr(requester, 'id', None)
        is_admin = getattr(requester, 'is_admin', False)
        
        if not is_admin and requester_id != actual_user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        # Get support requests from support_requests table
        from sqlalchemy import text
        
        query = text("""
            SELECT sr.id, sr.subject, sr.description, sr.status, sr.priority,
                   sr.created_at, sr.updated_at, sr.client_id, c.name as client_name
            FROM support_requests sr
            LEFT JOIN creative_clients c ON sr.client_id = c.id
            WHERE sr.assigned_to = :user_id
            ORDER BY 
                CASE sr.priority
                    WHEN 'urgent' THEN 1
                    WHEN 'high' THEN 2
                    WHEN 'medium' THEN 3
                    WHEN 'low' THEN 4
                    ELSE 5
                END,
                sr.created_at DESC
        """)
        
        result = db.session.execute(query, {'user_id': actual_user_id})
        requests = []
        
        for row in result:
            requests.append({
                'id': row.id,
                'subject': row.subject,
                'description': row.description,
                'status': row.status,
                'priority': row.priority,
                'created_at': row.created_at.isoformat() if row.created_at else None,
                'updated_at': row.updated_at.isoformat() if row.updated_at else None,
                'client_id': row.client_id,
                'client_name': row.client_name
            })
        
        return jsonify({
            'success': True,
            'requests': requests,
            'count': len(requests)
        }), 200
        
    except Exception as e:
        print(f"Error getting support requests: {str(e)}")
        db.session.rollback()
        return jsonify({'error': f'Failed to get support requests: {str(e)}'}), 500


@app.route('/api/admin/users/<user_id>/assign-client', methods=['POST', 'OPTIONS'])
@login_required
def assign_client_to_user(user_id):
    """Assign a client to a user/employee"""
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        # Check if requester is admin
        requester = get_current_user()
        if not requester or not requester.is_admin:
            return jsonify({'error': 'Admin access required'}), 403
        
        data = request.get_json()
        client_id = data.get('client_id')
        
        if not client_id:
            return jsonify({'error': 'Client ID required'}), 400
        
        # Verify user exists - support ID, username, ENS name, or patreon_id
        user = safe_get_user(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get the actual user ID for the query
        actual_user_id = getattr(user, 'id', None)
        if not actual_user_id:
            return jsonify({'error': 'User ID not found'}), 404
        
        # Get username for assignment
        username = getattr(user, 'username', None) or getattr(user, 'ens_name', None) or str(actual_user_id)
        
        # Update client assignment
        from sqlalchemy import text
        
        query = text("""
            UPDATE creative_clients 
            SET assigned_employee_id = :user_id,
                assigned_employee = :username
            WHERE id = :client_id
        """)
        
        result = db.session.execute(query, {
            'user_id': actual_user_id,
            'username': username,
            'client_id': client_id
        })
        db.session.commit()
        
        if result.rowcount == 0:
            return jsonify({'error': 'Client not found'}), 404
        
        return jsonify({
            'success': True,
            'message': 'Client assigned successfully'
        }), 200
        
    except Exception as e:
        print(f"Error assigning client: {str(e)}")
        db.session.rollback()
        return jsonify({'error': f'Failed to assign client: {str(e)}'}), 500

@app.route('/api/analytics/data', methods=['POST'])
@jwt_required()
def get_analytics_data():
    """Fetch Google Analytics data for a property"""
    try:
        requester = get_current_user()
        if not requester:
            return jsonify({'error': 'Authentication required'}), 401
        
        data = request.get_json() or {}
        property_id = data.get('propertyId', '').strip()
        time_range = data.get('timeRange', '7d')
        
        # Debug: Log the property_id to help diagnose issues
        print(f"DEBUG: Received property_id: '{property_id}' (type: {type(property_id)}, length: {len(property_id) if property_id else 0})")
        
        if not property_id:
            return jsonify({'error': 'Google Analytics Property ID is required'}), 400
        
        # Calculate date range
        from datetime import datetime, timedelta
        now = datetime.now()
        
        if time_range == '24h':
            start_date = now - timedelta(days=1)
            previous_start = start_date - timedelta(days=1)
            previous_end = start_date
        elif time_range == '7d':
            start_date = now - timedelta(days=7)
            previous_start = start_date - timedelta(days=7)
            previous_end = start_date
        elif time_range == '30d':
            start_date = now - timedelta(days=30)
            previous_start = start_date - timedelta(days=30)
            previous_end = start_date
        elif time_range == '90d':
            start_date = now - timedelta(days=90)
            previous_start = start_date - timedelta(days=90)
            previous_end = start_date
        else:
            start_date = now - timedelta(days=7)
            previous_start = start_date - timedelta(days=7)
            previous_end = start_date
        
        # Format dates for Google Analytics API (YYYY-MM-DD)
        start_date_str = start_date.strftime('%Y-%m-%d')
        end_date_str = now.strftime('%Y-%m-%d')
        previous_start_str = previous_start.strftime('%Y-%m-%d')
        previous_end_str = previous_end.strftime('%Y-%m-%d')
        
        # Try to use Google Analytics Data API
        try:
            from google.analytics.data_v1beta import BetaAnalyticsDataClient
            from google.analytics.data_v1beta.types import RunReportRequest, DateRange, Dimension, Metric
            from google.oauth2 import service_account
            import os
            
            # Check for credentials
            ga_credentials_path = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')
            
            if ga_credentials_path and os.path.exists(ga_credentials_path):
                # Use service account credentials
                try:
                    credentials = service_account.Credentials.from_service_account_file(
                        ga_credentials_path,
                        scopes=['https://www.googleapis.com/auth/analytics.readonly']
                    )
                    # Validate credentials have required fields
                    if not hasattr(credentials, 'service_account_email') or not credentials.service_account_email:
                        raise ValueError("Service account credentials missing client_email field")
                    client = BetaAnalyticsDataClient(credentials=credentials)
                except (ValueError, KeyError, FileNotFoundError, json.JSONDecodeError) as cred_error:
                    print(f"Error loading Google Analytics credentials: {cred_error}")
                    return jsonify({
                        'error': f'Service account info was not in the expected format, missing fields client_email, token_uri. Error: {str(cred_error)}',
                        'message': 'Please ensure your service account JSON file contains all required fields: client_email, token_uri, private_key, etc. See Google Analytics API documentation for proper service account setup.',
                        'isMockData': True,
                        'totalRevenue': 0,
                        'totalUsers': 0,
                        'pageViews': 0,
                        'conversionRate': 0,
                        'revenueTrend': 0,
                        'usersTrend': 0,
                        'pageViewsTrend': 0,
                        'conversionTrend': 0,
                        'revenueData': [],
                        'visitorData': [],
                        'conversionData': [],
                    }), 200
            else:
                # Try to use default credentials (for local development or GCP)
                try:
                    client = BetaAnalyticsDataClient()
                except Exception as e:
                    print(f"Google Analytics API not configured: {e}")
                    # Return error indicating API needs to be configured
                    return jsonify({
                        'error': 'Google Analytics API not configured. Please set GOOGLE_APPLICATION_CREDENTIALS environment variable with path to your service account JSON file.',
                        'message': 'To use real analytics data, you need to: 1) Create a service account in Google Cloud Console, 2) Enable Google Analytics Data API, 3) Download the JSON key file, 4) Set GOOGLE_APPLICATION_CREDENTIALS environment variable to the path of the JSON file.',
                        'isMockData': True,
                        'totalRevenue': 0,
                        'totalUsers': 0,
                        'pageViews': 0,
                        'conversionRate': 0,
                        'revenueTrend': 0,
                        'usersTrend': 0,
                        'pageViewsTrend': 0,
                        'conversionTrend': 0,
                        'revenueData': [],
                        'visitorData': [],
                        'conversionData': [],
                    }), 200
            
            # Normalize property ID (handle both G-XXXXXXXXXX and numeric IDs)
            # The Google Analytics Data API requires numeric Property IDs, not Measurement IDs (G-XXXXXXXXXX)
            # G-XXXXXXXXXX is a Measurement ID used for tracking, not for the Reporting API
            # Remove any whitespace and check the actual value
            property_id_clean_check = property_id.strip()
            
            # Check for Measurement ID formats (G-XXXXXXXXXX, GXXXXXXXXXX, etc.)
            if property_id_clean_check.upper().startswith('G-') or property_id_clean_check.upper().startswith('G'):
                # Try to extract numeric part if it's in format like G504418073
                numeric_part = property_id_clean_check.upper().lstrip('G-').lstrip('G').strip()
                if numeric_part.isdigit():
                    # User provided G-prefixed ID, extract the numeric part
                    print(f"INFO: Extracted numeric Property ID '{numeric_part}' from '{property_id_clean_check}'")
                    property_id_clean = f"properties/{numeric_part}"
                else:
                    # Return helpful error explaining the difference
                    return jsonify({
                        'error': 'Property ID format error: G-XXXXXXXXXX is a Measurement ID, not a Property ID',
                        'message': f'The value "{property_id_clean_check}" appears to be a Measurement ID (G-XXXXXXXXXX format), but the Google Analytics Data API requires a numeric Property ID. Please use the numeric Property ID instead.',
                        'details': 'To find your numeric Property ID: 1) Go to Google Analytics (analytics.google.com), 2) Click Admin (gear icon), 3) Select your GA4 property, 4) Click Property Settings, 5) Find the numeric Property ID (e.g., 123456789). Use this numeric ID instead of the G-XXXXXXXXXX Measurement ID.',
                        'helpUrl': 'https://developers.google.com/analytics/devguides/reporting/data/v1/property-id',
                        'isMockData': True,
                        'totalRevenue': 0,
                        'totalUsers': 0,
                        'pageViews': 0,
                        'conversionRate': 0,
                        'revenueTrend': 0,
                        'usersTrend': 0,
                        'pageViewsTrend': 0,
                        'conversionTrend': 0,
                        'revenueData': [],
                        'visitorData': [],
                        'conversionData': [],
                    }), 200
            elif property_id_clean_check.upper().startswith('UA-') or property_id_clean_check.upper().startswith('A-') or property_id_clean_check.upper().startswith('A'):
                # Try to extract numeric part if it's in format like A504418073 or A-504418073
                numeric_part = property_id_clean_check.upper().lstrip('A-').lstrip('A').strip()
                if numeric_part.isdigit():
                    # User provided A-prefixed ID, extract the numeric part
                    print(f"INFO: Extracted numeric Property ID '{numeric_part}' from '{property_id_clean_check}'")
                    property_id_clean = f"properties/{numeric_part}"
                else:
                    return jsonify({
                        'error': 'Universal Analytics (UA) properties are no longer supported. Please use a GA4 property with numeric Property ID.',
                        'isMockData': True,
                    }), 400
            else:
                # Assume it's a numeric property ID, format as properties/XXXXXXX
                # Remove any whitespace and ensure it's numeric
                property_id_clean = property_id_clean_check
                # Validate it's numeric (allows digits only)
                if not property_id_clean.isdigit():
                    return jsonify({
                        'error': 'Invalid Property ID format',
                        'message': f'The Property ID "{property_id_clean}" must be numeric only. Please provide a valid numeric Property ID (e.g., 123456789).',
                        'details': 'To find your numeric Property ID: 1) Go to Google Analytics (analytics.google.com), 2) Click Admin (gear icon), 3) Select your GA4 property, 4) Click Property Settings, 5) Find the numeric Property ID.',
                        'helpUrl': 'https://developers.google.com/analytics/devguides/reporting/data/v1/property-id',
                        'isMockData': True,
                        'totalRevenue': 0,
                        'totalUsers': 0,
                        'pageViews': 0,
                        'conversionRate': 0,
                        'revenueTrend': 0,
                        'usersTrend': 0,
                        'pageViewsTrend': 0,
                        'conversionTrend': 0,
                        'revenueData': [],
                        'visitorData': [],
                        'conversionData': [],
                    }), 200
                property_id_clean = f"properties/{property_id_clean}"
            
            # Fetch current period data
            current_request = RunReportRequest(
                property=property_id_clean,
                date_ranges=[DateRange(start_date=start_date_str, end_date=end_date_str)],
                metrics=[
                    Metric(name="activeUsers"),
                    Metric(name="screenPageViews"),
                    Metric(name="conversions"),
                    Metric(name="totalRevenue"),
                ],
                dimensions=[Dimension(name="date")],
            )
            current_response = client.run_report(request=current_request)
            
            # Fetch previous period data for comparison
            previous_request = RunReportRequest(
                property=property_id_clean,
                date_ranges=[DateRange(start_date=previous_start_str, end_date=previous_end_str)],
                metrics=[
                    Metric(name="activeUsers"),
                    Metric(name="screenPageViews"),
                    Metric(name="conversions"),
                    Metric(name="totalRevenue"),
                ],
            )
            previous_response = client.run_report(request=previous_request)
            
            # Process current period data
            current_total_users = 0
            current_page_views = 0
            current_conversions = 0
            current_revenue = 0.0
            revenue_data = []
            visitor_data = []
            
            for row in current_response.rows:
                date_value = row.dimension_values[0].value
                # Format date for display (get day name or date)
                date_obj = datetime.strptime(date_value, '%Y%m%d')
                day_name = date_obj.strftime('%a')  # Mon, Tue, etc.
                
                users = int(row.metric_values[0].value) if row.metric_values[0].value else 0
                page_views = int(row.metric_values[1].value) if row.metric_values[1].value else 0
                conversions = float(row.metric_values[2].value) if row.metric_values[2].value else 0
                revenue = float(row.metric_values[3].value) if row.metric_values[3].value else 0.0
                
                current_total_users += users
                current_page_views += page_views
                current_conversions += conversions
                current_revenue += revenue
                
                revenue_data.append({
                    'name': day_name,
                    'value': revenue,
                    'previous': 0,  # Will be filled from previous period
                    'conversions': conversions  # Store conversions per day for conversion rate calculation
                })
                visitor_data.append({
                    'name': day_name,
                    'visitors': users,
                    'pageViews': page_views,
                    'conversions': conversions  # Store conversions per day
                })
            
            # Process previous period data
            previous_total_users = 0
            previous_page_views = 0
            previous_conversions = 0
            previous_revenue = 0.0
            previous_revenue_by_date = {}
            
            for row in previous_response.rows:
                users = int(row.metric_values[0].value) if row.metric_values[0].value else 0
                page_views = int(row.metric_values[1].value) if row.metric_values[1].value else 0
                conversions = float(row.metric_values[2].value) if row.metric_values[2].value else 0
                revenue = float(row.metric_values[3].value) if row.metric_values[3].value else 0.0
                
                previous_total_users += users
                previous_page_views += page_views
                previous_conversions += conversions
                previous_revenue += revenue
                
                # If we have date dimension, use it
                if row.dimension_values:
                    date_value = row.dimension_values[0].value
                    date_obj = datetime.strptime(date_value, '%Y%m%d')
                    day_name = date_obj.strftime('%a')
                    previous_revenue_by_date[day_name] = revenue
            
            # Match previous period revenue to current period dates
            for i, rev_data in enumerate(revenue_data):
                day_name = rev_data['name']
                if day_name in previous_revenue_by_date:
                    rev_data['previous'] = previous_revenue_by_date[day_name]
                elif i < len(previous_revenue_by_date):
                    # Fallback: use index if available
                    rev_data['previous'] = list(previous_revenue_by_date.values())[i] if previous_revenue_by_date else 0
            
            # Calculate trends
            revenue_trend = ((current_revenue - previous_revenue) / previous_revenue * 100) if previous_revenue > 0 else 0
            users_trend = ((current_total_users - previous_total_users) / previous_total_users * 100) if previous_total_users > 0 else 0
            page_views_trend = ((current_page_views - previous_page_views) / previous_page_views * 100) if previous_page_views > 0 else 0
            
            # Calculate conversion rate
            conversion_rate = (current_conversions / current_total_users * 100) if current_total_users > 0 else 0
            previous_conversion_rate = (previous_conversions / previous_total_users * 100) if previous_total_users > 0 else 0
            conversion_trend = (conversion_rate - previous_conversion_rate) if previous_conversion_rate > 0 else 0
            
            # Generate conversion data
            # Use daily breakdown for data with less than 7 days, weekly for 7+ days
            conversion_data = []
            
            if len(revenue_data) < 7:
                # Daily breakdown for short date ranges
                for i, rev_data in enumerate(revenue_data):
                    if i < len(visitor_data):
                        visitors = visitor_data[i].get('visitors', 0)
                        conversions = visitor_data[i].get('conversions', 0)
                        rate = (conversions / visitors * 100) if visitors > 0 else 0
                        conversion_data.append({
                            'name': rev_data['name'],
                            'rate': round(rate, 2)
                        })
            else:
                # Weekly breakdown for longer date ranges (7+ days)
                weeks = len(revenue_data) // 7
                for week in range(weeks):
                    week_start = week * 7
                    week_end = min(week_start + 7, len(revenue_data))
                    week_users = sum(d.get('visitors', 0) for d in visitor_data[week_start:week_end]) if week_start < len(visitor_data) else 0
                    week_conversions = sum(d.get('conversions', 0) for d in visitor_data[week_start:week_end]) if week_start < len(visitor_data) else 0
                    week_rate = (week_conversions / week_users * 100) if week_users > 0 else 0
                    conversion_data.append({
                        'name': f'Week {week + 1}',
                        'rate': round(week_rate, 2)
                    })
                
                # Handle remaining days that don't form a complete week
                remaining_days = len(revenue_data) % 7
                if remaining_days > 0:
                    week_start = weeks * 7
                    week_end = len(revenue_data)
                    week_users = sum(d.get('visitors', 0) for d in visitor_data[week_start:week_end]) if week_start < len(visitor_data) else 0
                    week_conversions = sum(d.get('conversions', 0) for d in visitor_data[week_start:week_end]) if week_start < len(visitor_data) else 0
                    week_rate = (week_conversions / week_users * 100) if week_users > 0 else 0
                    conversion_data.append({
                        'name': f'Week {weeks + 1}',
                        'rate': round(week_rate, 2)
                    })
            
            return jsonify({
                'totalRevenue': round(current_revenue, 2),
                'totalUsers': current_total_users,
                'pageViews': current_page_views,
                'conversionRate': round(conversion_rate, 2),
                'revenueTrend': round(revenue_trend, 2),
                'usersTrend': round(users_trend, 2),
                'pageViewsTrend': round(page_views_trend, 2),
                'conversionTrend': round(conversion_trend, 2),
                'revenueData': revenue_data,
                'visitorData': visitor_data,
                'conversionData': conversion_data,
                'isMockData': False,
            }), 200
            
        except ImportError:
            # Google Analytics Data API library not installed
            return jsonify({
                'error': 'Google Analytics Data API library not installed. Please install: pip install google-analytics-data',
                'isMockData': True,
                'totalRevenue': 0,
                'totalUsers': 0,
                'pageViews': 0,
                'conversionRate': 0,
                'revenueTrend': 0,
                'usersTrend': 0,
                'pageViewsTrend': 0,
                'conversionTrend': 0,
                'revenueData': [],
                'visitorData': [],
                'conversionData': [],
            }), 200
        except Exception as ga_error:
            print(f"Error fetching Google Analytics data: {str(ga_error)}")
            import traceback
            traceback.print_exc()
            # Return error but don't fail completely - let frontend handle it
            return jsonify({
                'error': f'Failed to fetch Google Analytics data: {str(ga_error)}',
                'isMockData': True,
                'totalRevenue': 0,
                'totalUsers': 0,
                'pageViews': 0,
                'conversionRate': 0,
                'revenueTrend': 0,
                'usersTrend': 0,
                'pageViewsTrend': 0,
                'conversionTrend': 0,
                'revenueData': [],
                'visitorData': [],
                'conversionData': [],
            }), 200
        
    except Exception as e:
        print(f"Error fetching analytics data: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to fetch analytics data: {str(e)}'}), 500

@app.route('/api/billing/payment-methods', methods=['GET'])
@jwt_required()
def get_payment_methods():
    """Get user's payment methods"""
    try:
        requester = get_current_user()
        if not requester:
            return jsonify({'error': 'Authentication required'}), 401
        
        # TODO: Integrate with payment provider (Stripe, etc.) to get real payment methods
        # For now, return empty array or mock data
        return jsonify({
            'paymentMethods': []
        }), 200
        
    except Exception as e:
        print(f"Error fetching payment methods: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to fetch payment methods: {str(e)}'}), 500

@app.route('/api/billing/invoices', methods=['GET'])
@jwt_required()
def get_invoices():
    """Get user's billing invoices"""
    try:
        requester = get_current_user()
        if not requester:
            return jsonify({'error': 'Authentication required'}), 401
        
        # TODO: Integrate with payment provider to get real invoices
        # For now, return empty array or mock data
        return jsonify({
            'invoices': []
        }), 200
        
    except Exception as e:
        print(f"Error fetching invoices: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to fetch invoices: {str(e)}'}), 500

@app.route('/api/subscriptions/cancel', methods=['POST'])
@jwt_required()
def cancel_subscription():
    """Cancel user's subscription"""
    try:
        requester = get_current_user()
        if not requester:
            return jsonify({'error': 'Authentication required'}), 401
        
        # TODO: Integrate with payment provider to cancel subscription
        # For now, return success
        return jsonify({
            'success': True,
            'message': 'Subscription will be canceled at the end of the billing period'
        }), 200
        
    except Exception as e:
        print(f"Error canceling subscription: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to cancel subscription: {str(e)}'}), 500

@app.route('/api/subscriptions/resume', methods=['POST'])
@jwt_required()
def resume_subscription():
    """Resume user's canceled subscription"""
    try:
        requester = get_current_user()
        if not requester:
            return jsonify({'error': 'Authentication required'}), 401
        
        # TODO: Integrate with payment provider to resume subscription
        # For now, return success
        return jsonify({
            'success': True,
            'message': 'Subscription has been resumed'
        }), 200
        
    except Exception as e:
        print(f"Error resuming subscription: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to resume subscription: {str(e)}'}), 500



# ============================================================================
# VENTURES API ENDPOINTS
# Maps support_requests to ventures with tasks, employees, and progress tracking
# ============================================================================

@app.route('/api/ventures', methods=['GET'])
@jwt_required(optional=True)
def get_ventures():
    """Get all support requests as ventures"""
    try:
        if not DB_AVAILABLE:
            return jsonify({'ventures': []}), 200
        
        current_user_id = get_jwt_identity()
        
        # Get all support requests
        support_requests = SupportRequest.query.order_by(SupportRequest.created_at.desc()).all()
        
        ventures = []
        for sr in support_requests:
            try:
                # Calculate progress from tasks
                tasks = Task.query.filter_by(support_request_id=sr.id).all()
                total_tasks = len(tasks)
                completed_tasks = len([t for t in tasks if t.status == 'completed'])
                calculated_progress = int((completed_tasks / total_tasks * 100)) if total_tasks > 0 else 0
                
                # Update progress in database if different (only if we have a valid session)
                try:
                    if sr.progress != calculated_progress:
                        sr.progress = calculated_progress
                        db.session.commit()
                except:
                    db.session.rollback()
                
                # Get team members from client assignments
                team = []
                if sr.client_id:
                    try:
                        assignments = ClientEmployeeAssignment.query.filter_by(client_id=sr.client_id).all()
                        for assignment in assignments:
                            user = User.query.filter_by(username=assignment.employee_username).first()
                            if user:
                                team.append({
                                    'id': user.id,
                                    'name': f"{user.first_name or ''} {user.last_name or ''}".strip() or user.username,
                                    'email': user.email or '',
                                    'role': assignment.employee_name or 'Team Member',
                                    'avatar': None
                                })
                    except Exception as e:
                        print(f"Error fetching team for venture {sr.id}: {e}")
                
                # Format tasks
                formatted_tasks = []
                for task in tasks:
                    formatted_tasks.append({
                        'id': task.id,
                        'title': task.title,
                        'description': task.description or '',
                        'status': task.status,
                        'assignedTo': task.assigned_to,
                        'priority': 'medium',
                    })
                
                # Map status
                status_map = {
                    'open': 'planning',
                    'in_progress': 'active',
                    'in-progress': 'active',
                    'resolved': 'completed',
                    'closed': 'completed',
                    'on_hold': 'on_hold',
                    'on-hold': 'on_hold'
                }
                venture_status = status_map.get(sr.status, 'active')
                
                # Get tags from client
                tags = []
                if sr.client and sr.client.tags:
                    try:
                        tags = json.loads(sr.client.tags) if isinstance(sr.client.tags, str) else sr.client.tags
                    except:
                        tags = []
                
                # Safely get client name
                client_name = None
                try:
                    if sr.client:
                        client_name = sr.client.name
                except:
                    pass
                
                # Include support request info
                support_request_info = {
                    'id': sr.id,
                    'subject': sr.subject or 'Untitled Venture',
                    'description': sr.description or '',
                    'status': sr.status,
                    'priority': sr.priority or 'medium',
                    'createdAt': sr.created_at.isoformat() if sr.created_at else None,
                    'updatedAt': sr.updated_at.isoformat() if sr.updated_at else None
                }
                
                venture = {
                    'id': sr.id,
                    'name': sr.subject or 'Untitled Venture',
                    'description': sr.description or '',
                    'status': venture_status,
                    'progress': sr.progress if sr.progress is not None else calculated_progress,
                    'budget': float(sr.budget) if sr.budget else 0,
                    'spent': float(sr.spent) if sr.spent else 0,
                    'startDate': sr.start_date.isoformat() if sr.start_date else (sr.created_at.isoformat() if sr.created_at else None),
                    'deadline': sr.delivery_date.isoformat() if sr.delivery_date else None,
                    'team': team,
                    'tasks': formatted_tasks,
                    'tags': tags,
                    'clientId': sr.client_id,
                    'clientName': client_name,
                    'createdAt': sr.created_at.isoformat() if sr.created_at else None,
                    'updatedAt': sr.updated_at.isoformat() if sr.updated_at else None,
                    'supportRequest': support_request_info
                }
                ventures.append(venture)
            except Exception as e:
                print(f"Error processing venture {sr.id if sr else 'unknown'}: {e}")
                import traceback
                traceback.print_exc()
                continue
        
        return jsonify(ventures), 200
    
    except Exception as e:
        db.session.rollback()
        print(f"Error fetching ventures: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to fetch ventures', 'message': str(e), 'ventures': []}), 200


@app.route('/api/ventures/<venture_id>', methods=['GET'])
@jwt_required()
def get_venture(venture_id):
    """Get single venture by ID"""
    try:
        sr = SupportRequest.query.get(venture_id)
        if not sr:
            return jsonify({'error': 'Venture not found'}), 404
        
        # Calculate progress
        tasks = Task.query.filter_by(support_request_id=sr.id).all()
        total_tasks = len(tasks)
        completed_tasks = len([t for t in tasks if t.status == 'completed'])
        calculated_progress = int((completed_tasks / total_tasks * 100)) if total_tasks > 0 else 0
        
        # Get team
        team = []
        if sr.client_id:
            assignments = ClientEmployeeAssignment.query.filter_by(client_id=sr.client_id).all()
            for assignment in assignments:
                user = User.query.filter_by(username=assignment.employee_username).first()
                if user:
                    team.append({
                        'id': user.id,
                        'name': f"{user.first_name or ''} {user.last_name or ''}".strip() or user.username,
                        'email': user.email or '',
                        'role': assignment.employee_name or 'Team Member',
                        'avatar': None
                    })
        
        # Format tasks
        formatted_tasks = []
        for task in tasks:
            formatted_tasks.append({
                'id': task.id,
                'title': task.title,
                'description': task.description or '',
                'status': task.status,
                'assignedTo': task.assigned_to,
                'priority': 'medium',
            })
        
        # Map status
        status_map = {
            'open': 'planning',
            'in_progress': 'active',
            'in-progress': 'active',
            'resolved': 'completed',
            'closed': 'completed',
            'on_hold': 'on_hold',
            'on-hold': 'on_hold'
        }
        venture_status = status_map.get(sr.status, 'active')
        
        # Get tags
        tags = []
        if sr.client and sr.client.tags:
            try:
                tags = json.loads(sr.client.tags) if isinstance(sr.client.tags, str) else sr.client.tags
            except:
                tags = []
        
        venture = {
            'id': sr.id,
            'name': sr.subject,
            'description': sr.description,
            'status': venture_status,
            'progress': sr.progress or calculated_progress,
            'budget': float(sr.budget) if sr.budget else 0,
            'spent': float(sr.spent) if sr.spent else 0,
            'startDate': sr.start_date.isoformat() if sr.start_date else sr.created_at.isoformat(),
            'deadline': sr.delivery_date.isoformat() if sr.delivery_date else None,
            'team': team,
            'tasks': formatted_tasks,
            'tags': tags,
            'clientId': sr.client_id,
            'clientName': sr.client.name if sr.client else None,
            'createdAt': sr.created_at.isoformat(),
            'updatedAt': sr.updated_at.isoformat()
        }
        
        return jsonify(venture), 200
    
    except Exception as e:
        print(f"Error fetching venture: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/ventures', methods=['POST'])
@jwt_required()
def create_venture():
    """Create new support request as venture"""
    try:
        current_user_id = get_jwt_identity()
        data = request.json
        
        # Create support request
        sr = SupportRequest(
            id=str(uuid.uuid4()),
            user_id=current_user_id,
            client_id=data.get('clientId'),
            subject=data.get('name'),
            description=data.get('description'),
            status='open' if data.get('status') == 'planning' else data.get('status', 'open'),
            budget=data.get('budget', 0),
            spent=data.get('spent', 0),
            delivery_date=datetime.fromisoformat(data['deadline'].replace('Z', '+00:00')) if data.get('deadline') else None,
            start_date=datetime.fromisoformat(data['startDate'].replace('Z', '+00:00')) if data.get('startDate') else datetime.utcnow(),
            progress=0
        )
        
        db.session.add(sr)
        db.session.commit()
        
        return jsonify({'id': sr.id, 'message': 'Venture created'}), 201
    
    except Exception as e:
        db.session.rollback()
        print(f"Error creating venture: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/ventures/<venture_id>', methods=['PUT'])
@jwt_required()
def update_venture(venture_id):
    """Update support request/venture"""
    try:
        sr = SupportRequest.query.get(venture_id)
        if not sr:
            return jsonify({'error': 'Venture not found'}), 404
        
        data = request.json
        
        if 'name' in data:
            sr.subject = data['name']
        if 'description' in data:
            sr.description = data['description']
        if 'status' in data:
            # Map venture status back to support request status
            status_reverse_map = {
                'planning': 'open',
                'active': 'in_progress',
                'completed': 'resolved',
                'on_hold': 'on_hold'
            }
            sr.status = status_reverse_map.get(data['status'], data['status'])
        if 'budget' in data:
            sr.budget = data['budget']
        if 'spent' in data:
            sr.spent = data['spent']
        if 'deadline' in data:
            sr.delivery_date = datetime.fromisoformat(data['deadline'].replace('Z', '+00:00')) if data['deadline'] else None
        if 'startDate' in data:
            sr.start_date = datetime.fromisoformat(data['startDate'].replace('Z', '+00:00')) if data['startDate'] else None
        if 'progress' in data:
            sr.progress = data['progress']
        
        sr.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'message': 'Venture updated'}), 200
    
    except Exception as e:
        db.session.rollback()
        print(f"Error updating venture: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/ventures/<venture_id>', methods=['DELETE'])
@jwt_required()
def delete_venture(venture_id):
    """Delete support request/venture"""
    try:
        sr = SupportRequest.query.get(venture_id)
        if not sr:
            return jsonify({'error': 'Venture not found'}), 404
        
        db.session.delete(sr)
        db.session.commit()
        
        return jsonify({'message': 'Venture deleted'}), 200
    
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting venture: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/ventures/metrics', methods=['GET'])
@jwt_required(optional=True)
def get_ventures_metrics():
    """Get venture metrics"""
    try:
        if not DB_AVAILABLE:
            return jsonify({
                'total': 0,
                'active': 0,
                'completed': 0,
                'totalRevenue': 0,
                'totalBudget': 0
            }), 200
        
        total = SupportRequest.query.count()
        active = SupportRequest.query.filter(SupportRequest.status.in_(['open', 'in_progress', 'in-progress'])).count()
        completed = SupportRequest.query.filter(SupportRequest.status.in_(['resolved', 'closed'])).count()
        
        # Calculate total revenue from completed ventures
        completed_ventures = SupportRequest.query.filter(SupportRequest.status.in_(['resolved', 'closed'])).all()
        total_revenue = sum([float(v.budget) if v.budget else 0 for v in completed_ventures])
        
        # Calculate total budget safely
        all_ventures = SupportRequest.query.all()
        total_budget = sum([float(v.budget) if v.budget else 0 for v in all_ventures])
        
        metrics = {
            'total': total,
            'active': active,
            'completed': completed,
            'totalRevenue': total_revenue,
            'totalBudget': total_budget
        }
        
        return jsonify(metrics), 200
    
    except Exception as e:
        db.session.rollback()
        print(f"Error fetching metrics: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': 'Failed to fetch metrics',
            'message': str(e),
            'total': 0,
            'active': 0,
            'completed': 0,
            'totalRevenue': 0,
            'totalBudget': 0
        }), 200


@app.route('/api/ventures/search', methods=['GET'])
@jwt_required()
def search_ventures():
    """Search ventures"""
    try:
        query = request.args.get('q', '')
        
        if not query:
            return jsonify([]), 200
        
        # Search in subject, description, and client name
        results = SupportRequest.query.join(Client, SupportRequest.client_id == Client.id, isouter=True).filter(
            db.or_(
                SupportRequest.subject.ilike(f'%{query}%'),
                SupportRequest.description.ilike(f'%{query}%'),
                Client.name.ilike(f'%{query}%')
            )
        ).all()
        
        ventures = []
        for sr in results:
            # Calculate progress
            tasks = Task.query.filter_by(support_request_id=sr.id).all()
            total_tasks = len(tasks)
            completed_tasks = len([t for t in tasks if t.status == 'completed'])
            calculated_progress = int((completed_tasks / total_tasks * 100)) if total_tasks > 0 else 0
            
            # Get team
            team = []
            if sr.client_id:
                assignments = ClientEmployeeAssignment.query.filter_by(client_id=sr.client_id).all()
                for assignment in assignments:
                    user = User.query.filter_by(username=assignment.employee_username).first()
                    if user:
                        team.append({
                            'id': user.id,
                            'name': f"{user.first_name or ''} {user.last_name or ''}".strip() or user.username,
                            'email': user.email or '',
                            'role': assignment.employee_name or 'Team Member',
                            'avatar': None
                        })
            
            # Map status
            status_map = {
                'open': 'planning',
                'in_progress': 'active',
                'in-progress': 'active',
                'resolved': 'completed',
                'closed': 'completed',
                'on_hold': 'on_hold',
                'on-hold': 'on_hold'
            }
            venture_status = status_map.get(sr.status, 'active')
            
            venture = {
                'id': sr.id,
                'name': sr.subject,
                'description': sr.description,
                'status': venture_status,
                'progress': sr.progress or calculated_progress,
                'budget': float(sr.budget) if sr.budget else 0,
                'spent': float(sr.spent) if sr.spent else 0,
                'startDate': sr.start_date.isoformat() if sr.start_date else sr.created_at.isoformat(),
                'deadline': sr.delivery_date.isoformat() if sr.delivery_date else None,
                'team': team,
                'tasks': [],
                'tags': [],
                'clientId': sr.client_id,
                'clientName': sr.client.name if sr.client else None,
                'createdAt': sr.created_at.isoformat(),
                'updatedAt': sr.updated_at.isoformat()
            }
            ventures.append(venture)
        
        return jsonify(ventures), 200
    
    except Exception as e:
        print(f"Error searching ventures: {e}")
        return jsonify({'error': str(e)}), 500

