import os
import time
import redis
from sqlalchemy import create_engine, text

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg://postgres:postgres@db:5432/votes")

redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)
engine = create_engine(DATABASE_URL, future=True)


def wait_for_service(check_func, name: str, timeout: int = 30):
    start = time.time()
    while time.time() - start < timeout:
        try:
            if check_func():
                print(f"{name} is ready")
                return
        except Exception:
            pass
        time.sleep(1)
    raise RuntimeError(f"{name} did not become ready in time")


def is_redis_ready():
    return redis_client.ping()


def is_db_ready():
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    return True


wait_for_service(is_redis_ready, "Redis")
wait_for_service(is_db_ready, "Postgres")

print("Worker started, waiting for new votes...")
while True:
    item = redis_client.blpop("vote_queue", timeout=5)
    if item is None:
        continue

    _, option = item
    if not option:
        continue

    try:
        with engine.begin() as conn:
            conn.execute(text("INSERT INTO votes (option) VALUES (:option)"), {"option": option})
        print(f"Processed vote: {option}")
    except Exception as exc:
        print(f"Error inserting vote {option}: {exc}")
        time.sleep(1)
