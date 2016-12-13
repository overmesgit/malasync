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
    last_update = peewee.DateTimeField(null=True)

    class Meta:
        database = database

database.connect()
AnimeModel.create_table(True)
database.close()
objects = peewee_async.Manager(database)
database.set_allow_sync(False)


class AnimeTopLoader:
    def __init__(self, loop, limit):
        self._loop = loop
        self._conn = aiohttp.TCPConnector(limit=limit)
        self._limit = limit
        self.results = asyncio.Queue(maxsize=4*50, loop=loop)
        self._next_page = 0
        self._session = aiohttp.ClientSession(loop=loop, connector=self._conn)

        self._next_pages_add = []
        self._parsing = True

    def _get_next_pages(self):
        while True:
            if self._next_pages_add:
                pages_for_parsing = self._next_pages_add
                self._next_pages_add = []
            else:
                new_next_page = self._next_page + self._limit
                pages_for_parsing = range(self._next_page, new_next_page)
                self._next_page = new_next_page
            yield pages_for_parsing

    def _add_next_pages(self, pages):
        self._next_pages_add.extend(pages)

    async def process_pages_results(self, page_results):
        too_many_requests_pages = []
        has_empty_list = False

        for page, results, too_many_request in page_results:
            if not too_many_request:
                for title_data in results:
                    await self.results.put(title_data)
                if not results:
                    has_empty_list = True
            else:
                too_many_requests_pages.append(page)

        if too_many_requests_pages:
            logger.info("sleep: 429 status for pages: {}".format(too_many_requests_pages))
            await asyncio.sleep(len(too_many_requests_pages) * 3, loop)
            self._add_next_pages(too_many_requests_pages)

        return has_empty_list

    async def top_pages_parser(self):
        async with self._session:

            for pages_for_parsing in self._get_next_pages():
                tasks = []
                for page in pages_for_parsing:
                    url = 'https://myanimelist.net/topanime.php?limit={}'.format(page * 50)
                    task = asyncio.ensure_future(self.fetch(url, page))
                    tasks.append(task)

                try:
                    page_results = await asyncio.gather(*tasks)
                except asyncio.TimeoutError:
                    logger.error("mal not response")
                    self.results.task_done()
                    break

                has_empty_list = await self.process_pages_results(page_results)
                if has_empty_list:
                    break

        self._parsing = False

    async def fetch(self, url, page):
        with aiohttp.Timeout(30, loop=self._loop):
            async with self._session.get(url) as response:
                logger.info('code: {}, url: {}'.format(response.status, url))

                too_many_requests = response.status == HTTPStatus.TOO_MANY_REQUESTS
                if too_many_requests:
                    return page, 0, too_many_requests

                html = await response.text()
                parsed_data = AnimeTopParser(url, html).parse()
                return page, parsed_data, too_many_requests

    async def saver(self):
        while self._parsing or self.results.qsize():
            # for id, title, score in parsed_data:
            #     try:
            #         existed_model = await objects.get(AnimeModel, AnimeModel.id == id)
            #     except AnimeModel.DoesNotExist:
            #         await objects.create(AnimeModel, title=title, id=id, score=score)
            #     else:
            #         existed_model.title = title
            #         existed_model.score = score
            #         objects.update(AnimeModel, existed_model)
            res = await self.results.get()
            # print(map(len, res), end='')


async def infinite_top_parser(loop, sleep):
    while True:
        parser = AnimeTopLoader(loop, limit=10)
        parser_task = asyncio.ensure_future(parser.top_pages_parser())
        saver_task = asyncio.ensure_future(parser.saver())

        await asyncio.gather(parser_task, saver_task)

        logger.info("infinite parser sleep: {}s".format(sleep))
        await asyncio.sleep(sleep, loop=loop)

if __name__ == '__main__':
    loop = asyncio.get_event_loop()
    loop.run_until_complete(infinite_top_parser(loop, sleep=10))
