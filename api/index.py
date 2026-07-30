import sys
from pathlib import Path

# Add backend and project root directories to sys.path for Vercel Serverless Function imports
api_dir = Path(__file__).resolve().parent
project_root = api_dir.parent
backend_dir = project_root / "backend"

for p in [str(project_root), str(backend_dir)]:
    if p not in sys.path:
        sys.path.insert(0, p)

from app.main import app

