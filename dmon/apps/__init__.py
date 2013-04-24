import logging

from flask import Flask

logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)

from dmon.apps import api
