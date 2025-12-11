# Ventures Panel - Backend Integration Guide

## Current State
The ventures panel uses a mock service (`ventureService.ts`) with in-memory data. This guide shows how to integrate with your real backend API.

## Backend API Endpoints Needed

### 1. Get All Ventures
```
GET /api/ventures
Response: Venture[]
```

### 2. Get Venture by ID
```
GET /api/ventures/:id
Response: Venture
```

### 3. Create Venture
```
POST /api/ventures
Body: Omit<Venture, 'id' | 'createdAt' | 'updatedAt'>
Response: Venture
```

### 4. Update Venture
```
PUT /api/ventures/:id
Body: Partial<Venture>
Response: Venture
```

### 5. Delete Venture
```
DELETE /api/ventures/:id
Response: { success: boolean }
```

### 6. Get Metrics
```
GET /api/ventures/metrics
Response: VentureMetrics
```

### 7. Search Ventures
```
GET /api/ventures/search?q=:query
Response: Venture[]
```

## Integration Steps

### Step 1: Update ventureService.ts

Replace the mock implementation with real API calls:

```typescript
import { getBackendUrl } from '../utils/backendUrl';

class VentureService {
  private baseUrl = `${getBackendUrl()}/api/ventures`;

  async getVentures(): Promise<Venture[]> {
    const response = await fetch(this.baseUrl, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch ventures');
    return response.json();
  }

  async getVentureById(id: number): Promise<Venture | undefined> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) return undefined;
    return response.json();
  }

  async createVenture(ventureData: Omit<Venture, 'id' | 'createdAt' | 'updatedAt'>): Promise<Venture> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ventureData),
    });
    if (!response.ok) throw new Error('Failed to create venture');
    return response.json();
  }

  async updateVenture(id: number, updates: Partial<Venture>): Promise<Venture | undefined> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) return undefined;
    return response.json();
  }

  async deleteVenture(id: number): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  }

  async getMetrics(): Promise<VentureMetrics> {
    const response = await fetch(`${this.baseUrl}/metrics`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch metrics');
    return response.json();
  }

  async searchVentures(query: string): Promise<Venture[]> {
    const response = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to search ventures');
    return response.json();
  }
}

export const ventureService = new VentureService();
```

### Step 2: Backend Database Schema (Example: PostgreSQL)

```sql
-- Ventures table
CREATE TABLE ventures (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL,
  progress INTEGER DEFAULT 0,
  budget DECIMAL(10, 2) NOT NULL,
  spent DECIMAL(10, 2) DEFAULT 0,
  start_date DATE NOT NULL,
  deadline DATE NOT NULL,
  client_id INTEGER REFERENCES clients(id),
  client_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team members junction table
CREATE TABLE venture_team_members (
  id SERIAL PRIMARY KEY,
  venture_id INTEGER REFERENCES ventures(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  role VARCHAR(100),
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE venture_tasks (
  id SERIAL PRIMARY KEY,
  venture_id INTEGER REFERENCES ventures(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'todo',
  assigned_to INTEGER REFERENCES users(id),
  due_date DATE,
  priority VARCHAR(20) DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tags junction table
CREATE TABLE venture_tags (
  id SERIAL PRIMARY KEY,
  venture_id INTEGER REFERENCES ventures(id) ON DELETE CASCADE,
  tag VARCHAR(100) NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_ventures_status ON ventures(status);
CREATE INDEX idx_ventures_client_id ON ventures(client_id);
CREATE INDEX idx_venture_team_venture_id ON venture_team_members(venture_id);
CREATE INDEX idx_venture_tasks_venture_id ON venture_tasks(venture_id);
CREATE INDEX idx_venture_tags_venture_id ON venture_tags(venture_id);
```

### Step 3: Backend API Implementation (Example: Python/Flask)

```python
from flask import Blueprint, request, jsonify
from models import Venture, VentureTeamMember, VentureTask, VentureTag
from auth import require_auth
from database import db

ventures_bp = Blueprint('ventures', __name__)

@ventures_bp.route('/api/ventures', methods=['GET'])
@require_auth
def get_ventures():
    ventures = Venture.query.all()
    return jsonify([v.to_dict() for v in ventures])

@ventures_bp.route('/api/ventures/<int:id>', methods=['GET'])
@require_auth
def get_venture(id):
    venture = Venture.query.get_or_404(id)
    return jsonify(venture.to_dict())

@ventures_bp.route('/api/ventures', methods=['POST'])
@require_auth
def create_venture():
    data = request.json
    venture = Venture(**data)
    db.session.add(venture)
    db.session.commit()
    return jsonify(venture.to_dict()), 201

@ventures_bp.route('/api/ventures/<int:id>', methods=['PUT'])
@require_auth
def update_venture(id):
    venture = Venture.query.get_or_404(id)
    data = request.json
    for key, value in data.items():
        setattr(venture, key, value)
    venture.updated_at = datetime.utcnow()
    db.session.commit()
    return jsonify(venture.to_dict())

@ventures_bp.route('/api/ventures/<int:id>', methods=['DELETE'])
@require_auth
def delete_venture(id):
    venture = Venture.query.get_or_404(id)
    db.session.delete(venture)
    db.session.commit()
    return jsonify({'success': True})

@ventures_bp.route('/api/ventures/metrics', methods=['GET'])
@require_auth
def get_metrics():
    total = Venture.query.count()
    active = Venture.query.filter_by(status='active').count()
    completed = Venture.query.filter_by(status='completed').count()
    total_revenue = db.session.query(db.func.sum(Venture.budget))\
        .filter_by(status='completed').scalar() or 0
    
    return jsonify({
        'total': total,
        'active': active,
        'completed': completed,
        'totalRevenue': float(total_revenue)
    })

@ventures_bp.route('/api/ventures/search', methods=['GET'])
@require_auth
def search_ventures():
    query = request.args.get('q', '')
    ventures = Venture.query.filter(
        db.or_(
            Venture.name.ilike(f'%{query}%'),
            Venture.description.ilike(f'%{query}%'),
            Venture.client_name.ilike(f'%{query}%')
        )
    ).all()
    return jsonify([v.to_dict() for v in ventures])
```

### Step 4: Authentication Integration

The service already follows your existing pattern with `getBackendUrl()`. Make sure to:

1. Include authentication tokens in requests
2. Handle 401 Unauthorized responses
3. Redirect to login if needed
4. Use the same auth pattern as your existing CRM endpoints

### Step 5: Error Handling

Add better error handling in VenturesPanel component:

```typescript
const loadVentures = async () => {
  try {
    setLoading(true);
    const data = await ventureService.getVentures();
    setVentures(data);
    setError(null);
  } catch (err) {
    if (err.message.includes('401')) {
      // Redirect to login
      window.location.href = '/login';
    } else {
      setError('Failed to load ventures. Please try again.');
    }
    console.error(err);
  } finally {
    setLoading(false);
  }
};
```

## Testing the Integration

### 1. Test with Mock Data First
Keep the mock service active until backend is ready.

### 2. Use Environment Variables
```typescript
// In ventureService.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || getBackendUrl();
```

### 3. Add Loading States
Already implemented in VenturesPanel component.

### 4. Test Error Scenarios
- Network failures
- Invalid data
- Authentication errors
- Permission issues

## Migration Path

1. **Phase 1**: Use mock data (current state) ✓
2. **Phase 2**: Set up backend database schema
3. **Phase 3**: Implement backend API endpoints
4. **Phase 4**: Update frontend service to use API
5. **Phase 5**: Test with real data
6. **Phase 6**: Deploy to production

## Additional Enhancements

### Real-time Updates (WebSocket)
```typescript
// Add to VenturesPanel
useEffect(() => {
  const ws = new WebSocket('wss://your-api/ventures/updates');
  ws.onmessage = (event) => {
    const update = JSON.parse(event.data);
    // Update local state
    setVentures(prev => 
      prev.map(v => v.id === update.id ? update : v)
    );
  };
  return () => ws.close();
}, []);
```

### Caching Strategy
```typescript
// Use React Query or SWR
import { useQuery } from 'react-query';

const { data, isLoading } = useQuery('ventures', 
  () => ventureService.getVentures(),
  { staleTime: 60000 } // Cache for 1 minute
);
```

---
Your ventures panel is production-ready once you connect it to your backend!
