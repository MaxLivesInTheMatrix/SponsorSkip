from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
import re
from dotenv import load_dotenv
from utils.sentiment_agent import get_sentiment
from utils.toolhouse_memory import save_to_memory

env_path = "./.env"

load_dotenv(dotenv_path=env_path)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route("/", methods=['POST'])
def process_request():
    api_key = os.getenv('GROQ_API_KEY')
    
    if not api_key:
        return "API key not found", 500

    groq_url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    system_prompt = "Extract all the numeric start and end times of every advertisement or sponsorship mentioned in the text. For each sponsorship or advertisement, return the start and end times as pairs of numbers separated by commas. If there are multiple advertisements or sponsorships, return each pair on a new line. Do not include any other text, only the numbers."
    
    try:
        data = request.get_json()
        transcript = data.get('transcript', [])
        # Toolhouse save to memory
        save_to_memory(transcript)
        user_prompt = "\n".join([f"{item['offset']} {item['text']}" for item in transcript])
    except (TypeError, KeyError):
        return "Invalid JSON format", 400
    
    payload = {
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "model": "llama-3.1-70b-versatile"
    }

    response = requests.post(groq_url, headers=headers, json=payload)

    if response.status_code == 403:
        return "Forbidden: You don't have permission to access this resource.", 403

    try:
        llm_response = response.json().get("choices")[0].get("message").get("content")
    except (IndexError, AttributeError, ValueError) as e:
        print(f"Error parsing response: {e}")
        return "Error processing response from the API", 500

    number_pairs = re.findall(r'(\d+)\s*,\s*(\d+)', llm_response)

    max_duration = 300
    times_list = [ [int(start), int(end)] for start, end in number_pairs if int(end) - int(start) <= max_duration ]
    sentiment = get_sentiment(transcript) 
    print("SENTIMENT: ", sentiment)
    return jsonify({"times": times_list, "sentiment": sentiment})

if __name__ == "__main__":
    app.run(debug=True)
