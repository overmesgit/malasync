from db import database
from models.anime import TitleModel

database.connect()

TitleModel.create_table()
# database.execute_sql('CREATE INDEX genres_gin ON titlemodel USING gin (genres);')
# database.execute_sql('CREATE INDEX type_gin ON titlemodel USING gin (type);')
# database.execute_sql('CREATE INDEX status_gin ON titlemodel USING gin (status);')

database.close()
