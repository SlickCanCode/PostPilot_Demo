import psycopg2

conn = psycopg2.connect(
    host="localhost",
    database="postpilotdatabase",
    user="oreofe",
    password="Damilare121@",
    port=5432
)

cur = conn.cursor()

#user table
cur.execute("""
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    profile_pic TEXT
);
""")

#posts table
cur.execute("""
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    caption TEXT,
    image TEXT,
    time_scheduled TIMESTAMP NOT NULL,
    platform TEXT[] NOT NULL,
    status TEXT CHECK (status IN ('Pending', 'Posted')) NOT NULL DEFAULT 'Pending',
    CHECK (
        (caption IS NOT NULL AND image IS NULL)
        OR (caption IS NULL AND image IS NOT NULL)
    )
);
""")

conn.commit()
cur.close()
conn.close()
