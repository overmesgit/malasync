from parser.anime import AnimeParser


class MangaParser(AnimeParser):
    def __init__(self, url, html):
        AnimeParser.__init__(self, url, html)
        self.fields = {
            'aired_from_to': self.get_aired_from_to,
            'authors': self.get_authors,
            'chapters': self.get_chapters,
            'english': self.get_english,
            'favorites': self.get_favorites,
            'genres': self.get_genres,
            'image': self.get_image,
            'id': self.get_id,
            'japanese': self.get_japanese,
            'members': self.get_members,
            'members_score': self.get_score,
            'related': self.get_related,
            'synopsis': self.get_synopsis,
            'synonyms': self.get_synonyms,
            'scores': self.get_scored,
            'status': self.get_status,
            'serialization': self.get_serialization,
            'title': self.get_title,
            'type': self.get_type,
            'volumes': self.get_volumes,
        }

    def get_aired(self):
        return self._tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="Published:"]')[0].tail.strip()

    def get_volumes(self):
        volumes = self._tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="Volumes:"]')[0].tail.strip()
        if volumes and volumes != 'Unknown':
            volumes = int(volumes)
        else:
            volumes = None
        return volumes

    def get_chapters(self):
        chapters = self._tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="Chapters:"]')[0].tail.strip()
        if chapters and chapters != 'Unknown':
            chapters = int(chapters)
        else:
            chapters = None
        return chapters

    def get_authors(self):
        return self._tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="Authors:"]/../a/text()')

    def get_serialization(self):
        return self._tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="Serialization:"]/../a/text()')
