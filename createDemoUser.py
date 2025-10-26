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
        profile_pic=None
    )

    # Add to session and commit
    db.session.add(new_user)
    db.session.commit()

    print("User created successfully!")
    print(f"User ID: {new_user.id}")
    demoUser_id = new_user.id
