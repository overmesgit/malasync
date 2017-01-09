
import aiohttp_jinja2

from playhouse.shortcuts import model_to_dict

from async_db import objects
from models.anime import TitleModel
from utils import format_dates, compress_json


@aiohttp_jinja2.template('index.html')
async def index(request):
    return {}

async def title_api(request):
    query = TitleModel.select().limit(100)
    data = await objects.execute(query)
    resp_data = {'meta': {}, 'data': [format_dates(model_to_dict(m)) for m in data]}
    return await compress_json(request, resp_data)
