from youtube_transcript_api import YouTubeTranscriptApi
import openai
import tiktoken
from groq import Groq
import os
import re

openai.api_key = "SECRET"
hashmapList = YouTubeTranscriptApi.get_transcript('kq39g2vSsKo')

# Prepare to store start times and text
startText = {}
for hashmap in hashmapList:
    startText[hashmap['start']] = hashmap['text'] # timeStamp : text

# Identify possible sponsor segments
sponsor_segments = {}
for time in startText:
    if "sponsor" in startText[time].lower():  # Lowercase for better matching
        sponsor_segments[time] = startText[time]

print("Sponsor Segments:")
print(sponsor_segments)

# Tokenizer setup
tokenizer = tiktoken.get_encoding("cl100k_base")

# Function to get text for the next 30 seconds after the sponsor start
def get_prev_and_next_60_seconds(start_time, transcript, duration=90):
    start_range = start_time - duration  # 60 seconds before start_time
    end_range = start_time + duration    # 60 seconds after start_time
    text = ""
    
    for entry in transcript:
        # Check if the transcript entry falls within the -60 to +60 seconds range
        if entry['start'] >= start_range and entry['start'] <= end_range:
            text += " " + entry['text']
            text += " " + str(entry['start'])
    
    return text.strip()

endTimes = []
# Process each detected sponsor segment
for start_time in sponsor_segments:
    # Get the next 30 seconds of transcript
    next_segment_text = get_prev_and_next_60_seconds(start_time, hashmapList)
    
    # Print out the transcript segment to be sent to LLM
    print(f"\nTranscript segment following sponsor start at {start_time} seconds:")
    print(next_segment_text)
    
    # Token count for the segment
    tokens = tokenizer.encode(next_segment_text)
    num_tokens = len(tokens)
    print(f"Number of tokens in segment: {num_tokens}")
    
    # # Feed into the LLM to identify the end of the sponsor
    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            #{"role": "user", "content": f"Identify the time of the end of the sponsored message from the following transcript which has sentences followed by their timestamp. The sponsorship might end before the final timestamp. Provide only the timestamp:\n{next_segment_text}"}
            {"role": "user", "content": f"The following text may or may not contain a sponsored message. If you detect there is a sponsored message, print out the start and end timestamps respectively:\n{next_segment_text}"}

        ],
        max_tokens=1000  # Adjust based on your needs
    )
    
    print("LLM Response:")
    #print(response)
    print(response.choices[0].message.content)
    

    endTimes.append(response.choices[0].message.content)

print(sponsor_segments)
print(endTimes)

endTimesSecond = []


for index in range(len(endTimes)):
    tmp = endTimes[index]
    numbers = re.findall(r'\d+\.\d+|\d+', tmp)
    numbers = [float(num) for num in numbers]
    endTimesSecond.append(numbers)
    
print(endTimesSecond)