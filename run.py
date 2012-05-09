#!/usr/bin/env python
import sys
import os

from dtools.webui import app


if os.geteuid() != 0:
    sys.exit('must run as root')

app.run(host='0.0.0.0', port=8081, debug=True)
