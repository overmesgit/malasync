import calendar
from datetime import datetime
from dateutil.parser import parse
from animespider.anime_parser import AnimeParser


def no_except(fn):
    def wrapped(*args, **kwargs):
        try:
            return fn(*args, **kwargs)
        except BaseException as ex:
            print 'ParseError: %s %s' % (fn.func_name, ex.message)
            return None
    return wrapped


class MangaParser(AnimeParser):
    def __init__(self):
        AnimeParser.__init__(self)

    @staticmethod
    def get_all_fields_dict(grab):
        title = MangaParser.get_title(grab)
        type = MangaParser.get_type(grab)
        image = MangaParser.get_image(grab)

        volumes = MangaParser.get_volumes(grab)
        chapters = MangaParser.get_chapters(grab)
        authors = MangaParser.get_authors(grab)
        serialization = MangaParser.get_serialization(grab)

        status = MangaParser.get_status(grab)
        members_score = MangaParser.get_score(grab)
        synopsis = MangaParser.get_synopsis(grab)
        genres = MangaParser.get_genres(grab)
        members = MangaParser.get_members(grab)
        scored = MangaParser.get_scored(grab)
        english = MangaParser.get_english(grab)
        japanese = MangaParser.get_japanese(grab)
        synonyms = MangaParser.get_synonyms(grab)
        favorites = MangaParser.get_favorites(grab)

        aired_from, aired_to = MangaParser.get_aired_from_to(grab)

        related = MangaParser.get_related(grab)
        return {'title': title, 'type': type, 'status': status, 'genres': genres, 'volumes': volumes,
                'members_score': members_score, 'related': related, 'chapters': chapters,
                'aired_from': aired_from, 'aired_to': aired_to, 'synopsis': synopsis,
                'image': image, 'members': members, 'english': english, 'japanese': japanese, 'synonyms': synonyms,
                'scores': scored, 'favorites': favorites, 'authors': authors, 'serialization': serialization}

    @staticmethod
    @no_except
    def get_aired_from_to(grab):
        aired_from_to = MangaParser.get_aired(grab)
        aired_split = aired_from_to.split('to')
        default_date = datetime.today().replace(month=1, day=1)
        aired_from = calendar.timegm(parse(aired_split[0].strip(), fuzzy=True, default=default_date).utctimetuple())
        if len(aired_split) > 1:
            if aired_split[1].strip() == '?':
                aired_to = None
            else:
                aired_to = calendar.timegm(parse(aired_split[1].strip(), fuzzy=True, default=default_date).utctimetuple())
        else:
            aired_to = aired_from
        return aired_from, aired_to

    @staticmethod
    @no_except
    def get_aired(grab):
        return grab.doc.tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="Published:"]')[0].tail.strip()

    @staticmethod
    @no_except
    def get_volumes(grab):
        volumes = grab.doc.tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="Volumes:"]')[0].tail.strip()
        if volumes and volumes != 'Unknown':
            volumes = int(volumes)
        else:
            volumes = None
        return volumes

    @staticmethod
    @no_except
    def get_chapters(grab):
        chapters = grab.doc.tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="Chapters:"]')[0].tail.strip()
        if chapters and chapters != 'Unknown':
            chapters = int(chapters)
        else:
            chapters = None
        return chapters

    @staticmethod
    @no_except
    def get_authors(grab):
        return grab.doc.tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="Authors:"]/../a/text()')

    @staticmethod
    @no_except
    def get_serialization(grab):
        return grab.doc.tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="Serialization:"]/../a/text()')