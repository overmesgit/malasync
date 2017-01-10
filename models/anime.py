from peewee import Model, CharField, FloatField, DateTimeField, IntegerField, TextField, CompositeKey
from playhouse.postgres_ext import BinaryJSONField

from db import database


class TitleModel(Model):
    id = IntegerField(index=True)
    type = CharField(index=True)
    title = CharField(index=True)
    members_score = FloatField(null=True, index=True)
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
    members = IntegerField(null=True, index=True)
    related = BinaryJSONField(null=True, index=True)
    producers = BinaryJSONField(null=True, index=True)
    rating = CharField(null=True, index=True)
    scores = IntegerField(null=True, index=True)
    status = CharField(null=True, index=True)
    # synonyms
    synopsis = TextField(null=True, index=True)

    class Meta:
        database = database
        primary_key = CompositeKey('id', 'type')
