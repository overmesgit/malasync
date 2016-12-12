from datetime import datetime
from http import HTTPStatus

import aiohttp
import asyncio

from log import logger

import peewee
import peewee_async
from parser.top import AnimeTopParser

database = peewee_async.PostgresqlDatabase('test', host='127.0.0.1', user='user', password='user')


class AnimeModel(peewee.Model):
    title = peewee.CharField()
    score = peewee.FloatField()
    last_update = peewee.DateTimeField()

    class Meta:
        database = database

database.connect()
AnimeModel.create_table(True)
database.close()
objects = peewee_async.Manager(database)
database.set_allow_sync(False)


async def fetch(session, url, page):
    with aiohttp.Timeout(30, loop=session.loop):
        async with session.get(url) as response:
            logger.info('code: {}, url: {}'.format(response.status, url))

            too_many_requests = response.status == HTTPStatus.TOO_MANY_REQUESTS
            if too_many_requests:
                return page, 0, too_many_requests

            html = await response.text()
            parsed_data = AnimeTopParser(url, html).parse()
            for id, title, score in parsed_data:
                try:
                    existed_model = await objects.get(AnimeModel, AnimeModel.id == id)
                except AnimeModel.DoesNotExist:
                    await objects.create(AnimeModel, title=title, id=id, score=score,
                                         last_update=datetime.now())
                else:
                    existed_model.title = title
                    existed_model.score = score
                    objects.update(AnimeModel, existed_model)

            return page, len(parsed_data), too_many_requests

async def top_pages_parser(loop, limit):
    conn = aiohttp.TCPConnector(limit=limit)
    async with aiohttp.ClientSession(loop=loop, connector=conn) as session:
        next_page = 2*limit
        pages_for_parsing = list(range(0, next_page))

        while pages_for_parsing:
            tasks = []
            for page in pages_for_parsing:
                url = 'https://myanimelist.net/topanime.php?limit={}'.format(page*50)
                task = asyncio.ensure_future(fetch(session, url, page))
                tasks.append(task)

            try:
                page_results = await asyncio.gather(*tasks)
            except asyncio.TimeoutError:
                logger.error("mal not response")
                return

            too_many_requests_pages = [page for page, titles, too_many_requests in page_results if too_many_requests]
            if too_many_requests_pages:
                logger.info("sleep: 429 status for pages: {}".format(too_many_requests_pages))
                await asyncio.sleep(len(too_many_requests_pages)*3, loop)
                pages_for_parsing = too_many_requests_pages
            elif all(titles_count for page, titles_count, has_429 in page_results):
                new_next_page = next_page + 2*limit
                pages_for_parsing, next_page = list(range(next_page, new_next_page)), new_next_page
            else:
                pages_for_parsing = []


async def infinite_top_parser(loop, sleep):
    while True:
        await top_pages_parser(loop, limit=10)
        logger.info("infinite parser sleep: {}s".format(sleep))
        await asyncio.sleep(sleep, loop=loop)

if __name__ == '__main__':
    loop = asyncio.get_event_loop()
    loop.run_until_complete(infinite_top_parser(loop, sleep=10))
