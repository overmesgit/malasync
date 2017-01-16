import asyncio
from http import HTTPStatus

import aiohttp
from log import logger


class AbstractAsyncSpider:
    def __init__(self, loop, limit):
        self.results_queue = asyncio.Queue(maxsize=5, loop=loop)
        self.processing_urls_queue = asyncio.Queue(maxsize=limit, loop=loop)
        self.retry_urls = asyncio.Queue(maxsize=100, loop=loop)

        self._loop = loop
        self._conn = aiohttp.TCPConnector(limit=limit)
        self._limit = limit
        self._session = aiohttp.ClientSession(loop=loop, connector=self._conn)

        self._parsing = True

    async def get_next_url(self):
        return 'http://ya.ru/'

    def parser(self, url, html):
        return url, html[:100]

    async def save_result(self, data):
        print(data)

    async def start_parser(self):
        parser_task = asyncio.ensure_future(self._page_parser())
        saver_task = asyncio.ensure_future(self._save_results())

        await asyncio.gather(parser_task, saver_task)
        logger.info("parsing completed")

    def stop_parsing(self):
        self._parsing = False

    async def _page_parser(self):
        async with self._session:
            while self._parsing:
                holder = {'url': ''}
                await self.processing_urls_queue.put(holder)
                holder['url'] = await self._get_next_url_or_retry()
                asyncio.ensure_future(self._process_url(holder['url']))
            await self.processing_urls_queue.join()
            await self.results_queue.put(None)

    async def _get_next_url_or_retry(self):
        if self.retry_urls.qsize() > 0:
            return await self.retry_urls.get()
        else:
            return await self.get_next_url()

    async def _process_url(self, url):
        try:
            with aiohttp.Timeout(30, loop=self._loop):
                async with self._session.get(url) as response:
                    logger.info('code: {}, url: {}'.format(response.status, url))

                    too_many_requests = response.status == HTTPStatus.TOO_MANY_REQUESTS
                    if too_many_requests:
                        await asyncio.sleep(5)
                        await self.retry_urls.put(url)
                    else:
                        try:
                            html = await response.text()
                        except (RuntimeError, UnicodeDecodeError) as e:
                            logger.error(e)
                            html = None
                        parsed_data = self.parser(url, html)
                        await self.results_queue.put(parsed_data)
        except (asyncio.TimeoutError, aiohttp.ClientOSError) as ex:
            logger.error("site not response: {}".format(str(ex)))
            await asyncio.sleep(30)
        finally:
            self.processing_urls_queue.task_done()
            if self.processing_urls_queue.qsize():
                await self.processing_urls_queue.get()

    async def _save_results(self):
        while True:
            parsed_data = await self.results_queue.get()
            if parsed_data is None:
                break
            else:
                try:
                    await self.save_result(parsed_data)
                except Exception as ex:
                    logger.error("save exception: {}".format(ex))


if __name__ == '__main__':
    loop = asyncio.get_event_loop()

    loop.run_until_complete(AbstractAsyncSpider(loop, 1).start_parser())
    loop.close()
