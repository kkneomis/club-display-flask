#!/bin/bash

# Install dependencies
pip install -r requirements.txt

# Initialize database
python -c "import app; app.init_db()"

echo "Deployment completed successfully"