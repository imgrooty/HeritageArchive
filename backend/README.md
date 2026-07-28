# Cultural Heritage Archive - FastAPI Backend Service

Production-ready async backend built with **FastAPI**, **SQLAlchemy 2.0 (asyncpg)**, and **Pydantic V2**.

---

## 1. Directory Blueprint

```text
backend/
├── app/
│   ├── main.py                   # FastAPI initialization & route registry
│   ├── api/                      # Modular APIRouters
│   │   └── routers/
│   │       ├── auth.py           # Registration & JWT authentication
│   │       ├── heritage.py       # Heritage CRUD & spatial query endpoints
│   │       ├── moderation.py     # Content moderation & review queue
│   │       ├── community.py      # Verification, comments & reputation
│   │       ├── translation.py    # Multilingual translation pipeline
│   │       ├── search.py         # Full-text & spatial search APIs
│   │       └── knowledge.py     # Graph-based cultural relationship discovery
│   │
│   ├── core/                     # Core configurations & db engine
│   │   ├── config.py             # pydantic-settings configuration
│   │   ├── database.py           # Async SQLAlchemy session setup
│   │   └── security.py           # Password hashing & JWT tokens
│   │
│   ├── models/                   # SQLAlchemy ORM Data Models
│   │   ├── user.py               # User identity & roles
│   │   ├── heritage.py           # Heritage sites & media assets
│   │   ├── community.py          # Verification & community interactions
│   │   └── knowledge.py          # Knowledge graph nodes & relations
│   │
│   ├── schemas/                  # Pydantic Request/Response DTOs
│   │   ├── user.py
│   │   ├── heritage.py
│   │   ├── moderation.py
│   │   ├── community.py
│   │   └── knowledge.py
│   │
│   └── services/                 # Business logic & AI helpers
│       ├── embeddings.py         # Vector generation for semantic search
│       └── translation.py        # Automated translation pipeline
│
├── static/                       # Uploaded media assets
├── tests/                        # Integration & unit test suites
└── requirements.txt              # Production dependency lockfile
```

---

## 2. Key Features

- **Asynchronous Execution**: Native async database operations using `asyncpg`.
- **PostGIS Spatial Support**: Native geographic point geometry and distance queries.
- **Multilingual Support**: Multilingual text preservation and translation management.
- **Community Verification**: Trust and verification workflows.
- **Content Moderation**: Review queue with state transitions (`draft` -> `submitted` -> `published` / `rejected`).
- **Semantic Search Readiness**: Integrated vector search capabilities.

---

## 3. Local Development Setup

### 1. Prerequisites
- Python 3.12 or higher.
- Active PostgreSQL database with PostGIS extension enabled (via `docker compose up -d` at workspace root).

### 2. Virtual Environment & Dependencies
```bash
python -m venv .venv

# Windows Powershell
.\.venv\Scripts\Activate.ps1

# Linux / macOS
source .venv/bin/activate

pip install -r requirements.txt
```

### 3. Launch Development Server
```bash
uvicorn app.main:app --reload --port 8000
```
Interactive Swagger API documentation will be accessible at:
👉 **[http://localhost:8000/docs](http://localhost:8000/docs)**
