from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class PendingStory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    audio_url = db.Column(db.String(500))
    from_number = db.Column(db.String(50))
    original_text = db.Column(db.Text)
    translated_text = db.Column(db.Text)
    language = db.Column(db.String(50))
    cluster_label = db.Column(db.String(50))
    latitude = db.Column(db.Float, default=-26.2041)
    longitude = db.Column(db.Float, default=28.0473)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Story(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    audio_url = db.Column(db.String(500))
    from_number = db.Column(db.String(50))
    original_text = db.Column(db.Text)
    translated_text = db.Column(db.Text)
    language = db.Column(db.String(50))
    cluster_label = db.Column(db.String(50))
    latitude = db.Column(db.Float, default=-26.2041)
    longitude = db.Column(db.Float, default=28.0473)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now())

class StoryLocation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    story_id = db.Column(db.Integer, db.ForeignKey('story.id'))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    address = db.Column(db.String(500))  # Optional reverse geocoding
    created_at = db.Column(db.DateTime, default=lambda: datetime.now())