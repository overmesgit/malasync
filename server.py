from aiohttp import web
import asyncio
from parser.loader import AnimeTopLoader, AnimeLoader


async def handle(request):
    name = request.match_info.get('name', "Anonymous")
    text = "Hello, " + name
    return web.Response(text=text)

app = web.Application()


anime_updater = AnimeLoader(app.loop, 1)
asyncio.ensure_future(anime_updater.start_parser())

app.router.add_get('/', handle)
app.router.add_get('/{name}', handle)

web.run_app(app, port=8002)
