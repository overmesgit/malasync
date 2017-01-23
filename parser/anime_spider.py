import asyncio
from datetime import datetime
from http import HTTPStatus
from typing import Dict, List, Any

from log import logger
from models.anime import TitleModel
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

    def parser(self, url, status, html):
        return AnimeTopParser(url, html).parse()

    async def save_result(self, parsed_data):
        from async_db import objects
        if not parsed_data:
            self.stop_parsing()
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


class AnimeSpider(AbstractAsyncSpider):
    relation_rename = {
        "alternative version": "alv",
        "alternative setting": "als",
    }

    def __init__(self, loop, limit):
        super().__init__(loop, limit)
        self.url_format = 'https://myanimelist.net/anime/{}'
        from async_db import objects
        self.objects = objects
        self.processing_ids = set()

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
            self.processing_ids.add(next_ids[0])
            return self.url_format.format(next_ids[0])
        else:
            logger.warn('anime not found')
            await asyncio.sleep(5)
            return await self.get_next_url()

    def parser(self, url, status, html):
        if status == HTTPStatus.NOT_FOUND:
            return {'errors': 'not_found', 'id': int(url.split('/')[-1])}
        else:
            return AnimeParser(url, html).parse()

    def flat_relations(self, relations: Dict[str, List[Dict[str, int]]]):
        res = []
        for rel_name, relations_list in relations.items():
            rel_name = self.relation_rename.get(rel_name, rel_name)[:3]
            for relation in relations_list:
                res.append({'r': rel_name, 'i': relation['i'], 't': relation['t']})

        return res

    async def save_result(self, parsed_data: Dict[str, Any]):
        if parsed_data.get('errors') == 'not_found':
            query = TitleModel.delete().where(TitleModel.id == parsed_data['id'])
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
                           'japanese', 'scores', 'favorites', 'genres', 'type', 'status', 'rating', 'producers'}
            fields.update({n: parsed_data[n] for n in copy_fields if n in parsed_data})
        update_query = TitleModel.update(**fields).where(TitleModel.id == parsed_data['id'])
        await self.objects.execute(update_query)
        self.processing_ids.remove(int(parsed_data['id']))
