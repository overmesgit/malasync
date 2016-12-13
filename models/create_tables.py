from db import database
from models.anime import AnimeModel

database.connect()

AnimeModel.create_table()

database.close()
