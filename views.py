
import aiohttp_jinja2
import ujson
from aiohttp import web

from playhouse.shortcuts import model_to_dict

from async_db import objects
from models.anime import TitleModel
from utils import format_dates, compress_json


@aiohttp_jinja2.template('index-aio.html')
async def index(request):
    return {}

async def title_api(request):
    body = await request.json()
    fields = [getattr(TitleModel, f['name']) for f in body['fields']]
    query = TitleModel.select(*fields).limit(100)
    data = await objects.execute(query)
    resp_data = {'meta': {}, 'data': [format_dates(model_to_dict(m)) for m in data]}
    return web.json_response(resp_data, dumps=ujson.dumps)
