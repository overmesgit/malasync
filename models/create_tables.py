from db import database
from models.anime import TitleModel, User, UserScore

database.connect()

TitleModel.create_table(fail_silently=True)
User.create_table(fail_silently=True)
UserScore.create_table(fail_silently=True)

database.close()
