from mongoengine import connect
from django.conf import settings

def init_mongoengine():
    try:
        connect(
            db=settings.MONGOENGINE_SETTINGS['db'],
            host=settings.MONGOENGINE_SETTINGS['host'],
            serverSelectionTimeoutMS=5000,
        )
    except Exception as e:
        print(f"MongoDB connection error: {e}")

init_mongoengine()
