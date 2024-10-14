from story_telling.reqs import generate, generate_stream
from typing import List, Dict
import json



get_scenarios_system: str 
with open("./story_telling/prompts/get_scenarios_system.txt", "r", encoding="utf8") as f:
    get_scenarios_system = f.read()

get_scenarios_user: str
with open("./story_telling/prompts/get_scenarios.txt", "r", encoding="utf8") as f:
    get_scenarios_user = f.read()


async def gen_scenarios(genre: str) -> List[str]:
    """Generate a scenarios options based on the given genre."""
    return (await generate(system=get_scenarios_system,
                    user=get_scenarios_user.format(genre=genre), 
                    )).replace("\n\n", "\n").strip().split("\n")


role_play_system: str
with open("./story_telling/prompts/role_play_system.txt", "r", encoding="utf8") as f:
    role_play_system = f.read()


async def gen_story(name: str, 
                    genre: str, 
                    scenario: str, 
                    user: Dict[str, str],
                    history: List[Dict[str, str]]):
    """Generate a story based on the given dialog. If no dialog, starts the game"""
    if user is None or user.strip() == "":
        user = "НАЧАТЬ"
        history = None

    stream = generate_stream(
        system=role_play_system.format(name=name, genre=genre, scenario=scenario),
        user=user,
        history=history
    )

    # stream parsing for the game

    STATS: str = "<STATS>" # -7 
    NSTATS: str = "</STATS>" # -8
    WIN: str = "<WIN>"
    LOST: str = "<LOST>"
    inside_stats_tag = False
    stats_json: str = ""
    buffer: str = ""
    async for token in stream:
        # parse token for info
        # return a json: {token: token, stats: stats info, finish: finish info, sound_effect: sound_effect}
        for char in token:
            if char == " " or char == "\n":
                if buffer == STATS:
                    inside_stats_tag = True
                
                if buffer in [WIN, LOST]:
                    yield {"token": None, "stats": None, "finish": buffer}
                
                if inside_stats_tag:
                    if buffer == NSTATS:
                        inside_stats_tag = False
                        try:
                            stats_json = json.loads(stats_json)
                        except:
                            stats_json = None
                        yield {"token": None, "stats": stats_json, "finish": None}
                    stats_json += buffer + char
                    buffer = ""
                else:
                    yield {"token": buffer + char, "stats": stats_json, "finish": None} # yield everything before space of newline
                    buffer = ""
                    continue

            buffer += char
        
            
    