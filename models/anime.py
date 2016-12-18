from peewee import Model, CharField, FloatField, DateTimeField, IntegerField, TextField
from playhouse.postgres_ext import BinaryJSONField

from db import database


class TitleModel(Model):
    title = CharField(index=True)
    members_score = FloatField(index=True)
    last_update = DateTimeField(null=True, index=True)

    aired_from = DateTimeField(null=True, index=True)
    aired_to = DateTimeField(null=True, index=True)
    duration = IntegerField(null=True, index=True)
    english = CharField(null=True, index=True)
    episodes = IntegerField(null=True, index=True)
    favorites = IntegerField(null=True, index=True)
    genres = BinaryJSONField(null=True, index=True)
    image = CharField(null=True)
    japanese = CharField(null=True, index=True)
    # related
    members = IntegerField(null=True, index=True)
    scores = IntegerField(null=True, index=True)
    status = CharField(null=True, index=True)
    synopsis = TextField(null=True, index=True)
    type = CharField(null=True, index=True)

    class Meta:
        database = database
