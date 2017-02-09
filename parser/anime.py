import calendar
from collections import defaultdict
from datetime import datetime
import lxml.html

from dateutil.parser import parse
from pyquery import PyQuery as pq

from log import logger


class AnimeParser:

    def __init__(self, url, html):
        self._url = url
        self._html = html
        if html:
            self._pq = pq(html)
            self._tree = lxml.html.fromstring(html)

        self.fields = {
            'aired_from_to': self.get_aired_from_to,
            'duration': self.get_duration,
            'episodes': self.get_episodes,
            'english': self.get_english,
            'favorites': self.get_favorites,
            'image': self.get_image,
            'id': self.get_id,
            'genres': self.get_genres,
            'japanese': self.get_japanese,
            'members': self.get_members,
            'members_score': self.get_score,
            'producers': self.get_producers,
            'related': self.get_related,
            'rating': self.get_rating,
            'synopsis': self.get_synopsis,
            'status': self.get_status,
            'synonyms': self.get_synonyms,
            'scores': self.get_scored,
            'title': self.get_title,
            'type': self.get_type,
        }

    def parse(self):
        return self.get_all_fields_dict()

    def get_all_fields_dict(self):
        res = {}
        if self._html:
            for name, func in self.fields.items():
                try:
                    res[name] = func()
                except (ValueError, IndexError) as e:
                    logger.error('parsing error {} ({}) for field {}'.format(e, self._url, name))
        else:
            res['id'] = self.get_id()

        return res

    def get_id(self):
        return int(self._url.split('/')[-1])

    def get_aired_from_to(self):
        aired_from_to = self.get_aired()
        if aired_from_to == 'Not available':
            return None, None

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

        min_split = time_str.split('min.')
        minutes = int(min_split[0].strip()) if len(min_split) > 1 else 0
        return hr*60 + minutes

    def get_related(self):
        result = defaultdict(list)
        for tr in self._pq('.anime_detail_related_anime tr').items():
            related = tr('td:first').text().lower()[:-1]
            for link in tr('a').items():
                related_url = link.attr['href']
                related_type, str_id = related_url.split('/')[1:3]
                if str_id:
                    result[related].append({'t': related_type, 'i': int(str_id)})
        return result

    def get_title(self):
        return self._tree.xpath('//h1/span/text()')[0].strip()

    def get_type(self):
        type_node = self._tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="Type:"]/../a/text()')
        if type_node:
            return type_node[0]
        else:
            type_node = self._tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="Type:"]/../text()')[1]
            return type_node.strip()

    def get_image(self):
        img = self._tree.xpath('//*[@id="content"]/table/tr/td[1]/div/div[1]/a/img')
        return img[0].attrib['src'] if img else None

    def get_episodes(self):
        episodes = self._tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="Episodes:"]')[0].tail.strip()
        if episodes and episodes != 'Unknown':
            episodes = int(episodes)
        else:
            episodes = None
        return episodes

    def get_status(self):
        return self._tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="Status:"]')[0].tail.strip()

    def get_rating(self):
        return self._tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="Rating:"]')[0].tail.strip()

    def get_english(self):
        xpath_result = self._tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="English:"]')
        if xpath_result:
            return xpath_result[0].tail.strip()

    def get_synonyms(self):
        xpath_result = self._tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="Synonyms:"]')
        if xpath_result:
            return xpath_result[0].tail.strip()

    def get_japanese(self):
        xpath_result = self._tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="Japanese:"]')
        if xpath_result:
            return xpath_result[0].tail.strip()

    def get_members(self):
        text = self._tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="Members:"]')[0].tail
        return int(text.replace(',', '').strip())

    def get_favorites(self):
        text = self._tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="Favorites:"]')[0].tail
        return int(text.replace(',', '').strip())

    def get_scored(self):
        members = self._pq('[itemprop="ratingCount"]').text().replace(',', '')
        if not members:
            scored_str = self._tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="Score:"]/../small')
            members = scored_str[0].text.split()[-2] if scored_str else ''

        if not members:
            span = self._tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="Score:"]/../span[3]/text()')
            members = span[0] if span else ''
        return int(members)

    def get_score(self):
        score = self._pq('[itemprop="ratingValue"]').text()
        if not score:
            score_str = self._tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="Score:"]/../text()')
            score = score_str[0].strip() if score_str else ''
        if not score:
            span = self._tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="Score:"]/../span[2]/text()')
            score = span[0] if span else ''
        return float(score) if score != 'N/A' else None

    def get_duration(self):
        duration_str = self._tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="Duration:"]')[0].tail.strip()
        if duration_str != 'Unknown':
            duration = self.parse_duration_time(duration_str)
        else:
            duration = None
        return duration

    def get_aired(self):
        return self._tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="Aired:"]')[0].tail.strip()

    def get_synopsis(self):
        description = self._pq('[itemprop="description"]').text()
        description = description or self._pq('h2:contains("Synopsis")')[0].tail
        if description and 'No synopsis information has been added to this title' in description:
            description = ''
        return description

    def get_genres(self):
        raw_genres = self._tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="Genres:"]/../a/text()')
        empty_genres = 'add some'
        if raw_genres and empty_genres in raw_genres:
            raw_genres.remove(empty_genres)
        return raw_genres

    def get_producers(self):
        return self._tree.xpath('//*[@id="content"]/table/tr/td[1]//span[text()="Producers:"]/../a/text()')
