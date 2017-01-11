import aiohttp_jinja2
import jinja2
from aiohttp import web
import asyncio

from parser.anime_spider import AnimeTopSpider, AnimeSpider
from views import index, title_api

app = web.Application()
aiohttp_jinja2.setup(app, loader=jinja2.FileSystemLoader('static'))

# TODO: infinite
anime_top_updater = AnimeTopSpider(app.loop, 1)
asyncio.ensure_future(anime_top_updater.start_parser())

anime_updater = AnimeSpider(app.loop, 1)
asyncio.ensure_future(anime_updater.start_parser())


app.router.add_get('/', index)
app.router.add_post('/api/title', title_api)
app.router.add_static('/static/', path='static', name='static')

web.run_app(app, port=8002)
