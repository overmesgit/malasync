import aiohttp_jinja2
from aiohttp import web
from playhouse.shortcuts import model_to_dict

from models.anime import TitleModel
from utils import format_dates


@aiohttp_jinja2.template('index.html')
async def index(request):
    return {}


async def title_api(request):
    from async_db import objects
    query = TitleModel.select().limit(100)
    data = await objects.execute(query)
    return web.json_response({'meta': {}, 'data': [format_dates(model_to_dict(m)) for m in data]})
