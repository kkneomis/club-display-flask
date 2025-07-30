# Wedding LED Display - Flask Version

A clean, simple Flask application for managing wedding messages on an LED display sign.

## Features

- **Message Submission**: Guests can submit 4-line messages (14 chars each)
- **LED Display**: Cycles through messages with 25-second timer
- **Admin Panel**: Manage queue, view stats, trigger celebrations
- **SQLite Database**: Persistent message storage
- **Priority System**: Unshown messages displayed first
- **Celebrations**: Sparkler effects for new messages
- **Responsive Design**: Works on mobile and desktop

## Setup

1. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the application**:
   ```bash
   python app.py
   ```

3. **Access the application**:
   - **Submit messages**: http://localhost:3000/
   - **LED Display**: http://localhost:3000/display
   - **Admin panel**: http://localhost:3000/admin

## Pages

### Message Submission (/)
- 4-line message input with character limits
- Real-time character counting
- Queue position display after submission

### LED Display (/display)
- Animated LED sign with floating effects
- 25-second message rotation (press 'F' for fast mode)
- Progress bar and timer
- Sparkler celebrations for new messages
- Marquee font styling with realistic shadows

### Admin Panel (/admin)
- Message queue management
- Statistics dashboard
- Celebration trigger button
- Individual message removal
- Clear all messages function

## Database

Uses SQLite with two tables:
- `messages`: Stores message content, shown status, timestamps
- `stats`: Tracks submission statistics

## API Endpoints

- `GET /api/messages` - Get all messages
- `POST /api/messages` - Add new message
- `PUT /api/messages/<id>/shown` - Mark message as shown
- `POST /api/messages/reset-shown` - Reset all messages to unshown
- `DELETE /api/messages/<id>` - Delete specific message
- `DELETE /api/messages` - Clear all messages
- `GET /api/stats` - Get statistics
- `POST /api/celebration` - Trigger celebration

## Production Deployment

For production, consider:
1. Set `debug=False` in app.py
2. Use a production WSGI server like Gunicorn
3. Configure proper database backups
4. Set up SSL/HTTPS
5. Configure firewall rules

## File Structure

```
flask-display/
├── app.py                 # Flask application
├── requirements.txt       # Python dependencies
├── wedding_messages.db    # SQLite database (auto-created)
├── templates/
│   ├── base.html         # Base template
│   ├── index.html        # Submission page
│   ├── display.html      # LED display page
│   └── admin.html        # Admin panel
└── static/
    ├── css/
    │   ├── style.css     # Base styles
    │   ├── display.css   # Display page styles
    │   └── admin.css     # Admin page styles
    ├── js/
    │   ├── main.js       # Common utilities
    │   ├── submission.js # Submission page logic
    │   ├── display.js    # Display page logic
    │   └── admin.js      # Admin page logic
    └── sign_background.png # LED sign image
```