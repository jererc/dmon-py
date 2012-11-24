#!/usr/bin/env python
import sys
import os

from systools.system import popen, webapp

from dtools import settings
from dtools.webui import app


CMDS = ['svscan', 'svstat', 'svc']


def check_requirements():
    res = True
    for cmd in CMDS:
        if popen('which %s' % cmd)[-1] != 0:
            res = False
            print '%s is missing' % cmd

    return res

def main():
    if not check_requirements():
        sys.exit(1)

    if os.geteuid() != 0:
        sys.exit('must run as root')

    webapp.run(app, host='0.0.0.0', port=settings.WEBUI_PORT)


if __name__ == '__main__':
    main()
