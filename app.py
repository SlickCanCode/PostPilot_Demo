from flask import Flask, request, redirect, render_template, jsonify
from services.postService import schedule_post, getPostedPosts, getPendingPosts, deletePost, getPost, start_scheduler
from services.userService import getUser
from services.sendEmail import send_email
from datetime import datetime
from models.models import db
import json
import os

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL") 
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False 
db.init_app(app)

with app.app_context():
    start_scheduler(app)

@app.route('/post', defaults={'post_id': None})
@app.route('/post/<string:post_id>')
def post(post_id):
    if post_id:
        post = getPost(post_id)
        return render_template('scheduler.html', post = post)
    else:   
        return render_template('scheduler.html')

@app.route('/schedule-post', methods=['POST'])
def handle_schedule():
    if request.method == 'POST':

        post_id = request.form.get('post_id')
        caption = request.form.get('caption')
        time_scheduled = request.form.get('time_scheduled')
        file_url = request.form.get('file-url')
        if file_url:
            file_url = json.loads(file_url)
        platform = request.form.getlist('platforms')
        print(file_url)
        schedule_post(caption=caption or None, image=file_url or None, time_scheduled=time_scheduled, platforms=platform, post_id=post_id)
        return redirect('/home')

@app.route('/delete_post', methods=['POST'])
def handle_deletePost():
    if request.method == 'POST':
        post_id = request.form.get('post_id')
        deletePost(post_id)
        return redirect('/home')
        
@app.route('/home')
def displayPosts():
    pendingPosts = getPendingPosts()
    postedPosts = getPostedPosts()
    userDetails = getUser()
    print(userDetails.username)
    return render_template('index.html', pendingPosts=pendingPosts, postedPosts=postedPosts, userDetails = userDetails)

@app.route('/')
def index():
    return redirect('/home')


@app.route('/about-postpilot')
def aboutPage():
    return render_template('about.html')

@app.route('/contactMe', methods=['POST'])
def contact_me():
    data = request.get_json()
    
    name = data.get('name')
    email = data.get('email')
    message = data.get('message')
    response = send_email(name,email,message)

    if "error" in response:
        return jsonify({"error": "An Error Occured, Pls try again"}), 500
    else:
        return jsonify({"success": "message sent"}),200





# Jinja filters

# for date
def format_smart_date(dt):
    now = datetime.now()

    if dt.date() == now.date():
        # Today → just time
        return dt.strftime("%I:%M %p").lower()
    elif dt.year == now.year:
        # Same year but not today
        if dt.isocalendar().week == now.isocalendar().week:
            # Same week → weekday + time
            return dt.strftime("%a %I:%M %p").lower()
        else:
            # Same year but different week → month + day + time
            # Use %#d for Windows compatibility
            return dt.strftime("%b %#d %I:%M %p").lower()
    else:
        # Different year → full date + time
        return dt.strftime("%b %#d, %Y %I:%M %p").lower()

#for upload media
def is_video(filename):
    video_exts = ('.mp4', '.mov', '.avi', '.mkv', '.webm')
    return filename.lower().endswith(video_exts)

def is_image(filename):
    image_exts = ('.jpg', '.jpeg', '.png', '.gif', '.bmp')
    return filename.lower().endswith(image_exts)

def show_if(value, fallback=''):
    return value if value else fallback


app.jinja_env.filters['show_if'] = show_if
app.jinja_env.filters['smartdate'] = format_smart_date
app.jinja_env.filters['is_video'] = is_video
app.jinja_env.filters['is_image'] = is_image

if __name__ == "__main__":
    app.run(debug=True)