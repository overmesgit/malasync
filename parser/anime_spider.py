import asyncio
from datetime import datetime
from http import HTTPStatus
from typing import Dict, List, Any, Tuple

from log import logger
from models.anime import TitleModel
from parser.anime import AnimeParser
from parser.manga import MangaParser
from parser.spider import AbstractAsyncSpider
from parser.top import AnimeTopParser


MANGA_ID_OFFSET = 1000000


class AnimeTopSpider(AbstractAsyncSpider):
    def __init__(self, loop, limit):
        super().__init__(loop, limit)
        self.iterator = iter(range(0, 100000, 50))
        self.url_format = 'https://myanimelist.net/topanime.php?limit={}'

    async def get_next_url(self):
        return self.url_format.format(next(self.iterator))

    def parser(self, url, status, html):
        return AnimeTopParser(url, html).parse()

    async def save_result(self, parsed_data: List[Tuple[int, str, float]]):
        from async_db import objects
        if not parsed_data:
            await asyncio.sleep(120)
            self.iterator = iter(range(0, 100000, 50))
        else:
            for title_data in parsed_data:
                id, title, score = title_data
                try:
                    existed_model = await objects.get(TitleModel, TitleModel.id == id)
                except TitleModel.DoesNotExist:
                    await objects.create(TitleModel, title=title, id=id, members_score=score, type='TV')
                else:
                    existed_model.title = title
                    existed_model.score = score
                    objects.update(TitleModel, existed_model)


class MangaTopSpider(AnimeTopSpider):
    def __init__(self, loop, limit):
        super().__init__(loop, limit)
        self.url_format = 'https://myanimelist.net/topmanga.php?limit={}'

    async def save_result(self, parsed_data: List[Tuple[int, str, float]]):
        from async_db import objects
        if not parsed_data:
            await asyncio.sleep(26 * 3600)
            self.iterator = iter(range(0, 100000, 50))
        else:
            for title_data in parsed_data:
                id, title, score = title_data

                id += MANGA_ID_OFFSET
                try:
                    existed_model = await objects.get(TitleModel, TitleModel.id == id)
                except TitleModel.DoesNotExist:
                    await objects.create(TitleModel, title=title, id=id, members_score=score, type='Manga')
                else:
                    existed_model.title = title
                    existed_model.score = score
                    objects.update(TitleModel, existed_model)


class AnimeMangaSpider(AbstractAsyncSpider):
    relation_rename = {
        "alternative version": "alv",
        "alternative setting": "als",
    }

    def __init__(self, loop, limit):
        super().__init__(loop, limit)
        self.anime_format = 'https://myanimelist.net/anime/{}'
        self.manga_format = 'https://myanimelist.net/manga/{}'
        from async_db import objects
        self.objects = objects
        self.processing_ids = set()
        self.anime_types = ["TV", "Movie", "OVA", "Special", "ONA", "Music"]
        self. manga_types = ["Doujinshi", "Manhwa", "Manhua", "Novel", "One-shot", "Manga"]

    async def get_next_url(self):
        from async_db import objects
        not_parsing = TitleModel.id.not_in(self.processing_ids)

        select_where = TitleModel.select(TitleModel.id).where(TitleModel.last_update.is_null(True))
        if self.processing_ids:
            select_where = select_where.where(not_parsing)

        query = select_where.limit(1)
        next_ids = (await objects.scalar(query, as_tuple=True))
        if not next_ids:
            select_where = TitleModel.select(TitleModel.id)
            if self.processing_ids:
                select_where = select_where.where(not_parsing)
            query = select_where.order_by(TitleModel.last_update).limit(1)
            next_ids = (await objects.scalar(query, as_tuple=True))

        if next_ids:
            next_id = next_ids[0]
            self.processing_ids.add(next_id)
            if next_id < MANGA_ID_OFFSET:
                return self.anime_format.format(next_id)
            else:
                return self.manga_format.format(next_id - MANGA_ID_OFFSET)
        else:
            logger.warn('titles not found')
            await asyncio.sleep(5)
            return await self.get_next_url()

    def parser(self, url, status, html):
        type, id = url.split('/')[3:5]
        if status == HTTPStatus.NOT_FOUND:
            return {'errors': 'not_found', 'id': int(id), 'type': type}
        else:
            if type == 'anime':
                return AnimeParser(url, html).parse()
            else:
                return MangaParser(url, html).parse()

    def flat_relations(self, relations: Dict[str, List[Dict[str, int]]]):
        res = []
        for rel_name, relations_list in relations.items():
            rel_name = self.relation_rename.get(rel_name, rel_name)[:3]
            for relation in relations_list:
                rel_id = relation['i'] if relation['t'] == 'anime' else relation['i'] + MANGA_ID_OFFSET
                res.append({'r': rel_name, 'i': rel_id, 't': relation['t']})

        return res

    async def save_result(self, parsed_data: Dict[str, Any]):
        if parsed_data.get('errors') == 'not_found':
            offset = 0 if parsed_data['type'] == 'anime' else MANGA_ID_OFFSET
            query = TitleModel.delete().where(TitleModel.id == parsed_data['id'] + offset)
            logger.warn(f'delete {parsed_data["id"]}')
            await self.objects.execute(query)

        fields = {
            'last_update': datetime.now(),
        }
        if len(parsed_data) > 1:
            air_from, air_to = parsed_data.get('aired_from_to', (None, None))
            if air_from:
                fields['aired_from'] = datetime.utcfromtimestamp(air_from)
            if air_to:
                fields['aired_to'] = datetime.utcfromtimestamp(air_to)

            related = parsed_data.get('related')
            if related:
                fields['related'] = self.flat_relations(related)

            copy_fields = {'title', 'episodes', 'members_score', 'duration', 'synopsis', 'english', 'image', 'members',
                           'japanese', 'scores', 'favorites', 'genres', 'type', 'status', 'rating', 'producers',
                           'authors', 'chapters', 'serialization', 'volumes'}
            fields.update({n: parsed_data[n] for n in copy_fields if n in parsed_data})

        id = parsed_data['id']
        if fields['type'] in self.manga_types:
            id += MANGA_ID_OFFSET

        update_query = TitleModel.update(**fields).where(TitleModel.id == id)
        await self.objects.execute(update_query)
        self.processing_ids.remove(id)
