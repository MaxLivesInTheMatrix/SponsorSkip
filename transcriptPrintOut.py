from youtube_transcript_api import YouTubeTranscriptApi
import openai
import tiktoken

openai.api_key = "SECRET!"

# Prepare to store start times and text
startText = {}
for hashmap in hashmapList:
    startText[hashmap['start']] = hashmap['text']

# Identify sponsor segments
sponsor_segments = {}
for time in startText:
    if "sponsor" in startText[time].lower():  # Lowercase for better matching
        sponsor_segments[time] = startText[time]

print("Sponsor Segments:")
print(sponsor_segments)

# Tokenizer setup
tokenizer = tiktoken.get_encoding("cl100k_base")

# Function to get text for the next 30 seconds after the sponsor start
def get_next_30_seconds(start_time, transcript, duration=180):
    end_time = start_time + duration
    text = ""
    for entry in transcript:
        if entry['start'] > start_time and entry['start'] <= end_time:
            text += " " + entry['text']
            text += " " + str(entry['start'])
    return text.strip()

endTimes = []
# Process each detected sponsor segment
for start_time in sponsor_segments:
    # Get the next 30 seconds of transcript
    next_segment_text = get_next_30_seconds(start_time, hashmapList)
    
    # Print out the transcript segment to be sent to LLM
    print(f"\nTranscript segment following sponsor start at {start_time} seconds:")
    print(next_segment_text)
    
    # Token count for the segment
    tokens = tokenizer.encode(next_segment_text)
    num_tokens = len(tokens)
    print(f"Number of tokens in segment: {num_tokens}")
    
    # Feed into the LLM to identify the end of the sponsor
    response = openai.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": f"Identify the time of the end of the sponsored message from the following transcript which has sentences followed by their timestamp. The sponsorship might end before the final timestamp. Provide only the timestamp:\n{next_segment_text}"}
        ],
        max_tokens=500  # Adjust based on your needs
    )
    
    print("LLM Response:")
    #print(response)
    print(response.choices[0].message.content)
    

    endTimes.append(response.choices[0].message.content)
    
print(endTimes)