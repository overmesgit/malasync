import aiohttp
import aiohttp_jinja2
import jinja2
from aiohttp import web
import asyncio

from parser.anime_spider import AnimeTopSpider, AnimeMangaSpider, MangaTopSpider
from views import index, title_api, get_user_scores

loop = asyncio.get_event_loop()
app = web.Application(loop=loop)
aiohttp_jinja2.setup(app, loader=jinja2.FileSystemLoader('static'))

session = aiohttp.ClientSession(loop=loop, connector=aiohttp.TCPConnector(limit=1))

anime_top_updater = AnimeTopSpider(app.loop, session=session)
asyncio.ensure_future(anime_top_updater.endless_parser(24*3600))

manga_top_updater = MangaTopSpider(app.loop, session=session)
asyncio.ensure_future(manga_top_updater.endless_parser(24*3600))

anime_updater = AnimeMangaSpider(app.loop, session=session)
asyncio.ensure_future(anime_updater.endless_parser(10))


app.router.add_get('/', index)
app.router.add_post('/api/title', title_api)
app.router.add_post('/api/get-user-scores', get_user_scores)
app.router.add_static('/static/', path='static', name='static')

web.run_app(app, host='127.0.0.1', port=8002)
