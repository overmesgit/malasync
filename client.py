from datetime import datetime

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

            has_429_status = response.status == 429
            if has_429_status:
                return page, 0, has_429_status

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

            return page, len(parsed_data), has_429_status

async def top_pages_parser(loop, limit):
    conn = aiohttp.TCPConnector(limit=limit)
    async with aiohttp.ClientSession(loop=loop, connector=conn) as session:
        last_page = 2*limit
        pages_for_parsing = list(range(0, last_page))

        while pages_for_parsing:
            tasks = []
            for page in pages_for_parsing:
                url = 'https://myanimelist.net/topanime.php?limit={}'.format(page*50)
                task = asyncio.ensure_future(fetch(session, url, page))
                tasks.append(task)

            page_results = await asyncio.gather(*tasks)
            pages_with_429 = [page for page, titles, has_429 in page_results if has_429]
            if pages_with_429:
                logger.info("sleep: 429 status for pages: {}".format(pages_with_429))
                await asyncio.sleep(len(pages_with_429)*3, loop)
                pages_for_parsing = pages_with_429
            elif all(titles_count for page, titles_count, has_429 in page_results):
                next_last_page = last_page + 2 * limit
                pages_for_parsing = list(range(last_page, next_last_page))
                last_page = next_last_page
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
