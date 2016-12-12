import calendar
from collections import defaultdict
from datetime import datetime
from lxml import etree

from dateutil.parser import parse
from pyquery import PyQuery as pq


class AnimeParser:
    def __init__(self, html):
        self._html = html
        self._pq = pq(html)
        self._tree = etree.parse(html)

    @staticmethod
    def get_all_fields_dict(self):
        title = self.get_title()
        type = self.get_type()
        image = self.get_image()
        episodes = self.get_episodes()
        status = self.get_status()
        rating = self.get_rating()
        members_score = self.get_score()
        duration = self.get_duration()
        synopsis = self.get_synopsis()
        genres = self.get_genres()
        members = self.get_members()
        scored = self.get_scored()
        english = self.get_english()
        japanese = self.get_japanese()
        synonyms = self.get_synonyms()
        producers = self.get_producers()
        favorites = self.get_favorites()

        aired_from, aired_to = self.get_aired_from_to()

        related = self.get_related()
        return {'title': title, 'type': type, 'episodes': episodes, 'status': status, 'genres': genres,
                'rating': rating, 'members_score': members_score, 'related': related,
                'aired_from': aired_from, 'aired_to': aired_to, 'duration': duration, 'synopsis': synopsis,
                'image': image, 'members': members, 'english': english, 'japanese': japanese, 'synonyms': synonyms,
                'scores': scored, 'producers': producers, 'favorites': favorites}

    def get_aired_from_to(self):
        aired_from_to = self.get_aired()
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

    def parse_duration_time(self, time_str):
        hr = 0
        hr_split = time_str.split('hr.')
        if len(hr_split) > 1:
            hr = int(hr_split[0].strip())
            time_str = hr_split[1]

        min_split = time_str.split('min.')[0].strip()
        minutes = int(min_split) if min_split else 0
        return hr*60 + minutes

    def get_related(self):
        result = defaultdict(list)
        for tr in grab.doc.pyquery('.anime_detail_related_anime tr').items():
            related = tr('td:first').text().lower()[:-1]
            for link in tr('a').items():
                related_url = link.attr['href']
                related_type, str_id = related_url.split('/')[1:3]
                result[related].append({'t': related_type, 'i': int(str_id)})
        return result

    def get_title(self):
        return grab.doc.tree.xpath('//h1/span/text()')[0].strip()

    def get_type(self):
        return grab.doc.tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="Type:"]/../a/text()')[0]

    def get_image(self):
        return grab.doc.tree.xpath('//*[@id="content"]/table/tr/td[1]/div[1]//img')[0].attrib['data-src']

    def get_episodes(self):
        episodes = grab.doc.tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="Episodes:"]')[0].tail.strip()
        if episodes and episodes != 'Unknown':
            episodes = int(episodes)
        else:
            episodes = None
        return episodes

    def get_status(self):
        return grab.doc.tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="Status:"]')[0].tail.strip()

    def get_rating(self):
        return grab.doc.tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="Rating:"]')[0].tail.strip()

    def get_english(self):
        xpath_result = grab.doc.tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="English:"]')
        if xpath_result:
            return xpath_result[0].tail.strip()

    def get_synonyms(self):
        xpath_result = grab.doc.tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="Synonyms:"]')
        if xpath_result:
            return xpath_result[0].tail.strip()

    def get_japanese(self):
        xpath_result = grab.doc.tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="Japanese:"]')
        if xpath_result:
            return xpath_result[0].tail.strip()

    def get_members(self):
        text = grab.doc.tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="Members:"]')[0].tail
        return int(text.replace(',', '').strip())

    def get_favorites(self):
        text = grab.doc.tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="Favorites:"]')[0].tail
        return int(text.replace(',', '').strip())

    def get_scored(self):
        members = grab.doc.pyquery('[itemprop="ratingCount"]').text().replace(',', '')
        if not members:
            scored_str = grab.doc.tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="Score:"]/../small')
            members = scored_str[0].text.split()[-2] if scored_str else ''

        if not members:
            span = grab.doc.tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="Score:"]/../span[3]/text()')
            members = span[0] if span else ''
        return int(members)

    def get_score(self):
        score = grab.doc.pyquery('[itemprop="ratingValue"]').text()
        if not score:
            score_str = grab.doc.tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="Score:"]/../text()')
            score = score_str[0].strip() if score_str else ''
        if not score:
            span = grab.doc.tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="Score:"]/../span[2]/text()')
            score = span[0] if span else ''
        return float(score)

    def get_duration(self):
        duration_str = grab.doc.tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="Duration:"]')[0].tail.strip()
        if duration_str != 'Unknown':
            duration = self.parse_duration_time(duration_str)
        else:
            duration = None
        return duration

    def get_aired(self):
        return grab.doc.tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="Aired:"]')[0].tail.strip()

    def get_synopsis(self):
        description = grab.doc.pyquery('[itemprop="description"]').text()
        description = description or grab.pyquery('h2:contains("Synopsis")').parent().text()[14:]
        return description

    def get_genres(self):
        return grab.doc.tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="Genres:"]/../a/text()')

    def get_producers(self):
        return grab.doc.tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="Producers:"]/../a/text()')
