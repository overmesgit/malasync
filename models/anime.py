import peewee
from db import database


class AnimeModel(peewee.Model):
    title = peewee.CharField()
    score = peewee.FloatField()
    last_update = peewee.DateTimeField(null=True)

    class Meta:
        database = database