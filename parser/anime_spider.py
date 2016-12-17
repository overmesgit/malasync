from models.anime import AnimeModel
from parser.anime import AnimeParser
from parser.spider import AbstractAsyncSpider
from parser.top import AnimeTopParser


class AnimeTopSpider(AbstractAsyncSpider):
    def __init__(self, loop, limit):
        super().__init__(loop, limit)
        self.iterator = iter(range(10000, 100000, 50))
        self.url_format = 'https://myanimelist.net/topanime.php?limit={}'

    async def get_next_url(self):
        return self.url_format.format(next(self.iterator))

    def parser(self, url, html):
        return AnimeTopParser(url, html).parse()

    async def save_result(self, parsed_data):
        from async_db import objects
        if not parsed_data:
            self.stop_parsing()
        else:
            for title_data in parsed_data:
                id, title, score = title_data
                try:
                    existed_model = await objects.get(AnimeModel, AnimeModel.id == id)
                except AnimeModel.DoesNotExist:
                    await objects.create(AnimeModel, title=title, id=id, score=score)
                else:
                    existed_model.title = title
                    existed_model.score = score
                    objects.update(AnimeModel, existed_model)


class AnimeLoader(AbstractAsyncSpider):
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

    async def _page_parser(self):
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
