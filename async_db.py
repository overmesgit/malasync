import peewee_async
from peewee_asyncext import PostgresqlExtDatabase

from db import settings
database = PostgresqlExtDatabase(**settings)
objects = peewee_async.Manager(database)
database.set_allow_sync(False)
