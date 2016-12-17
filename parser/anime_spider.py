import asyncio

from log import logger
from models.anime import TitleModel, TYPE_TO_INT, STATUS_TO_INT, TitleGenreModel, GENRES_TO_INT
from parser.anime import AnimeParser
from parser.spider import AbstractAsyncSpider
from parser.top import AnimeTopParser


class AnimeTopSpider(AbstractAsyncSpider):
    def __init__(self, loop, limit):
        super().__init__(loop, limit)
        self.iterator = iter(range(0, 100000, 50))
        self.url_format = 'https://myanimelist.net/topanime.php?limit={}'

    async def get_next_url(self):
        return self.url_format.format(next(self.iterator))

    def parser(self, url, html):
        return AnimeTopParser(url, html).parse()

    async def save_result(self, parsed_data):
        from async_db import objects
        if not parsed_data:
            self.iterator = iter(range(0, 100000, 50))
        else:
            for title_data in parsed_data:
                id, title, score = title_data
                try:
                    existed_model = await objects.get(TitleModel, TitleModel.id == id)
                except TitleModel.DoesNotExist:
                    await objects.create(TitleModel, title=title, id=id, members_score=score)
                else:
                    existed_model.title = title
                    existed_model.score = score
                    objects.update(TitleModel, existed_model)


class AnimeSpider(AbstractAsyncSpider):
    def __init__(self, loop, limit):
        super().__init__(loop, limit)
        self.url_format = 'https://myanimelist.net/anime/{}'
        from async_db import objects
        self.objects = objects

    async def get_next_url(self):
        from async_db import objects
        query = TitleModel.select(TitleModel.id).order_by(TitleModel.last_update).limit(1)
        next_ids = (await objects.scalar(query, as_tuple=True))
        if next_ids:
            return self.url_format.format(next_ids[0])
        else:
            logger.warn('anime not found')
            await asyncio.sleep(5)
            return await self.get_next_url()

    def parser(self, url, html):
        return AnimeParser(url, html).parse()

    async def save_result(self, parsed_data):
        await self.save_genres(parsed_data['id'], parsed_data['genres'])
        fields = {
            'type': TYPE_TO_INT[parsed_data['type']],
            'status': STATUS_TO_INT[parsed_data['status']],

        }
        # update genres
        copy_fields = {'title', 'episodes', 'members_score', 'duration', 'synopsis', 'english', 'image', 'members',
                       'japanese', 'scores', 'favorites'}
        fields.update({n: parsed_data[n] for n in copy_fields})
        update_query = TitleModel.update(**fields).where(TitleModel.id == parsed_data['id'])
        await self.objects.execute(update_query)

    async def save_genres(self, anime_id, genres):
        genres_data = [{'anime': anime_id, 'genre': GENRES_TO_INT[g]} for g in genres]
        insert_query = TitleGenreModel.insert_many(genres_data)
        await self.objects.execute(insert_query)
