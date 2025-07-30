#!/bin/bash
# Try gunicorn first, fallback to direct python
gunicorn --bind=0.0.0.0:8000 --timeout 600 app:app || python app.py