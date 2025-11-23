from models.models import Post, session
from .userService import demo_userid
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from apscheduler.schedulers.background import BackgroundScheduler
from werkzeug.utils import secure_filename
from PIL import Image
from dotenv import load_dotenv
import ffmpeg
import cloudinary
import cloudinary.uploader
import os
import shutil
import mimetypes

load_dotenv()

cloudinary.config(
      cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME'),
      api_key = os.getenv('CLOUDINARY_API_KEY'),
      api_secret = os.getenv('CLOUDINARY_API_SECRET'),
      secure = True
  )

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def handle_mediacompression(files):
    compressed_media = []
    for file in files:
        if file and file.filename != '':
            filename = secure_filename(file.filename)
            input_path = os.path.join(UPLOAD_FOLDER, filename)
            output_path = os.path.join(UPLOAD_FOLDER, "compressed_" + filename)
            
            print("ive gottten here")
            file.save(input_path)
            if file.content_type.startswith('image'):
                compress_image(input_path, output_path)
            elif file.content_type.startswith('video'):
                compress_video(input_path, output_path)
            compressed_media.append(output_path)
    print("Successfully commpressed media")
    return compressed_media


def compress_image(input_path, output_path, quality=70):
    img = Image.open(input_path)
    img.convert("RGB").save(output_path, "webp", quality=quality, optimize=True)

def compress_video(input_path, output_path, crf=28):
    print("i got here")
    (
        ffmpeg
        .input(input_path)
        .output(output_path, vcodec='libx264', crf=crf, preset='fast')
        .run(overwrite_output=True)
    )


def upload_media(compressed_media):
    media_links = []
    for file_path in compressed_media:
        response = None
        mime_type, _ = mimetypes.guess_type(file_path)
        if not mime_type:
            raise ValueError("Unknown file type")

        if "image" in mime_type:
            response = cloudinary.uploader.upload(file_path)
        elif "video" in mime_type:
            response = cloudinary.uploader.upload(file_path, resource_type="video")
        else:
            raise ValueError("Unsupported file type")

        media_links.append(response['secure_url'])
    print("Successfully uploaded media")
    if os.path.exists(UPLOAD_FOLDER):
        shutil.rmtree(UPLOAD_FOLDER)
    return media_links

def schedule_post(caption, image, time_scheduled, platforms,post_id=None): 
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

def start_scheduler(app):
    scheduler = BackgroundScheduler()
    scheduler.add_job(func=lambda: check_scheduled_posts(app), trigger="interval", seconds=60)
    scheduler.start()

