import aiohttp_jinja2
import jinja2
from aiohttp import web
import asyncio

from parser.anime_spider import AnimeTopSpider, AnimeMangaSpider, MangaTopSpider
from views import index, title_api, get_user_scores

loop = asyncio.get_event_loop()
app = web.Application(loop=loop)
aiohttp_jinja2.setup(app, loader=jinja2.FileSystemLoader('static'))

anime_top_updater = AnimeTopSpider(app.loop, 1)
asyncio.ensure_future(anime_top_updater.start_parser())

manga_top_updater = MangaTopSpider(app.loop, 1)
asyncio.ensure_future(manga_top_updater.start_parser())

anime_updater = AnimeMangaSpider(app.loop, 1)
asyncio.ensure_future(anime_updater.start_parser())


app.router.add_get('/', index)
app.router.add_post('/api/title', title_api)
app.router.add_post('/api/get-user-scores', get_user_scores)
app.router.add_static('/static/', path='static', name='static')

web.run_app(app, port=8002)
