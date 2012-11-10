PACKAGE_NAME = 'dtools'

WEBUI_PORT = 8001


# Import local settings
try:
    from local_settings import *
except ImportError:
    pass
