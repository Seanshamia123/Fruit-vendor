## Fruit Vendor Backend

FastAPI service managing vendors, inventory, sales, payments, and MPESA integrations for the Fruit Vendor platform. The app relies on SQLAlchemy ORM models backed by a MySQL database and issues JWTs for vendor authentication.

### Tech Stack
- Python 3.10, FastAPI, Uvicorn
- SQLAlchemy ORM with PyMySQL driver
- Pydantic v2 schema models
- Passlib + python-jose for password hashing and JWTs
- Alembic scaffolding for migrations (`backend/migrations`)

### Prerequisites
- Python 3.10.x (see `backend/venv/pyvenv.cfg`)
- MySQL 8.x instance reachable with a dedicated database
- (Optional) virtualenvwrapper or similar tooling

### 1. Create and activate a virtual environment
```bash
cd backend
python3.10 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
```

### 2. Install dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```
> The requirements file is UTF-16 encoded; recent versions of `pip` detect this automatically. If you encounter an encoding error, re-run with `pip install -r requirements.txt --no-deps --use-pep517` after converting the file to UTF-8 (e.g. `iconv -f utf-16 -t utf-8 requirements.txt > requirements.utf8`).

### 3. Configure environment variables
Create a `.env` file beside `backend/app/main.py` or export the variables in your shell. Required keys:

| Variable | Purpose |
| --- | --- |
| `DB_USER`, `DB_PASS`, `DB_HOST`, `DB_PORT`, `DB_NAME` | MySQL connection settings used by `app/database.py`. |
| `SECRET_KEY` | JWT signing secret shared by `app/core/security.py` and auth routes. |
| `ALGORITHM` | JWT algorithm (e.g. `HS256`). |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime (integer minutes). |
| `MPESA_BASE_URL` | Optional override for Safaricom Daraja base URL (defaults to sandbox). |
| `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET` | OAuth credentials for STK push. |
| `MPESA_SHORTCODE` | Till/Paybill shortcode (defaults to `174379`). |
| `MPESA_PASSKEY` | Daraja STK passkey. |
| `MPESA_CALLBACK_URL` | Public HTTPS callback ending with `/mpesa/callback`. |
| `MPESA_TIMEOUT` | Optional request timeout in seconds (default `30`). |
| `LOG_DIR` | Directory for MPESA request/response logs (`logs` by default). |

For local development you can duplicate a `.env.example` once it exists, or create one manually:
```env
DB_USER=fruit_vendor
DB_PASS=local_password
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=fruit_vendor
SECRET_KEY=change_me
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://<ngrok-id>.ngrok.app/mpesa/callback
```

### 4. Provision the database schema

The repo ships with both Alembic scaffolding and a helper script. Pick one workflow:

**Quick start (auto-create all tables)**
```bash
python migrate.py
```

**Using Alembic**
1. Update `alembic.ini` → `sqlalchemy.url` with your MySQL DSN, or export `DATABASE_URL` before running commands.
2. Generate a migration after model changes:
   ```bash
   alembic revision --autogenerate -m "describe change"
   ```
3. Apply migrations:
   ```bash
   alembic upgrade head
   ```

### 5. Run the API locally
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The OpenAPI docs will be available at `http://localhost:8000/docs` with JWT-protected routes under the `Auth` tag.

### Project layout
```
backend/app/
  core/              # security, configuration helpers
  database.py        # SQLAlchemy engine and session factory
  main.py            # FastAPI app + router registration
  models/            # SQLAlchemy models (product, vendor, inventory...)
  routes/            # FastAPI routers (auth, sales, MPESA, etc.)
  schemas/           # Pydantic DTOs
  services/          # External integrations (e.g. MPESA)
```

### Common tasks
- **Create an admin/vendor user:** `POST /auth/register` with name, email, contact, password.
- **Authenticate:** `POST /auth/login` to obtain a bearer token.
- **Trigger MPESA STK push:** `POST /mpesa/stk-push` with an authenticated token and phone/amount payload.
- **Check DB connection quickly:** `uvicorn app.main:app --reload` and hit `/ping`.

### Troubleshooting
- Enable SQL echo logging by default (`engine = create_engine(..., echo=True)` in `app/database.py`). Toggle to `False` for production.
- If MPESA requests fail immediately, verify the callback URL is publicly reachable and uses HTTPS as enforced in `app/services/mpesa.py`.
- Missing tables? Ensure `.env` is loaded (the project uses `python-dotenv`) and re-run `python migrate.py` or Alembic migrations.
