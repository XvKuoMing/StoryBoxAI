from config import model, MODEL
from typing import List, Dict

async def generate_stream(system: str, 
                   user: str, 
                   history: List[Dict[str, str]] = None, 
                   temperature: float = .7):
    """Generate a response based on the system and user input."""
    if history is None:
        history = []

    completion = await model.chat.completions.create(
        model=MODEL,
        temperature=temperature,
        max_tokens=512,
        messages=[
            {"role": "system", "content": system},
            *history,
            {"role": "user", "content": user}
        ],
        stream=True,
    )

    async for chunk in completion:
        try:
            content = chunk.choices[0].delta.content
            if content:
                yield content
            else:
                continue
        except IndexError:
            yield ""




async def generate(system: str, 
                   user: str, 
                   history: List[Dict[str, str]] = None, 
                   temperature: float = .7):
    """Generate a response based on the system and user input."""
    if history is None:
        history = []

    completion = await model.chat.completions.create(
        model=MODEL,
        temperature=temperature,
        max_tokens=256,
        messages=[
            {"role": "system", "content": system},
            *history,
            {"role": "user", "content": user}
        ],
        stream=False,
    )
    try:
        return completion.choices[0].message.content
    except:
        return ""
