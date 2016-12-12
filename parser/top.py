from pyquery import PyQuery as pq

from log import logger


class AnimeTopParser:
    def __init__(self, url, html):
        self._url = url
        self._html = html
        self._pq = pq(html)

    def parse(self):
        res = []
        for title_row in self._pq.items('.ranking-list'):
            detail = title_row('.detail a.hoverinfo_trigger')
            str_score = title_row('.js-top-ranking-score-col span').text()

            title = detail.text()
            id = self.parse_id(detail.attr.href.split('/')[-2])
            score = self.parse_score(str_score)
            res.append((id, title, score))

        return res

    def parse_score(self, str_score):
        try:
            return float(str_score) if str_score != "N/A" else 0.0
        except ValueError as e:
            logger.error("can't parse score for {}:".format(self._url, e))

    def parse_id(self, title_url):
        try:
            return int(title_url)
        except ValueError as e:
            logger.error("can't parse id for {}:".format(self._url, e))
