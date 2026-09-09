import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Base configuration settings for Flask and MySQL."""


    #Fask settings
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-kanban-os-2026')
    DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() in ('true', '1', 't')


    #MySQL Database Connection Credentials
    MYSQL_HOST = os.getenv('MYSQL_HOST', 'localhost')
    MYSQL_USER = os.getenv('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', '')
    MYSQL_DB = os.getenv('MYSQL_DB', 'kanban_os')
    MYSQL_PORT = int(os.getenv('MYSQL_PORT', 3306))


    # Return query results as Python dict 
    MYSQL_CURSORCLASS = 'DictCursor'