from playhouse.shortcuts import model_to_dict
from sanic import Sanic
from sanic.response import json

from async_db import objects
from models.anime import TitleModel
from utils import format_dates

app = Sanic()


@app.route("/api/title")
async def title_api(request):
    query = TitleModel.select().limit(100)
    data = await objects.execute(query)
    return json({'meta': {}, 'data': [format_dates(model_to_dict(m)) for m in data]})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8001)

