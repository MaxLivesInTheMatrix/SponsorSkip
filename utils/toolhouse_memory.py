from groq import Groq
from toolhouse import Toolhouse
import os
from dotenv import load_dotenv
load_dotenv()

th = Toolhouse()
th.set_metadata("id", "user_id")
client = Groq(api_key=os.environ.get('GROQ_API_KEY'))
messages = []

def save_to_memory(transcript):
  messages = [{"role": "user", "content": f"store this information in memory: {transcript}"},]
  response = client.chat.completions.create(
          model="llama3-groq-70b-8192-tool-use-preview",
          messages=messages,
          stream=False,
          tools=th.get_tools(),
          tool_choice="auto",
      )
  
  messages += th.run_tools(response)
  return messages[-1].get("text")