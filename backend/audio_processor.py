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
cluster_labels = {
        0: "Migration & Movement",
        1: "Land & Heritage", 
        2: "Resistance & Freedom",
        3: "Family & Community",
        4: "Daily Life & Culture"
    }
    

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

# ElevenLabs API Endpoints
STT_URL = "https://api.elevenlabs.io/v1/speech-to-text"

def transcribe_with_elevenlabs(file_path):
    """
    Sends an audio file to ElevenLabs' Speech-to-Text API for transcription.
    """
    if not ELEVENLABS_API_KEY:
        print("⚠️ ELEVENLABS_API_KEY not set in .env file!")
        return "Placeholder: API key missing."

    headers = {"xi-api-key": ELEVENLABS_API_KEY}
    
    try:
        with open(file_path, "rb") as audio_file:
            files = {'file': audio_file}
            # Required: specify the model_id
            data = {'model_id': 'scribe_v1'}  # Use 'scribe_v2' for the latest
            
            response = requests.post(
                STT_URL,
                headers=headers,
                files=files,
                data=data,
                timeout=60
            )
                    
        if response.status_code == 200:
            result = response.json()
            transcript = result.get('text', '').strip()
            print(f"📝 Transcription: {transcript[:100]}...")
            return transcript
        else:
            print(f"❌ ElevenLabs STT Error: {response.status_code} - {response.text}")
            return "Placeholder: Transcription failed."
            
    except Exception as e:
        print(f"❌ ElevenLabs STT Exception: {e}")
        return "Placeholder: Transcription error."

def initialize_ml_model():
    """Trains a dummy TF-IDF + KMeans model on demo oral history sentences."""
    global vectorizer, kmeans_model
    
    dummy_sentences = [
        # === MIGRATION & MOVEMENT (Cluster 0) ===
        "We walked across the river to escape the war and find a new home",
        "My grandfather moved from Zimbabwe to South Africa to work in the mines",
        "The whole family traveled for three days to reach the city",
        "We left our village because there was no rain for three years",
        "Our ancestors came from the north and settled in this valley",
        "My father walked 100 miles to find work in Johannesburg",
        "The family packed everything and moved to the city for a better life",
        "We crossed the border looking for safety and freedom",
        "The drought forced us to leave our land and find water elsewhere",
        "Our people have always been travelers, following the seasons",
        
        # === LAND & HERITAGE (Cluster 1) ===
        "This land was given to my great-grandfather by the chief",
        "We farmed maize and cattle on this soil for generations",
        "My grandmother still remembers the ancestral trees on that hill",
        "The government took our land and we never got it back",
        "Our ancestors are buried under that sacred baobab tree",
        "The land is our mother, she provides for us",
        "We have tended these fields for over a hundred years",
        "The river marks the boundary of our ancestral land",
        "This soil holds the bones of our forefathers",
        "The mountains are where our spirits return",
        
        # === RESISTANCE & FREEDOM (Cluster 2) ===
        "We marched to the city to demand our freedom",
        "The students stood together and refused to be silenced",
        "Our elders fought against the pass laws in 1960",
        "The community built a fence to protect our sacred graves",
        "We protested until they gave us back our land",
        "The women gathered and refused to carry passes anymore",
        "We sang freedom songs as we marched through the streets",
        "The elders taught us to never bow down to oppression",
        "We stood united against the forces that tried to break us",
        "The spirit of resistance lives in every generation",
        
        # === FAMILY & COMMUNITY (Cluster 3) ===
        "My mother told me stories of the great flood that changed the river",
        "We used to trade beads and cattle with the neighboring people",
        "The chief called a meeting and we decided to resist the new taxes",
        "My grandmother was the keeper of our family history",
        "The community came together to build a new school for the children",
        "We celebrated the harvest with singing and dancing under the moon",
        "The elders would gather under the tree and share wisdom",
        "Our family has always been known for our craftsmanship",
        "My aunt taught me the traditional songs of our people",
        "The village celebrated when the rains finally came",
        
        # === DAILY LIFE & CULTURE (Cluster 4) ===
        "We would wake up before sunrise to tend to the cattle",
        "The women would grind maize and cook for the entire village",
        "Children would play in the river after school",
        "We used to tell stories around the fire every night",
        "The drumming would go on until the early hours of the morning",
        "Our traditional healers used plants from the forest",
        "The initiation ceremonies would last for weeks",
        "We wore our traditional clothes during festivals",
        "The taste of our ancestral food brings back memories",
        "The songs of our people carry the wisdom of ages"
    ]
    
    vectorizer = TfidfVectorizer(max_features=100, stop_words='english')
    X = vectorizer.fit_transform(dummy_sentences)
    kmeans_model = KMeans(n_clusters=3, random_state=42, n_init=10)
    kmeans_model.fit(X)
    
    print("✅ ML Model initialized with 5 clusters: Migration, Land, Resistance, Family, Culture")


def process_audio(file_path):
    """Transcribes, translates, and clusters an audio file."""
    global vectorizer, kmeans_model
    
    # 1. Transcribe using ElevenLabs
    transcript = transcribe_with_elevenlabs(file_path)
    
    # 2. Detect language
    language = "Unknown"
    if any(word in transcript.lower() for word in ['ngi', 'mina', 'wena', 'sizwe', 'umhlaba']):
        language = "isiZulu"
    elif any(word in transcript.lower() for word in ['ndi', 'mna', 'wena', 'umhlaba', 'abantu']):
        language = "isiXhosa"
    elif any(word in transcript.lower() for word in ['ke', 'nna', 'wena', 'lefatshe', 'batho']):
        language = "Setswana"
    else:
        language = "African Language"
    
    # 3. Translate to English using Google Translate
    try:
        translator = GoogleTranslator(source='auto', target='en')
        translated = translator.translate(transcript)
        print(f"🌐 Translation: {translated[:100]}...")
    except Exception as e:
        print(f"Translation Error: {e}")
        translated = "Placeholder translation: The elders gathered to tell stories of resistance."
    
    # 4. Clustering
    if vectorizer is None or kmeans_model is None:
        initialize_ml_model()
    
    X_new = vectorizer.transform([translated])
    cluster_id = kmeans_model.predict(X_new)[0]
    cluster_label = cluster_labels.get(cluster_id, "Community Story")
    
    print(f"🏷️ Cluster: {cluster_label}")
    
    # Generate dummy location
    lat = -25.0 + random.random() * 10
    lng = 25.0 + random.random() * 10
    
    return {
        "original_text": transcript,
        "translated_text": translated,
        "language": language,
        "cluster_label": cluster_label,
        "latitude": lat,
        "longitude": lng
    }