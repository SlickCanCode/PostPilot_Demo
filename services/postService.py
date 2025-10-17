from models.post import Post, session
from models.user import demo_userid
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.exc import IntegrityError, SQLAlchemyError




def schedule_post(caption, image, time_scheduled, platforms,post_id=None): 
    print(Post.__table__)
    if not image or image == [None] or image == ['']:
        image = None
    if post_id:
        post = session.query(Post).filter(Post.id == post_id).first()
        if post:
            if caption:
                post.caption = caption
            if image:
                post.image = image
            if time_scheduled:
                post.time_scheduled = time_scheduled
            if platforms:
                post.platform = platforms
            if time_scheduled:
                post.time_scheduled = time_scheduled;
                now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                if time_scheduled > now:
                    post.status = "Pending"
            session.commit()
            
    else:
        new_post = Post(
            user_id=demo_userid,
            caption=caption,
            image=image ,
            time_scheduled=time_scheduled,
            platform=platforms,
            status='Pending'
        )
        try: 
            session.add(new_post)
            session.commit()
            print(new_post.id)
            return new_post.id
        
        except IntegrityError as e:
            session.rollback()
            print("Database constraint violated:", str(e))
            return "Either caption or image must be provided."

        except SQLAlchemyError as e:
            session.rollback()
            print("Error creating post:", str(e))
            return str(e)

def getPostedPosts():
    posts = session.query(Post).filter(
    (Post.user_id == demo_userid) & (Post.status == "Posted")).all()
    sorted_posts = sorted(posts, key=lambda post: post.time_scheduled)
    return sorted_posts[::-1]

def getPendingPosts():
    posts = session.query(Post).filter(
    (Post.user_id == demo_userid) & (Post.status == "Pending")).all()
    sorted_posts = sorted(posts, key=lambda post: post.time_scheduled)
    return sorted_posts[::-1]

def getPost(post_id):
    post = session.query(Post).filter(Post.id == post_id).first()
    if post:
        return post
    else:
        return "Post does not exist"

def deletePost(post_id):
    post = session.query(Post).filter(Post.id == post_id).first()
    if post:
        session.delete(post)
        session.commit()
        print("Post deleted successfully.")
    else:
        print("Post not found.")

def check_scheduled_posts(app):
    with app.app_context():
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        posts = session.query(Post).filter(Post.time_scheduled <= now, Post.status == "Pending").all()
        for post in posts:
            post.status = "Posted"
        session.commit()

def start_scheduler(app):
    scheduler = BackgroundScheduler()
    scheduler.add_job(func=lambda: check_scheduled_posts(app), trigger="interval", seconds=60)
    scheduler.start()
