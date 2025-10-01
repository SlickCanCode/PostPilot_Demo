from sqlalchemy import create_engine
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session

DATABASE_URL = "postgresql+psycopg2://postgres:Damilare121%40@localhost:5432/postpilotdatabase"

engine = create_engine(DATABASE_URL)

Base = automap_base()
Base.prepare(autoload_with=engine)

Post = Base.classes.posts
session = Session(engine)

