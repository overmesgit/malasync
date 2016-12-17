import peewee
from db import database

TYPE_TO_INT = {
    "TV": 0,
    "Movie": 1,
    "OVA": 2,
    "Special": 3,
    "ONA": 4,
    "Music": 5,
    "Doujin": 6,
    "Manhwa": 7,
    "Manhua": 8,
    "Novel": 9,
    "One Shot": 10,
    "Manga": 11,
}

STATUS_TO_INT = {
    "Not yet aired": 0,
    "Currently Airing": 1,
    "Finished Airing": 2,
    "Not yet published": 3,
    "Publishing": 4,
    "Finished": 5
}

GENRES_TO_INT = {
    'Action': 0,
    'Adventure': 1,
    'Cars': 2,
    'Comedy': 3,
    'Dementia': 4,
    'Demons': 5,
    'Doujinshi': 6,
    'Drama': 7,
    'Ecchi': 8,
    'Fantasy': 9,
    'Game': 10,
    'Gender Bender': 11,
    'Harem': 12,
    'Hentai': 13,
    'Historical': 14,
    'Horror': 15,
    'Josei': 16,
    'Kids': 17,
    'Magic': 18,
    'Martial Arts': 19,
    'Mecha': 20,
    'Military': 21,
    'Music': 22,
    'Mystery': 23,
    'Parody': 24,
    'Police': 25,
    'Psychological': 26,
    'Romance': 27,
    'Samurai': 28,
    'School': 29,
    'Sci-Fi': 30,
    'Seinen': 31,
    'Shoujo': 32,
    'Shoujo Ai': 33,
    'Shounen': 34,
    'Shounen Ai': 35,
    'Slice of Life': 36,
    'Space': 37,
    'Sports': 38,
    'Super Power': 39,
    'Supernatural': 40,
    'Thriller': 41,
    'Vampire': 42,
    'Yaoi': 43,
    'Yuri': 44,
}


class TitleModel(peewee.Model):
    title = peewee.CharField()
    members_score = peewee.FloatField()
    last_update = peewee.DateTimeField(null=True)

    aired_from = peewee.DateTimeField(null=True)
    aired_to = peewee.DateTimeField(null=True)
    duration = peewee.IntegerField(null=True)
    english = peewee.CharField(null=True)
    episodes = peewee.IntegerField(null=True)
    favorites = peewee.IntegerField(null=True)
    japanese = peewee.CharField(null=True)
    image = peewee.CharField(null=True)
    # related
    members = peewee.IntegerField(null=True)
    scores = peewee.IntegerField(null=True)
    status = peewee.SmallIntegerField(null=True)
    synopsis = peewee.TextField(null=True)
    type = peewee.SmallIntegerField(null=True)

    class Meta:
        database = database


class TitleGenreModel(peewee.Model):
    anime = peewee.ForeignKeyField(TitleModel, related_name='genres')
    genre = peewee.SmallIntegerField()

    class Meta:
        database = database
