from db import database
from models.anime import TitleModel, User, UserScore

database.connect()

# TitleModel.create_table()
User.create_table()
UserScore.create_table()
database.close()
