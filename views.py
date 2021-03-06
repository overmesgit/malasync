from datetime import datetime
from http import HTTPStatus

import aiohttp
import aiohttp_jinja2
import ujson
from aiohttp import web
from peewee import FloatField, JOIN, DateTimeField, DateField

from playhouse.shortcuts import IntegerField, SQL, Clause

from async_db import objects
from models.anime import TitleModel, User, UserScore
from parser.user_parser import UserParser


@aiohttp_jinja2.template('index-aio.html')
async def index(request):
    return {}


main_url = 'http://myanimelist.net'
main_api_url = '/malappinfo.php?u={0}&status={1}&type={2}'


async def get_user_scores(request):
    body = await request.json()

    try:
        user_name = body['userName']
        async with aiohttp.ClientSession() as session:
            user_id, full_scores = None, []
            for title_type in ['anime', 'manga']:
                url = main_url + (main_api_url.format(user_name, 'all', title_type))
                async with session.get(url) as resp:
                    if resp.status != HTTPStatus.OK:
                        raise ValueError('MAL response status {}'.format(resp.status))

                    text = await resp.read()
                    user_id, scores, dict_len, scores_len = UserParser(html=text, title_type=title_type).get_list()
                    full_scores.extend(scores)

            if user_id:
                await objects.create_or_get(User, id=user_id, name=user_name)
                delete_query = UserScore.delete().where(UserScore.user == user_id)
                await objects.execute(delete_query)
                insert_query = UserScore.insert_many(full_scores)
                await objects.execute(insert_query)
        return web.json_response({'status': 'ok'}, dumps=ujson.dumps)
    except Exception as ex:
        return web.json_response({'status': 'error', 'error': ex}, status=500, dumps=ujson.dumps)


# def get_fields(obj, fields):
#     return {f['field']: getattr(obj, f['field'], None) for f in fields}

status_to_int = {
  'Watching/Reading': 1,
  'Completed': 2,
  'On-Hold': 3,
  'Dropped': 4,
  'Plan to Watch/Read': 6,
}


def get_sort_and_filters(body_fields):
    fields = []
    filters = []
    join = set()
    sorting = None
    user_name = None
    related = False
    for f in body_fields:
        field_model = TitleModel
        field_name = f['field']
        alias = ''
        if field_name == 'related':
            related = True
        if field_name.startswith('userscore__'):
            alias = field_name
            field_name = field_name.split('__')[1]
            join.add(UserScore)
            field_model = UserScore
            user_name = f['userName']

        model_field = getattr(field_model, field_name, None)
        if not model_field:
            raise Exception({'error': f'{f} not exists'})
        else:
            if f.get('enable') or field_name == 'id':
                fields.append(model_field if not alias else model_field.alias(alias))

            if 'filter' in f:
                filter_ = f['filter']
                if isinstance(model_field, (IntegerField, FloatField)):
                    field_filter = (model_field >= filter_[0]) & (model_field <= filter_[1])
                elif isinstance(model_field, (DateTimeField, DateField)):
                    if filter_:
                        start_date = datetime.fromtimestamp(filter_[0])
                        end_date = datetime.fromtimestamp(filter_[1])
                        field_filter = (start_date < model_field) & (model_field < end_date)
                    else:
                        field_filter = model_field.is_null(False)
                elif alias == 'userscore__status':
                    field_filter = model_field.in_(list(map(status_to_int.get, filter_)))
                elif field_name == 'type' or field_name == 'status':
                    field_filter = model_field.in_(filter_)
                elif field_name == 'genres':
                    if f.get('exclude'):
                        field_filter = model_field.contains_any(filter_)
                    else:
                        field_filter = model_field.contains_all(filter_)
                else:
                    raise ValueError(message=f'{f} wrong filter')

                if f.get('exclude'):
                    field_filter = ~field_filter

                if f.get('orNull'):
                    field_filter |= model_field.is_null(True)

                filters.append(field_filter)

        if 'sort' in f:
            sorting = model_field.asc() if f['sort'] == 'asc' else model_field.desc()
    return join, user_name, fields, filters, sorting, related


async def title_api(request):
    body = await request.json()

    join, user_name, fields, filters, sorting, related = get_sort_and_filters(body['fields'])
    query = TitleModel.select(*fields)
    if join:
        user = await objects.get(User, name=user_name)
        query = query.join(*join, JOIN.LEFT_OUTER, on=(TitleModel.id == UserScore.title) & (UserScore.user == user.id))
    if filters:
        query = query.where(*filters)
    if sorting:
        if sorting._ordering == 'DESC':
            query = query.order_by(Clause(sorting, SQL('NULLS LAST')))
        else:
            query = query.order_by(Clause(sorting, SQL('NULLS FIRST')))
    paged_query = query.offset(body['offset']).limit(body['limit'])
    data = list(paged_query.dicts())
    if related:
        all_related_ids = {r['i'] for row in data for r in row.get('related') or [] if r}
        rel_query = TitleModel.select(TitleModel.title, TitleModel.id).where(TitleModel.id.in_(all_related_ids))
        all_rel_titles = await objects.execute(rel_query.dicts())
        rel_id_to_title = {r['id']: r['title'] for r in all_rel_titles}
        for row in data:
            for rel in row.get('related') or []:
                rel['title'] = rel_id_to_title.get(rel['i'], 'Unknown')

    count = await objects.count(query)
    resp_data = {'meta': {'count': count}, 'data': data}
    return web.json_response(resp_data, dumps=ujson.dumps)
