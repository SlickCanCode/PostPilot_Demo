from apscheduler.schedulers.blocking import BlockingScheduler
from services.postService import post_scheduled_posts

scheduler = BlockingScheduler()

@scheduler.scheduled_job("interval", seconds=60)
def run_task():
    post_scheduled_posts
    print("Scheduled job executed")

if __name__ == "__main__":
    scheduler.start()