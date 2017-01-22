import aiohttp
import aiohttp_jinja2
import ujson
from aiohttp import web
from peewee import FloatField, JOIN

from playhouse.shortcuts import model_to_dict, IntegerField

from async_db import objects
from models.anime import TitleModel, User, UserScore
from parser.user_parser import UserParser
from utils import format_dates, compress_json


@aiohttp_jinja2.template('index-aio.html')
async def index(request):
    return {}


main_url = 'http://myanimelist.net'
main_api_url = '/malappinfo.php?u={0}&status={1}&type={2}'
async def get_user_scores(request):
    async with aiohttp.ClientSession() as session:
        user_name = 'overmes'
        url = main_url + (main_api_url.format(user_name, 'all', 'anime'))
        async with session.get(url) as resp:
            print(resp.status)
            text = await resp.read()
            user_id, scores, dict_len, scores_len = UserParser(html=text).get_list()
            await objects.create_or_get(User, id=user_id, name=user_name)
            delete_query = UserScore.delete().where(UserScore.user == user_id)
            await objects.execute(delete_query)
            insert_query = UserScore.insert_many(scores)
            await objects.execute(insert_query)
            return web.json_response({'status': 'ok'}, dumps=ujson.dumps)


# def get_fields(obj, fields):
#     return {f['field']: getattr(obj, f['field'], None) for f in fields}


def get_sort_and_filters(body_fields):
    fields = []
    filters = []
    join = []
    sorting = None
    for f in body_fields:
        field_model = TitleModel
        field_name = f['field']
        alias = None
        if field_name.startswith('userscore__'):
            alias = field_name
            field_name = field_name.split('__')[1]
            join.append(UserScore)
            field_model = UserScore

        model_field = getattr(field_model, field_name, None)
        if not model_field:
            raise Exception({'error': f'{f} not exists'})
        else:
            fields.append(model_field if not alias else model_field.alias(alias))
            if 'filter' in f:
                if issubclass(type(model_field), (IntegerField, FloatField)):
                    filters.append(model_field >= f['filter'][0])
                    filters.append(model_field <= f['filter'][1])
                elif field_name == 'type':
                    filters.append(TitleModel.type.in_(f['filter']))
                else:
                    raise ValueError(message=f'{f} wrong filter')

        if 'sort' in f:
            sorting = model_field if f['sort'] == 'asc' else model_field.desc()
    return join, fields, filters, sorting

async def title_api(request):
    body = await request.json()

    join, fields, filters, sorting = get_sort_and_filters(body['fields'])
    query = TitleModel.select(*fields)
    if join:
        query = query.join(*join, JOIN.LEFT_OUTER)
    if filters:
        query = query.where(*filters)
    if sorting:
        query = query.order_by(sorting)

    paged_query = query.offset(body['offset']).limit(body['limit'])
    data = await objects.execute(paged_query.dicts())
    count = await objects.count(query)
    resp_data = {'meta': {'count': count}, 'data': [format_dates(d) for d in data]}
    return web.json_response(resp_data, dumps=ujson.dumps)
