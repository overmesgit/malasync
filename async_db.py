import peewee_async

from db import database
objects = peewee_async.Manager(database)
database.set_allow_sync(False)