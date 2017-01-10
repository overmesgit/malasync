from db import database
from models.anime import TitleModel

database.connect()

TitleModel.create_table()
database.close()
