"""
WSGI entry point for Azure App Service
"""
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(__file__))

# Import the Flask app
from app import app, init_db

# Initialize the database
init_db()

# This is what gunicorn will call
application = app

if __name__ == "__main__":
    app.run()