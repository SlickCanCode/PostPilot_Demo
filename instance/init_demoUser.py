import psycopg2
from psycopg2 import sql

def create_user(username, password, profile_pic=None):
    try:
        # Connect to database
        conn = psycopg2.connect(
            dbname="postpilotdatabase",
            user="oreofe",
            password="Damilare121@",
            host="localhost",
            port="5432"
        )
        cur = conn.cursor()

        # Insert a new user
        insert_query = sql.SQL("""
            INSERT INTO users (username, password, profile_pic)
            VALUES (%s, %s, %s)
            RETURNING id;
        """)

        cur.execute(insert_query, (username, password, profile_pic))
        user_id = cur.fetchone()[0]

        conn.commit()
        print(f"User created successfully with ID: {user_id}")

    except psycopg2.Error as e:
        print("Error creating user:", e)

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


create_user("demouser", "demo123", r"C:\Users\HP\Freelance Demos\PostPilotDemo\static\uploads\ppLogo.png")
