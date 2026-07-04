import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from twilio.twiml.messaging_response import MessagingResponse
from twilio.rest import Client
from dotenv import load_dotenv
from models import db, Story, PendingStory
from audio_processor import process_audio, initialize_ml_model
import json

load_dotenv()

app = Flask(__name__)
CORS(app)  # Allow React to call this

# Database setup
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///stories.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Twilio Client
twilio_client = Client(os.getenv("TWILIO_ACCOUNT_SID"), os.getenv("TWILIO_AUTH_TOKEN"))

# Initialize ML on startup
initialize_ml_model()

# Create tables
with app.app_context():
    db.create_all()

# ==========================================
# 1. TWILIO WEBHOOK (Receives Voice Notes)
# ==========================================
@app.route("/webhook", methods=["POST"])
def webhook():
    """Handles incoming WhatsApp messages."""
    incoming_msg = request.values.get('Body', '').strip().lower()
    from_number = request.values.get('From', '')
    media_url = request.values.get('MediaUrl0')
    media_type = request.values.get('MediaContentType0')
    latitude = request.values.get('Latitude')
    longitude = request.values.get('Longitude')
    
    resp = MessagingResponse()
    msg = resp.message()
    
    # Step A: Check if user is confirming location
    # If we have latitude and longitude, save the pending story
    if latitude and longitude:
        pending = PendingStory.query.order_by(PendingStory.id.desc()).first()
        if pending:
            # Update with real coordinates
            pending.latitude = float(latitude)
            pending.longitude = float(longitude)
            
            # Move to permanent Story table
            new_story = Story(
                audio_url=pending.audio_url,
                from_number=pending.from_number,
                original_text=pending.original_text,
                translated_text=pending.translated_text,
                language=pending.language,
                cluster_label=pending.cluster_label,
                latitude=pending.latitude,
                longitude=pending.longitude
            )
            db.session.add(new_story)
            db.session.delete(pending)
            db.session.commit()
            msg.body("✅ Thank you! Your story has been saved to the digital archive with your location. Siyabonga!")
        else:
            msg.body("I couldn't find a pending story. Please send a new voice note first.")
        return str(resp)
    
    # Step B: User replies "YES" - save pending story, ask for location
    if incoming_msg == "yes":
        pending = PendingStory.query.order_by(PendingStory.id.desc()).first()
        if pending:
            # Reply asking for location
            msg.body("Great! 📍 Please share your location (tap the + icon → Location) so we can add it to the map.")
        else:
            msg.body("I couldn't find a pending story. Please send a new voice note first.")
        return str(resp)
    
    # Step C: User replies "NO" - delete pending story
    if incoming_msg == "no":
        pending = PendingStory.query.order_by(PendingStory.id.desc()).first()
        if pending:
            db.session.delete(pending)
            db.session.commit()
            msg.body("❌ Story deleted. Send a new voice note whenever you're ready.")
        else:
            msg.body("No pending story to delete.")
        return str(resp)
    
    # Step D: If it's a media file (voice note)
    if media_url and "audio" in media_type:
        # Download the audio file
        audio_response = requests.get(media_url, auth=(os.getenv("TWILIO_ACCOUNT_SID"), os.getenv("TWILIO_AUTH_TOKEN")))
        if audio_response.status_code == 200:
            file_path = f"temp_audio_{from_number.replace('+', '')}.mp3"
            with open(file_path, 'wb') as f:
                f.write(audio_response.content)
            
            result = process_audio(file_path)
            
            # Save to Pending table (waiting for consent and location)
            pending = PendingStory(
                audio_url=media_url,
                from_number=from_number,
                original_text=result['original_text'],
                translated_text=result['translated_text'],
                language=result['language'],
                cluster_label=result['cluster_label'],
                latitude=0.0,  # Temporary, will be updated with user's location
                longitude=0.0
            )
            db.session.add(pending)
            db.session.commit()
            
            os.remove(file_path)
            
            msg.body(f"🔄 We received your story in {result['language']}. We identified it as: '{result['cluster_label']}'.\n\nReply with 'YES' to save this story. We'll then ask for your location.")
        else:
            msg.body("⚠️ Sorry, we couldn't download the audio. Please try again.")
    else:
        msg.body("👋 Welcome to Izwi Lethu! Send us a voice note telling us a story about your family, land, or history. We'll preserve it for future generations.")
    
    return str(resp)

# ==========================================
# 2. API ROUTES FOR REACT FRONTEND
# ==========================================
@app.route("/api/stories", methods=["GET"])
def get_stories():
    stories = Story.query.all()
    data = [{
        "id": s.id,
        "audio_url": s.audio_url,
        "original_text": s.original_text,
        "translated_text": s.translated_text,
        "language": s.language,
        "cluster_label": s.cluster_label,
        "lat": s.latitude,
        "lng": s.longitude,
        "created_at": s.created_at.isoformat()
    } for s in stories]
    return jsonify(data)

@app.route("/api/clusters", methods=["GET"])
def get_cluster_stats():
    from sqlalchemy import func
    stats = db.session.query(Story.cluster_label, func.count(Story.id)).group_by(Story.cluster_label).all()
    return jsonify([{"name": label, "value": count} for label, count in stats])

if __name__ == "__main__":
    app.run(debug=True, port=5000)