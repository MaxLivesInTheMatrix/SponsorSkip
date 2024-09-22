import os
from uagents import Agent, Context, Protocol, Model
from ai_engine import UAgentResponse, UAgentResponseType
from groq import Groq
from dotenv import load_dotenv
load_dotenv()

class SentimentResponse(Model):
    text: str

SEED_PHRASE = "SentimentalAgent"
mailbox = os.environ.get("SENTIMENT_AGENT_MAILBOX_KEY")

sentimentAgent = Agent(
    name="SentimentAgent",
    seed=SEED_PHRASE,
    mailbox=f"{mailbox}@https://agentverse.ai",
)

print(sentimentAgent.address)

content_protocol = Protocol("text sentiment analysis")

# Initialize Groq client using environment variable
client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

def get_sentiment(text):
    chat_completion = client.chat.completions.create(
        messages=[{
            "role": "user",
            "content": f"Perform sentiment analysis on the following text and provide a brief summary of the sentiment:\n{text}\n",
        }],
        model="llama-3.1-70b-versatile",  # Using the model specified in the example
        temperature=0.5,
        max_tokens=100
    )

    return chat_completion.choices[0].message.content

@content_protocol.on_message(model=SentimentResponse, replies={UAgentResponse})
async def sentiment(ctx: Context, sender: str, msg: SentimentResponse):
    sentiment = get_sentiment(msg.text)
    await ctx.send(
        sender, UAgentResponse(message=sentiment, type=UAgentResponseType.FINAL)
    )
sentimentAgent.include(content_protocol, publish_manifest=True)
sentimentAgent.run()