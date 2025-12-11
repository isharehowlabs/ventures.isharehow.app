"""
Ventures API Endpoints - To be added to app.py
Maps existing support_requests to ventures with tasks and team
"""

# Add these lines after the SupportRequest model definition (around line 9620)
# Update the SupportRequest model to include new fields:

"""
After line 9565 (after updated_at field), add these new columns:

        # Venture/Project fields
        budget = db.Column(db.Numeric(10, 2), default=0, nullable=True)
        spent = db.Column(db.Numeric(10, 2), default=0, nullable=True)
        delivery_date = db.Column(db.DateTime, nullable=True)
        start_date = db.Column(db.DateTime, nullable=True)
        progress = db.Column(db.Integer, default=0, nullable=True)
"""

# Add at the end of app.py (before if __name__ == '__main__'):

# ============================================================================
# VENTURES API ENDPOINTS
# Maps support_requests to ventures with tasks, employees, and progress tracking
# ============================================================================

@app.route('/api/ventures', methods=['GET'])
@jwt_required()
def get_ventures():
    """Get all support requests as ventures"""
    try:
        current_user_id = get_jwt_identity()
        
        # Get all support requests
        support_requests = SupportRequest.query.order_by(SupportRequest.created_at.desc()).all()
        
        ventures = []
        for sr in support_requests:
            # Calculate progress from tasks
            tasks = Task.query.filter_by(support_request_id=sr.id).all()
            total_tasks = len(tasks)
            completed_tasks = len([t for t in tasks if t.status == 'completed'])
            calculated_progress = int((completed_tasks / total_tasks * 100)) if total_tasks > 0 else 0
            
            # Update progress in database if different
            if sr.progress != calculated_progress:
                sr.progress = calculated_progress
                db.session.commit()
            
            # Get team members from client assignments
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
                    'priority': 'medium',  # Default priority
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
            ventures.append(venture)
        
        return jsonify(ventures), 200
    
    except Exception as e:
        print(f"Error fetching ventures: {e}")
        return jsonify({'error': str(e)}), 500


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
@jwt_required()
def get_ventures_metrics():
    """Get venture metrics"""
    try:
        total = SupportRequest.query.count()
        active = SupportRequest.query.filter(SupportRequest.status.in_(['open', 'in_progress', 'in-progress'])).count()
        completed = SupportRequest.query.filter(SupportRequest.status.in_(['resolved', 'closed'])).count()
        
        # Calculate total revenue from completed ventures
        completed_ventures = SupportRequest.query.filter(SupportRequest.status.in_(['resolved', 'closed'])).all()
        total_revenue = sum([float(v.budget) if v.budget else 0 for v in completed_ventures])
        
        metrics = {
            'total': total,
            'active': active,
            'completed': completed,
            'totalRevenue': total_revenue,
            'totalBudget': sum([float(v.budget) if v.budget else 0 for v in SupportRequest.query.all()])
        }
        
        return jsonify(metrics), 200
    
    except Exception as e:
        print(f"Error fetching metrics: {e}")
        return jsonify({'error': str(e)}), 500


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

