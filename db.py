import peewee_async

database = peewee_async.PostgresqlDatabase('test', host='127.0.0.1', user='user', password='user',
                                           ops={'JB?|': '?|', 'JB?&': '?&'})
