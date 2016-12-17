from db import database
from models.anime import TitleModel, TitleGenreModel

database.connect()

TitleModel.create_table(fail_silently=True)
TitleGenreModel.create_table(fail_silently=True)

database.close()
