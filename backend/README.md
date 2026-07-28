# Cultural Heritage Archive — FastAPI Backend API

This is the asynchronous, modular backend REST API for the Cultural Heritage Archive Platform. It is built with **FastAPI**, **SQLAlchemy 2.0** (using the `asyncpg` async driver), and validated with **Pydantic V2**.

---

## 1. Project Directory Structure

```text
backend/
├── app/
│   ├── main.py                 # FastAPI Application entrypoint & CORS rules
│   ├── api/
│   │   └── routers/
│   │       ├── auth.py         # Registration & OAuth2 login routes
│   │       ├── heritage.py     # Heritage CRUD, search, and image upload routes
│   │       └── moderation.py   # Moderator review queue & approval actions
│   ├── core/
│   │   ├── config.py           # Configuration loader (Pydantic Settings)
│   │   ├── database.py         # SQLAlchemy engine connection & session providers
│   │   └── security.py         # JWT tokens & role checking helpers
│   ├── models/
│   │   ├── user.py             # User SQL table & roles
│   │   └── heritage.py         # HeritageSite, Story, and HeritageMedia SQL tables
│   └── schemas/
│       ├── user.py             # Validation schemas for users & tokens
│       ├── heritage.py         # Validation schemas for sites, stories & media
│       └── moderation.py       # Validation schemas for moderator actions
├── requirements.txt            # Python package dependencies
└── static/
    └── uploads/                # Directory hosting locally uploaded media files (git ignored)
```

---

## 2. Key Features

* **JWT Authentication**: Secured session management with cryptographically signed tokens.
* **Role-Based Access Control (RBAC)**: Custom `RoleChecker` guards restricting endpoints to specific user classifications (`explorer`, `contributor`, `verifier`, `moderator`, `admin`).
* **Relational Database Design**: Eager loading configuration using SQLAlchemy `selectinload` to optimize spatial queries and avoid N+1 query overhead.
* **Local Media Storage**: Integrated multipart form-data image uploader saving assets locally and serving them on demand.
* **Automatic API Documentation**: Instant interactive Swagger and ReDoc interfaces mounted by FastAPI.

---

## 3. Local Setup & Installation

### Prerequisite
* Python 3.12 or newer.
* (Optional) Docker Desktop to run local database services.

### Installation Steps

1. **Create Python Virtual Environment**
   ```bash
   python -m venv .venv
   ```

2. **Activate the Environment**
   * **Windows Powershell**:
     ```powershell
     .\.venv\Scripts\Activate.ps1
     ```
   * **Linux/macOS**:
     ```bash
     source .venv/bin/activate
     ```

3. **Install Package Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Database Configuration**
   The database configuration is read from the `.env` file at the root of the workspace. If you are starting a PostgreSQL container, run:
   ```bash
   docker compose up -d
   ```

5. **Start the API Server**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

---

## 4. API Endpoints Reference

### Authentication
* `POST /auth/register` - Create user. Pattern matches username to automatically assign test roles locally (`moderator`, `verifier`, `contributor`).
* `POST /auth/login` - Authenticate using credentials and receive Bearer Token.

### Heritage Archive Records
* `GET /heritage` - List approved heritage sites. Supports query filters: `category` and `search` (searches title & content).
* `GET /heritage?include_pending=true` - Access the full archive listing (requires moderator or admin privileges).
* `POST /heritage` - Submit a new heritage site and its initial story (status is set to `pending`).
* `GET /heritage/{id}` - Fetch details of a specific site.
* `POST /heritage/{id}/media` - Upload and attach an image to a site (only site creator or moderators).

### Moderation Queue
* `GET /moderation/queue` - List pending sites (requires moderator/admin privileges).
* `POST /moderation/{id}/action` - Approve, reject, or request changes on a submission (restricted). On approval, the contributing user's reputation score is boosted.

---

## 5. Automated Interactive Documentation
Once the server is running, explore the endpoints interactively:
* **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
