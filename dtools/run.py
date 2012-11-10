#!/usr/bin/env python
import sys
import os

from systools.system import webapp

from dtools import settings
from dtools.webui import app


def main():
    if os.geteuid() != 0:
        sys.exit('must run as root')

    webapp.run(app, host='0.0.0.0', port=settings.WEBUI_PORT)


if __name__ == '__main__':
    main()
