from models.init_db import create_app
from models.models import db, User 

# Create Flask app
app = create_app()

# Create a user inside the app context
with app.app_context():
    # Create a new user
    new_user = User(
        username="demoUser",
        password="demouser",      # normally you'd hash this before saving
        profile_pic= "https://res.cloudinary.com/dm340hnd3/image/upload/v1764020381/wdi3v2ekt1bm99uxlk5j.webp"
    )

    # Add to session and commit
    db.session.add(new_user)
    db.session.commit()

    print("User created successfully!")
    print(f"User ID: {new_user.id}")

