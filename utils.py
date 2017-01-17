import ujson
from aiohttp.web_reqrep import StreamResponse


def format_dates(title_dict):
    time_fields = {'aired_from', 'aired_to', 'last_update'}
    for f in time_fields:
        if title_dict.get(f):
            title_dict[f] = title_dict[f].strftime('%Y-%m-%d')
    return title_dict

async def compress_json(request, data):
    stream = StreamResponse(status=200,
                            reason='OK',
                            headers={'Content-Type': 'application/json'})
    stream.enable_compression()
    stream.content_type = 'application/json'
    await stream.prepare(request)
    stream.write(ujson.dumps(data).encode('utf8'))
    await stream.drain()
    return stream
