from datetime import datetime

from lxml import etree


class UserParser:
    type_converter = {
        1: 'TV',
        2: 'OVA',
        3: 'Movie',
        4: 'Special',
        5: 'ONA',
        6: 'Music'
    }

    def __init__(self, html):
        self._html = html

    def get_user_name(self):
        username_regex = etree.fromstring(self._html).xpath("//a[re:match(text(), '<title>(.*?)\'s(.*)</title>')]")
        if username_regex:
            username = username_regex
        else:
            username = None

        return username

    def get_list(self):
        result = []
        tree = etree.fromstring(self._html)
        error_list = tree.xpath('//myanimelist/error/text()')
        if error_list:
            raise ValueError(error_list)

        user_id = int(tree.xpath('//myanimelist/myinfo/user_id/text()')[0])

        xml_list = tree.xpath('//anime')
        title_types = 'anime'
        if not xml_list:
            xml_list = tree.xpath('//manga')
            title_types = 'manga'

        dict_len = len(xml_list)
        scores_len = 0
        for xml_node in xml_list:
            id = int(xml_node.xpath('series_' + title_types + 'db_id/text()')[0])
            status = int(xml_node.xpath('my_status/text()')[0])
            score = int(xml_node.xpath('my_score/text()')[0])
            scores_len = scores_len + 1 if score else scores_len
            time = int(xml_node.xpath('my_last_updated/text()')[0])
            date = datetime.fromtimestamp(time)
            int_type = int(xml_node.xpath('series_type/text()')[0])
            result.append({'title': id, 'score': score, 'status': status,
                           'last_update': date, 'user': user_id})
        return user_id, result, dict_len, scores_len