from aiohttp import web
import asyncio

from parser.anime_spider import AnimeTopSpider


async def handle(request):
    name = request.match_info.get('name', "Anonymous")
    text = "Hello, " + name
    return web.Response(text=text)

app = web.Application()


anime_updater = AnimeTopSpider(app.loop, 5)
asyncio.ensure_future(anime_updater.start_parser())

app.router.add_get('/', handle)
app.router.add_get('/{name}', handle)

web.run_app(app, port=8002)
