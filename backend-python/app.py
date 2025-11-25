from flask import Flask, request, jsonify, redirect, session, url_for
from flask_socketio import SocketIO, emit
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

# Load environment variables
load_dotenv()

# Configure Gemini API
GOOGLE_AI_API_KEY = os.environ.get('GOOGLE_AI_API_KEY')

# Debugging: Log the GOOGLE_AI_API_KEY to verify it's being loaded
print(f"GOOGLE_AI_API_KEY (from os.environ): {os.environ.get('GOOGLE_AI_API_KEY')}")

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
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'postgresql://localhost/ventures')
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
socketio = SocketIO(app, cors_allowed_origins="*")

# Configure CORS to allow credentials (cookies)
# Note: flask-cors handles all CORS headers automatically, don't add them manually
allowed_origins = ['https://ventures.isharehow.app']
if os.environ.get('FLASK_ENV') != 'production':
    allowed_origins.append('http://localhost:5000')
    allowed_origins.append('http://localhost:3000')

CORS(app, 
     origins=allowed_origins,
     supports_credentials=True,
     allow_headers=['Content-Type', 'Authorization'])

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

# Task model - only define if database is available
if DB_AVAILABLE:
    class Task(db.Model):
        id = db.Column(db.String(36), primary_key=True)
        title = db.Column(db.String(200), nullable=False)
        description = db.Column(db.Text)
        hyperlinks = db.Column(db.Text)  # JSON string of array
        status = db.Column(db.String(20), default='pending')
        created_at = db.Column(db.DateTime, default=datetime.utcnow)
        updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

        def to_dict(self):
            return {
                'id': self.id,
                'title': self.title,
                'description': self.description,
                'hyperlinks': json.loads(self.hyperlinks) if self.hyperlinks else [],
                'status': self.status,
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
        last_checked = db.Column(db.DateTime, nullable=True)
        token_expires_at = db.Column(db.DateTime, nullable=True)
        patreon_connected = db.Column(db.Boolean, default=False, nullable=False)
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
            return {
                'id': self.patreon_id or self.username or str(self.id),  # Use patreon_id, username, or id
                'patreonId': self.patreon_id,
                'username': self.username,
                'email': self.email,
                'membershipPaid': self.membership_paid,  # Updated field name
                'patreonConnected': self.patreon_connected,
                'lastChecked': self.last_checked.isoformat() if self.last_checked else None
            }

    # Wellness Models
    class UserProfile(db.Model):
        __tablename__ = 'user_profiles'
        id = db.Column(db.String(36), primary_key=True)  # Patreon user ID
        email = db.Column(db.String(255), unique=True)
        name = db.Column(db.String(200))
        avatar_url = db.Column(db.Text)
        patreon_id = db.Column(db.String(50), nullable=True)
        membership_tier = db.Column(db.String(50))
        is_paid_member = db.Column(db.Boolean, default=False)
        membership_payment_date = db.Column(db.DateTime, nullable=True)
        membership_renewal_date = db.Column(db.DateTime, nullable=True)
        created_at = db.Column(db.DateTime, default=datetime.utcnow)
        updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

        def to_dict(self):
            return {
                'id': self.id,
                'email': self.email,
                'name': self.name,
                'avatarUrl': self.avatar_url,
                'patreonId': self.patreon_id,
                'membershipTier': self.membership_tier,
                'isPaidMember': self.is_paid_member,
                'membershipPaymentDate': self.membership_payment_date.isoformat() if self.membership_payment_date else None,
                'membershipRenewalDate': self.membership_renewal_date.isoformat() if self.membership_renewal_date else None,
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
        
        # Find user by ID
        user = None
        if user_id.isdigit():
            user = User.query.get(int(user_id))
        if not user:
            user = User.query.filter_by(username=user_id).first()
        if not user:
            user = User.query.filter_by(patreon_id=user_id).first()
        return user
    except Exception:
        return None

# Authentication decorator - DEPRECATED: Use @jwt_required() instead
def require_session(f):
    """DEPRECATED: Decorator to require authenticated session - Use @jwt_required() instead"""
    @wraps(f)
    @jwt_required()  # Use JWT authentication
    def decorated_function(*args, **kwargs):
        return f(*args, **kwargs)
    return decorated_function

def get_user_info():
    """Get user info from JWT token including id and role"""
    user = get_current_user()
    if not user:
        return None
    return {
        'id': user.patreon_id or user.username or str(user.id),
        'role': 'mentee',  # default to mentee (can be extended later)
        'name': user.username or user.email or 'Unknown'
    }

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
        # Check if username already exists
        if User.query.filter_by(username=username).first():
            return jsonify({'error': 'Username already exists'}), 400
        
        # Check if email already exists
        if email and User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already exists'}), 400
        
        # Create new user
        user = User(
            username=username,
            email=email or None,
            patreon_connected=False
        )
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        
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
        app.logger.error(f"Error in registration: {e}")
        db.session.rollback()
        return jsonify({'error': 'Registration failed'}), 500

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
        # Find user by username or email
        user = User.query.filter(
            (User.username == username_or_email) | (User.email == username_or_email)
        ).first()
        
        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid username/email or password'}), 401
        
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
        app.logger.error(f"Error in login: {e}")
        return jsonify({'error': 'Login failed'}), 500

@app.route('/api/auth/verify-patreon', methods=['POST'])
@jwt_required()
def verify_patreon():
    """DEPRECATED: Verify Patreon membership status - Use cron job for automatic verification"""
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
@jwt_required()
def auth_me():
    """Get current user information from JWT token"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 500
    
    try:
        # Get user ID from JWT
        user_id = get_jwt_identity()
        
        # Find user by ID (could be integer ID, username, or patreon_id)
        user = None
        if user_id and user_id.isdigit():
            user = User.query.get(int(user_id))
        if not user and user_id:
            user = User.query.filter_by(username=user_id).first()
        if not user and user_id:
            user = User.query.filter_by(patreon_id=user_id).first()
        
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
        
        # Return combined user data
        user_data = user.to_dict()
        user_data.update({
            'name': profile_data.get('name', user.username or user.email or 'User'),
            'avatarUrl': profile_data.get('avatarUrl', ''),
            'membershipTier': profile_data.get('membershipTier'),
            'isPaidMember': user.membership_paid,  # Updated field name
            'isTeamMember': profile_data.get('isTeamMember', False)
            # Removed needsPatreonVerification - handled by cron job
        })
        
        print(f"✓ User authenticated via JWT: {user_id}")
        return jsonify(user_data)
    except Exception as e:
        print(f"Error fetching user from database: {e}")
        app.logger.error(f"Error fetching user from database: {e}")
        return jsonify({'error': 'Database error'}), 500

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
        
        # Check membership status
        is_paid_member = False
        membership_tier = None
        membership_amount = 0
        last_charge_date = None
        pledge_start = None
        
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
                        
                        # Extract dates
                        last_charge_str = member_attrs.get('last_charge_date')
                        if last_charge_str:
                            try:
                                last_charge_date = datetime.fromisoformat(last_charge_str.replace('Z', '+00:00'))
                            except:
                                pass
                        pledge_start_str = member_attrs.get('pledge_start')
                        if pledge_start_str:
                            try:
                                pledge_start = datetime.fromisoformat(pledge_start_str.replace('Z', '+00:00'))
                            except:
                                pass
                        
                        if patron_status == 'active_patron':
                            is_paid_member = True
                            membership_amount = amount_cents / 100
                            if membership_amount >= 10:
                                membership_tier = 'premium'
                            elif membership_amount >= 5:
                                membership_tier = 'standard'
                            else:
                                membership_tier = 'basic'
                        break
        
        # Special handling for creator/admin
        if api_user_id == '56776112':
            is_paid_member = False
            membership_tier = None
            membership_amount = 0
        
        # Get refresh token from token response if available
        refresh_token = None
        # Note: Refresh token is only available during OAuth flow, not from manual token entry
        
        # Create or update user in database
        user = User.query.filter_by(patreon_id=api_user_id).first()
        if not user:
            user = User(
                patreon_id=api_user_id,
                email=user_email,
                access_token=access_token,
                refresh_token=refresh_token,
                membership_paid=is_paid_member,  # Updated field name
                last_checked=datetime.utcnow()
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
            expires_in = 3600
            user.token_expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
            print(f"✓ Updated existing user: {api_user_id}")
        
        # Also sync with UserProfile
        profile = UserProfile.query.get(api_user_id)
        if not profile:
            profile = UserProfile(
                id=api_user_id,
                email=user_email,
                name=user_name,
                avatar_url=user_avatar,
                patreon_id=api_user_id,
                membership_tier=membership_tier,
                is_paid_member=is_paid_member,
                membership_payment_date=last_charge_date if is_paid_member else None,
                membership_renewal_date=(last_charge_date + timedelta(days=30)) if (is_paid_member and last_charge_date) else None
            )
            db.session.add(profile)
        else:
            profile.email = user_email or profile.email
            profile.name = user_name or profile.name
            profile.avatar_url = user_avatar or profile.avatar_url
            profile.membership_tier = membership_tier
            profile.is_paid_member = is_paid_member
            if is_paid_member and last_charge_date:
                profile.membership_payment_date = last_charge_date
                profile.membership_renewal_date = last_charge_date + timedelta(days=30)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'User verified and created/updated successfully',
            'user': {
                'id': api_user_id,
                'patreonId': api_user_id,
                'email': user_email,
                'name': user_name,
                'isPaidMember': is_paid_member,
                'membershipTier': membership_tier,
                'membershipAmount': membership_amount,
                'lastChargeDate': last_charge_date.isoformat() if last_charge_date else None,
                'pledgeStart': pledge_start.isoformat() if pledge_start else None
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
def get_profile():
    """Get current user's profile"""
    if 'user' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    user_data = session['user']
    user_id = user_data.get('id')
    
    if not user_id:
        return jsonify({'error': 'Invalid session data'}), 400
    
    # Try to get profile from database if available
    if DB_AVAILABLE:
        try:
            profile = UserProfile.query.get(user_id)
            if profile:
                profile_dict = profile.to_dict()
                # Add last_charge_date and pledge_start from session if present
                profile_dict['lastChargeDate'] = user_data.get('lastChargeDate')
                profile_dict['pledgeStart'] = user_data.get('pledgeStart')
                return jsonify(profile_dict)
        except Exception as e:
            print(f"Warning: Failed to fetch profile from database: {e}")
            # Fall through to return session data
    
    # Return session data as fallback
    return jsonify({
        'id': user_data.get('id'),
        'email': user_data.get('email'),
        'name': user_data.get('name'),
        'avatarUrl': user_data.get('avatar'),
        'patreonId': user_data.get('patreonId'),
        'membershipTier': user_data.get('membershipTier'),
        'isPaidMember': user_data.get('isPaidMember', False),
        'lastChargeDate': user_data.get('lastChargeDate'),
        'pledgeStart': user_data.get('pledgeStart'),
    })

@app.route('/api/profile', methods=['PUT', 'OPTIONS'])
def update_profile():
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        response = jsonify({'message': 'OK'})
        response.headers.add('Access-Control-Allow-Origin', 'https://ventures.isharehow.app')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        response.headers.add('Access-Control-Allow-Methods', 'PUT, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response
    """Update user's profile (email and name)"""
    print("=" * 80)
    print("PROFILE UPDATE REQUEST:")
    print(f"  Method: {request.method}")
    print(f"  Content-Type: {request.headers.get('Content-Type')}")
    print(f"  Origin: {request.headers.get('Origin')}")
    print(f"  Cookie present: {'Cookie' in request.headers}")
    
    if 'user' not in session:
        print("✗ No user in session - not authenticated")
        print("=" * 80)
        return jsonify({'error': 'Not authenticated'}), 401
    
    user_data = session['user']
    user_id = user_data.get('id')
    print(f"✓ User authenticated: {user_id}")
    print(f"  - Is Paid Member: {user_data.get('isPaidMember', False)}")
    print(f"  - Membership Tier: {user_data.get('membershipTier')}")
    print(f"  - Membership Amount: ${user_data.get('membershipAmount', 0)}")
    print(f"  - Is Team Member: {user_data.get('isTeamMember', False)}")
    
    if not user_id:
        print("✗ Invalid session data - no user ID")
        print("=" * 80)
        return jsonify({'error': 'Invalid session data'}), 400
    
    # Get request data
    data = request.get_json()
    print(f"  Request data: {data}")
    
    if not data:
        print("✗ No data provided in request")
        print("=" * 80)
        return jsonify({'error': 'No data provided'}), 400
    
    new_email = data.get('email')
    new_name = data.get('name')
    print(f"  New email: {new_email}")
    print(f"  New name: {new_name}")
    
    # Validate email if provided
    if new_email is not None:
        if not new_email or '@' not in new_email:
            print("✗ Invalid email format")
            print("=" * 80)
            return jsonify({'error': 'Invalid email format'}), 400
    
    # Validate name if provided
    if new_name is not None:
        if not new_name or len(new_name.strip()) == 0:
            print("✗ Invalid name")
            print("=" * 80)
            return jsonify({'error': 'Name cannot be empty'}), 400
    
    # Update database if available
    if DB_AVAILABLE:
        try:
            profile = UserProfile.query.get(user_id)
            if not profile:
                # Create profile if it doesn't exist
                profile = UserProfile(
                    id=user_id,
                    email=new_email if new_email is not None else user_data.get('email'),
                    name=new_name if new_name is not None else user_data.get('name'),
                    avatar_url=user_data.get('avatar'),
                    patreon_id=user_data.get('patreonId'),
                    membership_tier=user_data.get('membershipTier'),
                    is_paid_member=user_data.get('isPaidMember', False)
                )
                db.session.add(profile)
                print(f"✓ Created user profile during update: {user_id}")
            else:
                # Update existing profile
                if new_email is not None:
                    profile.email = new_email
                if new_name is not None:
                    profile.name = new_name
                profile.updated_at = datetime.utcnow()
                print(f"✓ Updated user profile: {user_id}")
            
            db.session.commit()
            
            # Update session data to match
            if new_email is not None:
                session['user']['email'] = new_email
            if new_name is not None:
                session['user']['name'] = new_name
            
            session.modified = True
            
            return jsonify(profile.to_dict())
            
        except Exception as e:
            print(f"Error updating profile in database: {e}")
            import traceback
            traceback.print_exc()
            db.session.rollback()
            return jsonify({'error': 'Failed to update profile in database'}), 503
    else:
        # Update session only if database not available
        if new_email is not None:
            session['user']['email'] = new_email
        if new_name is not None:
            session['user']['name'] = new_name
        
        session.modified = True
        
        return jsonify({
            'id': user_data.get('id'),
            'email': session['user'].get('email'),
            'name': session['user'].get('name'),
            'avatarUrl': user_data.get('avatar'),
            'patreonId': user_data.get('patreonId'),
            'membershipTier': user_data.get('membershipTier'),
            'isPaidMember': user_data.get('isPaidMember', False)
        })


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
            status=data.get('status', 'pending')
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
            deadline=datetime.fromisoformat(data['deadline']) if data.get('deadline') else None,
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
            goal.deadline = datetime.fromisoformat(data['deadline']) if data['deadline'] else None
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
        is_admin = user.get('isPaidMember', False) or user.get('email') in ['soc@isharehowlabs.com', 'admin@isharehowlabs.com']
        
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
        
        if not GOOGLE_AI_API_KEY:
            return jsonify({
                'error': 'Gemini API not configured',
                'text': 'Gemini chat integration is not yet configured. Please configure GOOGLE_AI_API_KEY in your environment variables.'
            }), 500
        
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

        # Fetch user identity with memberships and campaign relationships, including last_charge_date and pledge_start
        identity_url = (
            "https://www.patreon.com/api/oauth2/v2/identity?include=memberships,campaigns"
            "&fields[member]=patron_status,currently_entitled_amount_cents,last_charge_date,pledge_start"
            "&fields[campaign]=name,creation_name"
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
        
        # Check membership status and team access
        is_paid_member = False
        membership_tier = None
        membership_amount = 0
        is_team_member = False
        last_charge_date = None
        pledge_start = None
        
        memberships = relationships.get('memberships', {}).get('data', [])
        campaigns = relationships.get('campaigns', {}).get('data', [])
        
        # Check if user owns any campaigns (indicates they're a creator/admin)
        if campaigns:
            is_team_member = True
            print(f"✓ User {user_id} is a campaign creator/owner - granting team access")
        
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
                        
                        # Extract last_charge_date and pledge_start
                        last_charge_str = member_attrs.get('last_charge_date')
                        if last_charge_str:
                            try:
                                last_charge_date = datetime.fromisoformat(last_charge_str.replace('Z', '+00:00'))
                            except:
                                pass
                        pledge_start_str = member_attrs.get('pledge_start')
                        if pledge_start_str:
                            try:
                                pledge_start = datetime.fromisoformat(pledge_start_str.replace('Z', '+00:00'))
                            except:
                                pass
                        
                        # Check if active patron
                        if patron_status == 'active_patron':
                            is_paid_member = True
                            membership_amount = amount_cents / 100  # Convert cents to dollars
                            # You can determine tier based on amount if needed
                            if membership_amount >= 10:
                                membership_tier = 'premium'
                            elif membership_amount >= 5:
                                membership_tier = 'standard'
                            else:
                                membership_tier = 'basic'
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
                            patreon_connected=True
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
                        print(f"✓ Linked Patreon account to existing user: {user.username or user.email}")
                else:
                    # Update existing Patreon-linked user
                    user.email = user_email or user.email
                    user.access_token = access_token
                    if refresh_token:
                        user.refresh_token = refresh_token
                    user.membership_paid = is_paid_member  # Updated field name
                    user.last_checked = datetime.utcnow()
                    user.token_expires_at = token_expires_at
                    user.patreon_connected = True
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
        
        # Sync user profile to database (UserProfile for wellness features)
        if DB_AVAILABLE:
            try:
                profile = UserProfile.query.get(user_id)
                if not profile:
                    # Create new profile
                    profile = UserProfile(
                        id=user_id,
                        email=user_email,
                        name=user_name,
                        avatar_url=user_avatar,
                        patreon_id=user_id,
                        membership_tier=membership_tier,
                        is_paid_member=is_paid_member,
                        membership_payment_date=datetime.utcnow() if is_paid_member else None,
                        membership_renewal_date=(datetime.utcnow() + timedelta(days=30)) if is_paid_member else None
                    )
                    db.session.add(profile)
                    print(f"✓ Created new user profile in database: {user_id}")
                else:
                    # Update existing profile
                    profile.email = user_email
                    profile.name = user_name
                    profile.avatar_url = user_avatar
                    profile.membership_tier = membership_tier
                    profile.is_paid_member = is_paid_member
                    # Only update payment date if it wasn't set before and they're now a paid member
                    if is_paid_member and not profile.membership_payment_date:
                        profile.membership_payment_date = datetime.utcnow()
                        profile.membership_renewal_date = datetime.utcnow() + timedelta(days=30)
                    profile.updated_at = datetime.utcnow()
                    print(f"✓ Updated existing user profile in database: {user_id}")
                
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

