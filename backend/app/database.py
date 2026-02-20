from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
```

Also, two other things I noticed in this log:

**1. Wrong start command** — it's running `uvicorn app.main:app --reload` but `--reload` is for development only and actually causes issues on Render. Go to Render → your backend service → **Settings** → **Start Command** and make sure it's:
```
uvicorn app.main:app --host 0.0.0.0 --port $PORT
