from models.models import User, session
from dotenv import load_dotenv
import os


load_dotenv()
demo_userid = os.getenv("DEMO_USER_ID")

class UserDetails:
    def __init__(self, username,profilepic):
        self._username = username
        self._profilepic = profilepic

    @property 
    def username(self):
        return self._username
    
    @property
    def profilepic(self):
        return self._profilepic

    

def getUser():
    user = session.query(User).filter(User.id == demo_userid).first()
    if user:
        return UserDetails(user.username, user.profile_pic)
    else:
        return "User does not exist"
