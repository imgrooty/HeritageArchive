# Cultural Heritage Archive Platform

A community-driven digital archive dedicated to documenting, translating, and mapping local cultural heritage, historical sites, and traditional practices in Nepal.

---

## 1. System Architecture Layout

The platform is split into two independent services:

```text
ai/ (Workspace Root)
├── backend/                    # FastAPI Backend REST API
│   ├── app/                    # Python API Source
│   └── README.md               # Backend API documentation
│
├── frontend/                   # Next.js App Router Web App
│   ├── src/                    # React & Tailwind Source
│   └── README.md               # Frontend Web documentation
│
├── docker-compose.yml          # Local database virtualization (PostGIS)
└── .gitignore                  # Git ignore rules
```

---

## 2. Key Technology Stack

* **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, MapLibre.
* **Backend**: FastAPI, Python 3.14, SQLAlchemy 2.0 (asyncpg), Pydantic V2, bcrypt.
* **Database**: PostgreSQL with PostGIS spatial indexing.
* **Infrastructure**: Docker Compose for local database isolation.

---

## 3. Spinning Up the Platform Locally

To start the complete application ecosystem:

### Step 1: Initialize the Local Database
Ensure Docker Desktop is active. From the workspace root directory, start the PostgreSQL + PostGIS container:
```bash
docker compose up -d
```

### Step 2: Launch the Backend Service
Navigate to `/backend`, activate the Python virtual environment, install dependencies, and run Uvicorn:
```bash
cd backend
python -m venv .venv

# Activate virtualenv (Windows Powershell)
.\.venv\Scripts\Activate.ps1
# Activate virtualenv (Linux/macOS)
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
*API documentation is available at [http://localhost:8000/docs](http://localhost:8000/docs).*

### Step 3: Launch the Frontend Web Client
Navigate to `/frontend`, install packages, and start the Next.js dev server:
```bash
cd frontend
npm install
npm run dev
```
*Open [http://localhost:3000](http://localhost:3000) to browse the application.*

---

## 4. Documentation References
For in-depth guides on components, folders, and operations, refer to:
* **Backend Documentation**: [backend/README.md](file:///c:/Users/HP/Documents/ai/backend/README.md)
* **Frontend Documentation**: [frontend/README.md](file:///c:/Users/HP/Documents/ai/frontend/README.md)
* **Product Requirements Document (PRD)**: [cultural_heritage_archive_formal_spec.md](file:///c:/Users/HP/Documents/ai/cultural_heritage_archive_formal_spec.md)
