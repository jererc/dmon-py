#!/usr/bin/env python
import sys
import os
import logging

from systools.system import check_commands, webapp

from dmon import settings
from dmon.apps import app


CMDS = ['svscan', 'svstat', 'svc']

logging.basicConfig(level=logging.DEBUG)


def main():
    if not check_commands(CMDS):
        sys.exit(1)
    if os.geteuid() != 0:
        sys.exit('must run as root')

    webapp.run(app, host='0.0.0.0', port=settings.API_PORT)


if __name__ == '__main__':
    main()
