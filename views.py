
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


def get_fields(obj, fields):
    return {f['name']: getattr(obj, f['name'], None) for f in fields}

async def title_api(request):
    body = await request.json()
    fields = [getattr(TitleModel, f['name']) for f in body['fields']]
    query = TitleModel.select(*fields)
    paged_query = query.order_by(TitleModel.members_score.desc()).offset(body['offset']).limit(body['limit'])
    data = await objects.execute(paged_query)
    count = await objects.count(query)
    resp_data = {'meta': {'count': count}, 'data': [format_dates(get_fields(m, body['fields'])) for m in data]}
    return web.json_response(resp_data, dumps=ujson.dumps)
