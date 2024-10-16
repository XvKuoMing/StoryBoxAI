from aiohttp import web
import aiohttp_cors
import json
from story_telling.story_telling import gen_scenarios, gen_story

routes = web.RouteTableDef()

@routes.get("/scenarios/{genre}")
async def get_scenarios(request):
    """generate scenarios options"""
    genre = request.match_info["genre"]
    scenarios = await gen_scenarios(genre)
    scenarios = {"status": 200, "result": scenarios}
    return web.json_response(scenarios)


@routes.post("/story")
async def get_story(request):
    """stats and continues story """
    try:
        print(request)
        data = await request.json()  # json data as {user: ..., name:, genre, scenario, history}
        gen = gen_story(
            name=data["name"],
            user=data["user"],
            genre=data["genre"],
            scenario=data["scenario"],
            history=data["history"],
        )

        response = web.StreamResponse(
            status=200,
            reason='OK',
            headers={
                'Content-Type': 'application/x-ndjson',
                'Transfer-Encoding': 'chunked',  # chunked encoding
            }
        )

        response.content_type = "text/plain"
        await response.prepare(request)
        async for item in gen:
            item = json.dumps(item, ensure_ascii=False).encode("utf-8")
            await response.write(item + b'\n')

        await response.write_eof()  # Signal the end of the response
        return response
        # return web.Response(body=gen, content_type="text/event-stream")

    except Exception as ex:
        print('JSON PARSE ERROR:', ex)
        return web.Response(status=500, text=str(ex))


def main():
    app = web.Application()

    # Configure default CORS settings.
    cors = aiohttp_cors.setup(app, defaults={
        "*": aiohttp_cors.ResourceOptions(
            allow_credentials=True,
            expose_headers="*",
            allow_headers="*",
        )
    })

    app.add_routes(routes)

    # Apply CORS to all routes
    for route in list(app.router.routes()):
        cors.add(route)

    web.run_app(app, host='localhost', port=8080)


main()
