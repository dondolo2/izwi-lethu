import os
import requests
from deep_translator import GoogleTranslator
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
import numpy as np
import random

# Global ML variables
vectorizer = None
kmeans_model = None
cluster_labels = {0: "Migration & Movement", 1: "Land & Heritage", 2: "Resistance & Freedom"}

# Hugging Face API configuration
HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models/openai/whisper-large-v3"
HUGGINGFACE_TOKEN = os.getenv("HF_API_KEY")

def transcribe_with_huggingface(file_path):
    """
    Transcribes audio using Hugging Face's free Inference API.
    Uses the Whisper Large v3 model.
    """
    if not HUGGINGFACE_TOKEN:
        print("⚠️ HF_API_KEY not set in .env file!")
        return "This is a placeholder transcription. Please set your Hugging Face token."

    headers = {"Authorization": f"Bearer {HUGGINGFACE_TOKEN}", "Content-Type": "audio/ogg"}
    
    try:
        with open(file_path, "rb") as audio_file:
            audio_data = audio_file.read()
        
        # Make the API request
        response = requests.post(
            HUGGINGFACE_API_URL,
            headers=headers,
            data=audio_data,
            timeout=30  # 30 seconds timeout
        )
        
        # Check for errors
        if response.status_code == 200:
            result = response.json()
            # The API returns a dict with 'text' field
            if isinstance(result, dict) and 'text' in result:
                return result['text']
            elif isinstance(result, list) and len(result) > 0 and 'text' in result[0]:
                return result[0]['text']
            else:
                print(f"Unexpected response format: {result}")
                return "This is a placeholder transcription."
        else:
            print(f"Hugging Face API Error: {response.status_code} - {response.text}")
            return "This is a placeholder transcription."
            
    except requests.exceptions.Timeout:
        print("⏰ Hugging Face API timed out. The model might be loading.")
        return "This is a placeholder transcription."
    except Exception as e:
        print(f"Hugging Face Error: {e}")
        return "This is a placeholder transcription."

def initialize_ml_model():
    """Trains a dummy TF-IDF + KMeans model on demo oral history sentences."""
    global vectorizer, kmeans_model
    
    # Create dummy dataset matching the hackathon themes
    dummy_sentences = [
        "We walked across the river to escape the war and find a new home",
        "My grandfather moved from Zimbabwe to South Africa to work in the mines",
        "The whole family traveled for three days to reach the city",
        "We left our village because there was no rain for three years",
        "This land was given to my great-grandfather by the chief",
        "We farmed maize and cattle on this soil for generations",
        "My grandmother still remembers the ancestral trees on that hill",
        "The government took our land and we never got it back",
        "We marched to the city to demand our freedom",
        "The students stood together and refused to be silenced",
        "Our elders fought against the pass laws in 1960",
        "The community built a fence to protect our sacred graves",
        "My mother told me stories of the great flood that changed the river",
        "We used to trade beads and cattle with the neighboring people",
        "The chief called a meeting and we decided to resist the new taxes"
    ]
    
    # Vectorize and cluster
    vectorizer = TfidfVectorizer(max_features=100, stop_words='english')
    X = vectorizer.fit_transform(dummy_sentences)
    kmeans_model = KMeans(n_clusters=3, random_state=42, n_init=10)
    kmeans_model.fit(X)
    
    print("✅ ML Model initialized with 3 clusters: Migration, Land, Resistance")

def process_audio(file_path):
    """Transcribes, translates, and clusters an audio file."""
    global vectorizer, kmeans_model
    
    # 1. Transcribe using Hugging Face
    transcript = transcribe_with_huggingface(file_path)
    
    # 2. Detect language (simple detection - you can use a library like langdetect)
    language = "Unknown"
    # Simple keyword-based detection (just for demo)
    if any(word in transcript.lower() for word in ['ngi', 'mina', 'wena', 'sizwe', 'umhlaba']):
        language = "isiZulu"
    elif any(word in transcript.lower() for word in ['ndi', 'mna', 'wena', 'umhlaba', 'abantu']):
        language = "isiXhosa"
    elif any(word in transcript.lower() for word in ['ke', 'nna', 'wena', 'lefatshe', 'batho']):
        language = "Setswana"
    else:
        language = "African Language"
    
    # 3. Translate to English
    try:
        translator = GoogleTranslator(source='auto', target='en')
        translated = translator.translate(transcript)
    except Exception as e:
        print(f"Translation Error: {e}")
        translated = "Placeholder translation: The elders gathered to tell stories of resistance."
    
    # 4. Clustering (The Maths/CS Magic)
    if vectorizer is None or kmeans_model is None:
        initialize_ml_model()
    
    # Vectorize the new text
    X_new = vectorizer.transform([translated])
    cluster_id = kmeans_model.predict(X_new)[0]
    cluster_label = cluster_labels.get(cluster_id, "Community Story")
    
    # Generate a dummy location (you can use geocoding in production)
    lat = -25.0 + random.random() * 10  # Roughly South Africa
    lng = 25.0 + random.random() * 10
    
    return {
        "original_text": transcript,
        "translated_text": translated,
        "language": language,
        "cluster_label": cluster_label,
        "latitude": lat,
        "longitude": lng
    }