import os
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()  # take environment variables from .env.

API = os.getenv("API")
BASE = os.getenv("BASE")
MODEL = os.getenv("MODEL")


model = AsyncOpenAI(
    api_key=API,
    base_url=BASE
)