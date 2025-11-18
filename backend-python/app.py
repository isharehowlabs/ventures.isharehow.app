from flask import Flask, request, jsonify, redirect, session, url_for
from flask_socketio import SocketIO, emit
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime, timedelta
import os
import uuid
import json
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Session configuration
app.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = os.environ.get('FLASK_ENV') == 'production'

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'postgresql://localhost/ventures')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
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

# Frontend URL helper - for redirects to frontend domain
def get_frontend_url():
    """Get the frontend URL from environment or default to production"""
    frontend_url = os.environ.get('FRONTEND_URL', 'https://ventures.isharehow.app')
    return frontend_url.rstrip('/')

# Task model
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

# Create tables
with app.app_context():
    try:
        db.create_all()
        print("Database tables created successfully")
    except Exception as e:
        print(f"Database connection failed: {e}")
        print("Tables will be created when database is available")

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
# --- Figma API Proxy Endpoints ---
FIGMA_ACCESS_TOKEN = os.environ.get('FIGMA_ACCESS_TOKEN')
FIGMA_API_URL = 'https://api.figma.com/v1'
FIGMA_TEAM_ID = os.environ.get('FIGMA_TEAM_ID')

def figma_headers():
    return {'X-Figma-Token': FIGMA_ACCESS_TOKEN}

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
    # Get all projects for the team
    r = requests.get(f'{FIGMA_API_URL}/teams/{FIGMA_TEAM_ID}/projects', headers=figma_headers())
    if not r.ok:
        return jsonify({'error': 'Figma API error', 'message': r.text}), 500
    projects = r.json().get('projects', [])
    all_files = []
    for project in projects:
        files_r = requests.get(f'{FIGMA_API_URL}/projects/{project["id"]}/files', headers=figma_headers())
        if files_r.ok:
            files = files_r.json().get('files', [])
            # Normalize file objects: use 'key' as 'id' for frontend compatibility
            normalized_files = []
            for file in files:
                normalized_file = {**file, 'projectName': project['name'], 'projectId': project['id']}
                # Map 'key' to 'id' if 'id' doesn't exist
                if 'key' in normalized_file and 'id' not in normalized_file:
                    normalized_file['id'] = normalized_file['key']
                normalized_files.append(normalized_file)
            all_files.extend(normalized_files)
    return jsonify({'projects': all_files})

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
# --- Auth Endpoints (session-based) ---
@app.route('/api/auth/me', methods=['GET'])
def auth_me():
    user = session.get('user')
    if user:
        return jsonify(user)
    return jsonify({'error': 'Not authenticated', 'message': 'No valid session found. Please log in again.'}), 401

@app.route('/api/auth/logout', methods=['POST'])
def auth_logout():
    session.clear()
    return jsonify({'message': 'Logged out successfully'})

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    tasks = Task.query.all()
    return jsonify({'tasks': [task.to_dict() for task in tasks]})

@app.route('/api/tasks', methods=['POST'])
def create_task():
    data = request.get_json()
    task = Task(
        id=str(uuid.uuid4()),
        title=data['title'],
        description=data.get('description', ''),
        hyperlinks=json.dumps(data.get('hyperlinks', [])),
        status=data.get('status', 'pending')
    )
    db.session.add(task)
    db.session.commit()
    socketio.emit('task_created', task.to_dict())
    return jsonify({'task': task.to_dict()}), 201

@app.route('/api/tasks/<task_id>', methods=['PUT'])
def update_task(task_id):
    task = Task.query.get_or_404(task_id)
    data = request.get_json()
    task.title = data.get('title', task.title)
    task.description = data.get('description', task.description)
    task.hyperlinks = json.dumps(data.get('hyperlinks', json.loads(task.hyperlinks) if task.hyperlinks else []))
    task.status = data.get('status', task.status)
    db.session.commit()
    socketio.emit('task_updated', task.to_dict())
    return jsonify({'task': task.to_dict()})

@app.route('/api/tasks/<task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    socketio.emit('task_deleted', {'id': task_id})
    return jsonify({'success': True})

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
        
        if not access_token:
            error_msg = token_data.get('error', 'Unknown error')
            print(f"Patreon OAuth error: No access token. Response: {token_data}")
            return redirect(f'{get_frontend_url()}/?auth=error&message=token_error')

        # Fetch user identity with memberships
        user_res = requests.get(
            "https://www.patreon.com/api/oauth2/v2/identity?include=memberships&fields[member]=patron_status,currently_entitled_amount_cents",
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=10
        )
        user_res.raise_for_status()
        user_data = user_res.json()
        
        print(f"Patreon API response: {json.dumps(user_data, indent=2)}")
        
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
        
        # Check membership status
        is_paid_member = False
        membership_tier = None
        membership_amount = 0
        
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
        
        # Store user data in session
        user_session_data = {
            'id': user_id,
            'name': user_name,
            'email': user_email,
            'avatar': user_avatar,
            'patreonId': user_id,
            'isPaidMember': is_paid_member,
            'membershipTier': membership_tier,
            'membershipAmount': membership_amount,
        }
        
        print(f"Storing user in session: {user_session_data}")
        session['user'] = user_session_data
        
        # Make sure session is saved
        session.permanent = True
        
        # Debug: Print session info
        print(f"Session user stored: {session.get('user', 'NOT FOUND')}")
        
        # Redirect to labs page with auth success (trailing slash for Next.js static export)
        # Use external redirect to ensure browser follows to frontend domain
        return redirect(f'{get_frontend_url()}/labs/?auth=success', code=302)
        
    except requests.exceptions.HTTPError as e:
        error_detail = "Unknown error"
        try:
            error_detail = e.response.json() if e.response else str(e)
        except:
            error_detail = str(e)
        print(f"Patreon OAuth HTTP error: {e} - {error_detail}")
        return redirect(f'{get_frontend_url()}/?auth=error&message=api_error')
    except requests.exceptions.Timeout:
        print("Patreon OAuth error: Request timeout")
        return redirect(f'{get_frontend_url()}/?auth=error&message=timeout')
    except requests.exceptions.RequestException as e:
        print(f"Patreon OAuth network error: {e}")
        return redirect(f'{get_frontend_url()}/?auth=error&message=network_error')
    except Exception as e:
        print(f"Patreon OAuth error: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        error_message = str(e)
        # Make error message URL-safe
        error_message = error_message.replace(' ', '_').replace(':', '').replace('\n', '')[:50]
        return redirect(f'{get_frontend_url()}/?auth=error&message=user_fetch_failed&detail={error_message}')

# Catch-all routes for frontend paths - redirect to frontend domain
# This must be at the end so all API routes are matched first
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