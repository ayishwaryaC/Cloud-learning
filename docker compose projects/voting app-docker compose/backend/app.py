import os
import time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import redis
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg://postgres:postgres@db:5432/votes")
VOTE_OPTIONS = ["Cats", "Dogs", "Birds", "Fish"]

app = FastAPI(title="Voting API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)
engine = create_engine(DATABASE_URL, future=True)

class VoteIn(BaseModel):
    option: str


def wait_for_service(check_func, name: str, timeout: int = 30):
    start = time.time()
    while time.time() - start < timeout:
        try:
            if check_func():
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


@app.on_event("startup")
def startup_event():
    wait_for_service(is_redis_ready, "Redis")
    wait_for_service(is_db_ready, "Postgres")

    create_table_sql = """
    CREATE TABLE IF NOT EXISTS votes (
        id SERIAL PRIMARY KEY,
        option VARCHAR(64) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
    """
    with engine.begin() as conn:
        conn.execute(text(create_table_sql))


@app.get("/options")
def get_options():
    return {"options": VOTE_OPTIONS}


@app.post("/vote")
def cast_vote(vote: VoteIn):
    if vote.option not in VOTE_OPTIONS:
        raise HTTPException(status_code=400, detail="Invalid option")

    redis_client.rpush("vote_queue", vote.option)
    return {"status": "queued", "option": vote.option}


def get_pending_counts():
    queued = redis_client.lrange("vote_queue", 0, -1)
    pending_counts = {option: 0 for option in VOTE_OPTIONS}
    for option in queued:
        if option in pending_counts:
            pending_counts[option] += 1
    return pending_counts


@app.get("/results")
def get_results():
    query = text(
        "SELECT option, count(*) AS count FROM votes GROUP BY option ORDER BY option"
    )
    with engine.connect() as conn:
        rows = conn.execute(query).all()

    results = {option: 0 for option in VOTE_OPTIONS}
    for row in rows:
        results[row.option] = int(row.count)

    pending = get_pending_counts()
    for option, count in pending.items():
        results[option] += count

    return {"results": results}


@app.get("/health")
def health():
    return {"status": "ok"}
