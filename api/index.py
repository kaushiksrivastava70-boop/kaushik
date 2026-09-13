import sys
import os

# Set up module path for Vercel Serverless Function
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(CURRENT_DIR)
BACKEND_DIR = os.path.join(ROOT_DIR, "backend_python")

for path in [BACKEND_DIR, ROOT_DIR]:
    if path not in sys.path:
        sys.path.insert(0, path)

from backend_python.main import app
