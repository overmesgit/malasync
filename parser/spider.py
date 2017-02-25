import asyncio
import traceback
from http import HTTPStatus

import aiohttp
import sys

from log import logger


class AbstractAsyncSpider:
    def __init__(self, loop, limit=None, session=None):
        self._loop = loop
        if limit:
            self._limit = limit
            self._session = aiohttp.ClientSession(loop=loop, connector=aiohttp.TCPConnector(limit=limit))
            self._close_session = True
        elif session:
            self._limit = session.connector._limit
            self._session = session
            self._close_session = False
        else:
            raise ValueError('Session or limit required')

        self.results_queue = asyncio.Queue(maxsize=10, loop=loop)
        self.processing_urls_queue = asyncio.Queue(maxsize=self._limit, loop=loop)
        self.retry_urls = asyncio.Queue(maxsize=10, loop=loop)

        self._parsing = True

    async def get_next_url(self):
        return 'http://ya.ru/'

    def parser(self, url, status, html):
        return url, html[:100]

    async def save_result(self, data):
        print(data)

    async def endless_parser(self, seconds_offset):
        while True:
            await self.start_parser()
            await asyncio.sleep(seconds_offset)
            self.__init__(self._loop, self._limit, self._session)

    async def start_parser(self):
        try:
            parser_task = asyncio.ensure_future(self._page_parser())
            saver_task = asyncio.ensure_future(self._save_results())

            await asyncio.gather(parser_task, saver_task)
            logger.info("parsing completed")
        except Exception as e:
            logger.error("fatal error {}".format(e))
            traceback.print_exc(file=sys.stdout)

    def stop_parsing(self):
        self._parsing = False

    async def _page_parser(self):
        try:
            while self._parsing:
                holder = {'url': ''}
                await self.processing_urls_queue.put(holder)
                holder['url'] = await self._get_next_url_or_retry()
                asyncio.ensure_future(self._process_url(holder['url']))
            await self.processing_urls_queue.join()
            await self.results_queue.put(None)
        finally:
            if self._close_session:
                self._session.close()

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
                            logger.error("get response error {}".format(e))
                        else:
                            parsed_data = self.parser(url, response.status, html)
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
                    traceback.print_exc(file=sys.stdout)


if __name__ == '__main__':
    loop = asyncio.get_event_loop()

    loop.run_until_complete(AbstractAsyncSpider(loop, 1).start_parser())
    loop.close()
