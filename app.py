from flask import Flask, render_template, request, jsonify, redirect, url_for
import sqlite3
import json
from datetime import datetime
import os
import time

app = Flask(__name__)

# In-memory store for celebration triggers
celebration_triggers = []

# Database setup
DB_PATH = 'wedding_messages.db'

def init_db():
    """Initialize the SQLite database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create messages table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            line1 TEXT NOT NULL,
            line2 TEXT DEFAULT '',
            line3 TEXT DEFAULT '',
            line4 TEXT DEFAULT '',
            shown INTEGER DEFAULT 0,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create stats table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS stats (
            key TEXT PRIMARY KEY,
            value INTEGER DEFAULT 0
        )
    ''')
    
    # Initialize stats
    cursor.execute('INSERT OR IGNORE INTO stats (key, value) VALUES (?, ?)', ('total_submitted', 0))
    
    conn.commit()
    conn.close()

def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    """Message submission page"""
    return render_template('index.html')

@app.route('/display')
def display():
    """LED sign display page"""
    return render_template('display.html')

@app.route('/admin')
def admin():
    """Admin page"""
    return render_template('admin.html')

@app.route('/api/messages', methods=['GET'])
def get_messages():
    """Get all messages ordered by priority (unshown first)"""
    conn = get_db_connection()
    messages = conn.execute('''
        SELECT * FROM messages 
        ORDER BY shown ASC, timestamp ASC
    ''').fetchall()
    conn.close()
    
    return jsonify([dict(row) for row in messages])

@app.route('/api/messages', methods=['POST'])
def add_message():
    """Add a new message"""
    data = request.json
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Insert message
    cursor.execute('''
        INSERT INTO messages (line1, line2, line3, line4) 
        VALUES (?, ?, ?, ?)
    ''', (
        data.get('line1', '').upper()[:14],
        data.get('line2', '').upper()[:14],
        data.get('line3', '').upper()[:14],
        data.get('line4', '').upper()[:14]
    ))
    
    # Update stats
    cursor.execute('UPDATE stats SET value = value + 1 WHERE key = ?', ('total_submitted',))
    
    conn.commit()
    message_id = cursor.lastrowid
    conn.close()
    
    return jsonify({'success': True, 'id': message_id})

@app.route('/api/messages/<int:message_id>/shown', methods=['PUT'])
def mark_message_shown(message_id):
    """Mark a message as shown"""
    conn = get_db_connection()
    conn.execute('UPDATE messages SET shown = 1 WHERE id = ?', (message_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

@app.route('/api/messages/reset-shown', methods=['POST'])
def reset_all_shown():
    """Reset all messages to unshown"""
    conn = get_db_connection()
    conn.execute('UPDATE messages SET shown = 0')
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

@app.route('/api/messages/<int:message_id>', methods=['DELETE'])
def delete_message(message_id):
    """Delete a message"""
    conn = get_db_connection()
    conn.execute('DELETE FROM messages WHERE id = ?', (message_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

@app.route('/api/messages', methods=['DELETE'])
def clear_all_messages():
    """Clear all messages"""
    conn = get_db_connection()
    conn.execute('DELETE FROM messages')
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

@app.route('/api/stats')
def get_stats():
    """Get statistics"""
    conn = get_db_connection()
    stats = conn.execute('SELECT * FROM stats').fetchall()
    messages = conn.execute('SELECT COUNT(*) as total FROM messages').fetchone()
    shown_count = conn.execute('SELECT COUNT(*) as shown FROM messages WHERE shown = 1').fetchone()
    conn.close()
    
    return jsonify({
        'total_submitted': dict(stats[0])['value'] if stats else 0,
        'total_messages': messages['total'],
        'shown_messages': shown_count['shown']
    })

@app.route('/api/celebration', methods=['POST'])
def trigger_celebration():
    """Trigger celebration"""
    global celebration_triggers
    trigger_time = time.time()
    celebration_triggers.append(trigger_time)
    
    # Keep only recent triggers (last 30 seconds)
    celebration_triggers = [t for t in celebration_triggers if trigger_time - t < 30]
    
    return jsonify({'success': True, 'timestamp': trigger_time})

@app.route('/api/celebration/poll')
def poll_celebrations():
    """Poll for celebration triggers"""
    global celebration_triggers
    current_time = time.time()
    
    # Clean up old triggers
    celebration_triggers = [t for t in celebration_triggers if current_time - t < 30]
    
    # Return recent triggers (last 5 seconds)
    recent_triggers = [t for t in celebration_triggers if current_time - t < 5]
    
    return jsonify({
        'triggers': recent_triggers,
        'count': len(recent_triggers)
    })

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=3000)