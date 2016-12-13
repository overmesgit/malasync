from http import HTTPStatus

import aiohttp
import asyncio

from log import logger
from models.anime import AnimeModel
from parser.anime import AnimeParser
from parser.top import AnimeTopParser


class AnimeTopLoader:
    def __init__(self, loop, limit):
        self.results = asyncio.Queue(maxsize=4*50, loop=loop)

        self._parser = AnimeTopParser
        self._url_format = 'https://myanimelist.net/topanime.php?limit={}'
        self._stop_on_empty_result = True

        self._loop = loop
        self._conn = aiohttp.TCPConnector(limit=limit)
        self._limit = limit
        self._session = aiohttp.ClientSession(loop=loop, connector=self._conn)

        self._next_pages_add = []
        self._parsing = True

    async def start_parser(self):
        parser_task = asyncio.ensure_future(self.page_parser())
        saver_task = asyncio.ensure_future(self.saver())

        await asyncio.gather(parser_task, saver_task)

    async def start_infinite_parser(self, sleep):
        while True:
            await self.start_parser()
            logger.info("infinite parser sleep: {}s".format(sleep))
            await asyncio.sleep(sleep, loop=self._loop)

    async def create_tasks(self, pages_for_parsing):
        tasks = []
        for page in pages_for_parsing:
            url = self._url_format.format(page)
            task = asyncio.ensure_future(self.fetch(url, page))
            tasks.append(task)

        try:
            page_results = await asyncio.gather(*tasks)
        except asyncio.TimeoutError:
            logger.error("mal not response")
            self._stop_page_generator()
        else:
            has_empty_result = await self.process_pages_results(page_results)
            if self._stop_on_empty_result and has_empty_result:
                self._stop_page_generator()

    async def page_parser(self):
        async with self._session:

            for pages_for_parsing in self._next_pages_generator():
                await self.create_tasks(pages_for_parsing)

            await self.results.put(None)

    async def process_pages_results(self, page_results):
        too_many_requests_pages = []
        has_empty_list = False

        for page, results, too_many_request in page_results:
            if not too_many_request:
                await self.results.put(results)
                if not results:
                    has_empty_list = True
            else:
                too_many_requests_pages.append(page)

        if too_many_requests_pages:
            logger.info("sleep: 429 status for pages: {}".format(too_many_requests_pages))
            await asyncio.sleep(len(too_many_requests_pages), self._loop)
            self._add_next_pages(too_many_requests_pages)

        return has_empty_list

    async def fetch(self, url, page):
        with aiohttp.Timeout(30, loop=self._loop):
            async with self._session.get(url) as response:
                logger.info('code: {}, url: {}'.format(response.status, url))

                too_many_requests = response.status == HTTPStatus.TOO_MANY_REQUESTS
                if too_many_requests:
                    return page, 0, too_many_requests

                html = await response.text()
                parsed_data = self._parser(url, html).parse()
                return page, parsed_data, too_many_requests

    async def saver(self):
        from async_db import objects
        res = True
        while res:
            parsed_data = await self.results.get()
            if res is None:
                break
            else:
                id, title, score = parsed_data
                try:
                    existed_model = await objects.get(AnimeModel, AnimeModel.id == id)
                except AnimeModel.DoesNotExist:
                    await objects.create(AnimeModel, title=title, id=id, score=score)
                else:
                    existed_model.title = title
                    existed_model.score = score
                    objects.update(AnimeModel, existed_model)

    def page_generator(self):
        yield from range(0, 100000, 50)

    def _next_pages_generator(self):
        page_iterator = iter(self.page_generator())
        while self._parsing or self._next_pages_add:
            if self._next_pages_add:
                pages_for_parsing = self._next_pages_add
                self._next_pages_add = []
            else:
                pages_for_parsing = []
                for i in range(0, self._limit):
                    pages_for_parsing.append(next(page_iterator))
            yield pages_for_parsing

    def _stop_page_generator(self):
        self._parsing = False

    def _add_next_pages(self, pages):
        self._next_pages_add.extend(pages)


class AnimeLoader(AnimeTopLoader):
    def __init__(self, loop, limit):
        super().__init__(loop, limit)

        self._parser = AnimeParser
        self._url_format = 'https://myanimelist.net/anime/{}'
        self._stop_on_empty_result = False

    async def saver(self):
        from async_db import objects
        res = True
        while res:
            parsed_data = await self.results.get()
            if res is None:
                break
            print(parsed_data)

    async def page_parser(self):
        async with self._session:
            while True:
                pages_for_parsing = await self.page_generator()
                await self.create_tasks(pages_for_parsing)

            # await self.results.put(None)

    async def page_generator(self):
        from async_db import objects
        query = AnimeModel.select(AnimeModel.id).order_by(AnimeModel.last_update)
        next_ids = await objects.scalar(query, as_tuple=True)
        print(next_ids)
        return next_ids
