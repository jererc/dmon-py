PACKAGE_NAME = 'dmon'
API_PORT = 9001


# Import local settings
try:
    from local_settings import *
except ImportError:
    pass
