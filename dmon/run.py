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
    if os.geteuid() != 0:
        print 'must run as root'
        sys.exit(1)
    if not check_commands(CMDS):
        sys.exit(1)

    webapp.run(app, host='0.0.0.0', port=settings.API_PORT)


if __name__ == '__main__':
    main()
