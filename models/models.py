import uuid
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import CheckConstraint, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY, UUID

db = SQLAlchemy()
session = db.session


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = db.Column(db.Text, unique=True, nullable=False)
    password = db.Column(db.Text, nullable=False)
    profile_pic = db.Column(db.Text)

    posts = db.relationship("Post", backref="author", cascade="all, delete", passive_deletes=True)


class Post(db.Model):
    __tablename__ = "posts"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    caption = db.Column(db.Text)
    image = db.Column(ARRAY(db.Text))
    time_scheduled = db.Column(db.DateTime, nullable=False)
    platform = db.Column(ARRAY(db.Text), nullable=False)
    status = db.Column(db.Text, nullable=False, default="Pending")

    __table_args__ = (
        CheckConstraint("(caption IS NOT NULL OR image IS NOT NULL)", name="posts_check"),
        CheckConstraint("status = ANY (ARRAY['Pending', 'Posted'])", name="posts_status_check"),
    )
