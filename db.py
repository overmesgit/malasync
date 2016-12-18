from playhouse.postgres_ext import PostgresqlExtDatabase

settings = dict(database='test', host='127.0.0.1', user='user', password='user', register_hstore=False)
database = PostgresqlExtDatabase(**settings)
