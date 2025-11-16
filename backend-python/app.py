from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import os

app = Flask(__name__)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'postgresql://localhost/ventures')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app)

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
        import json
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
    db.create_all()

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    tasks = Task.query.all()
    return jsonify({'tasks': [task.to_dict() for task in tasks]})

@app.route('/api/tasks', methods=['POST'])
def create_task():
    data = request.get_json()
    import json
    import uuid
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
    import json
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
    socketio.run(app, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))