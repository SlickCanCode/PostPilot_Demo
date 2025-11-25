from flask import Flask, request, redirect, render_template, jsonify, url_for
from services.postService import schedule_post, getPostedPosts, getPendingPosts, deletePost, getPost, handle_mediacompression, upload_media, post_scheduled_posts
from services.userService import getUser
from services.sendEmail import send_email
from datetime import datetime
from models.models import db
import os






app = Flask(__name__)

app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024

app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL") 
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False 
db.init_app(app)


#restricted to mobile devices
def is_mobile(user_agent: str) -> bool:
    mobile_keywords = ["iphone", "android", "ipad", "mobile", "ipod", "blackberry"]
    return any(keyword in user_agent.lower() for keyword in mobile_keywords)

@app.before_request
def restrict_to_mobile():
    if request.path.startswith("/run-tasks"):
        return
    user_agent = request.headers.get("User-Agent", "")
    if not is_mobile(user_agent):
        return render_template("desktop.html")
    

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

    files = request.files.getlist('image')

    compressed_media = handle_mediacompression(files)
    media_links = upload_media(compressed_media)
    
    post_id = request.form.get('post_id')
    caption = request.form.get('caption')
    time_scheduled = request.form.get('time_scheduled')
    platform = request.form.getlist('platforms')

    schedule_post(caption=caption or None, image=media_links or None, time_scheduled=time_scheduled, platforms=platform, post_id=post_id)
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
    return render_template('index.html', pendingPosts=pendingPosts, postedPosts=postedPosts, userDetails = userDetails)

@app.route('/run-tasks', methods=["GET"])
def run_tasks():
    with app.app_context():
        print("I got here")
        post_scheduled_posts()
        print("I got here again before")
    return "Tasks executed"

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



#Error Handlers
@app.errorhandler(413)
def request_entity_too_large(error):
    return error + '\nFile too large! Maximum allowed size is 200MB.'





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