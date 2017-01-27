from peewee import Model, CharField, FloatField, DateTimeField, IntegerField, TextField, CompositeKey, DateField, \
    ForeignKeyField
from playhouse.postgres_ext import BinaryJSONField

from db import database


class TitleModel(Model):
    id = IntegerField(index=True)
    type = CharField(index=True)
    title = CharField(index=True)
    members_score = FloatField(null=True, index=True)
    last_update = DateTimeField(null=True, index=True)

    aired_from = DateField(null=True, index=True)
    aired_to = DateField(null=True, index=True)
    authors = BinaryJSONField(null=True, index=True)
    chapters = IntegerField(null=True, index=True)
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
    serialization = BinaryJSONField(null=True, index=True)
    # synonyms
    synopsis = TextField(null=True)
    volumes = IntegerField(null=True, index=True)

    class Meta:
        database = database


class User(Model):
    name = CharField(index=True)

    class Meta:
        database = database


class UserScore(Model):
    title = ForeignKeyField(TitleModel)
    user = ForeignKeyField(User)
    score = IntegerField(index=True)
    last_update = DateTimeField(index=True)
    status = CharField(index=True)

    class Meta:
        database = database
