# migrations/env.py
from __future__ import annotations

import os
import sys
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

# --- Ensure the project root is on sys.path (optional but handy) ---
# Adjust the join(...) if your layout differs.
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Alembic Config object, provides access to values within alembic.ini
config = context.config

# Configure Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# --- Import your Base and models so tables register on Base.metadata ---
# NOTE: Prefer putting Base in app/models/__init__.py to avoid engine creation side-effects.
from app.database import Base  # contains your Declarative Base
from app.models import (
    vendor,
    product,
    inventory,
    sale,
    purchase,
    vendor_preference,
    cart,
    cart_item,
    payment,
    inventory_history,
    product_pricing,
    bonus_rule,
    spoilage_entry,
)

# THIS is what Alembic needs for --autogenerate:
target_metadata = Base.metadata

# Optionally allow DATABASE_URL to override alembic.ini
db_url = os.getenv("DATABASE_URL")
if db_url:
    config.set_main_option("sqlalchemy.url", db_url)


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,             # detect column type changes
        compare_server_default=True,   # detect server_default changes
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
            # include_schemas=False,  # set True if you use schemas
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
