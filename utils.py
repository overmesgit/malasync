import ujson
from aiohttp.web_reqrep import StreamResponse

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
