
import aiohttp_jinja2
import ujson
from aiohttp import web
from peewee import FloatField

from playhouse.shortcuts import model_to_dict, IntegerField

from async_db import objects
from models.anime import TitleModel
from utils import format_dates, compress_json


@aiohttp_jinja2.template('index-aio.html')
async def index(request):
    return {}


def get_fields(obj, fields):
    return {f['field']: getattr(obj, f['field'], None) for f in fields}

async def title_api(request):
    body = await request.json()

    fields = []
    filters = []
    for f in body['fields']:
        model_field = getattr(TitleModel, f['field'], None)
        if not model_field:
            return web.json_response({'error': f'{f} not exists'}, dumps=ujson.dumps)
        else:
            fields.append(model_field)
            if 'filter' in f:
                if issubclass(type(model_field), (IntegerField, FloatField)):
                    filters.append(model_field >= f['filter'][0])
                    filters.append(model_field <= f['filter'][1])
                else:
                    return web.json_response({'error': f'{f} wrong filter'}, dumps=ujson.dumps)

    query = TitleModel.select(*fields)
    if filters:
        query = query.where(*filters)

    paged_query = query.order_by(TitleModel.members_score.desc()).offset(body['offset']).limit(body['limit'])
    data = await objects.execute(paged_query)
    count = await objects.count(query)
    resp_data = {'meta': {'count': count}, 'data': [format_dates(get_fields(m, body['fields'])) for m in data]}
    return web.json_response(resp_data, dumps=ujson.dumps)
