from app import app
from waitress import serve
from services.postService import start_scheduler

with app.app_context():
    start_scheduler(app)
if __name__ == "__main__":
    serve(app, host="0.0.0.0", port=8000)