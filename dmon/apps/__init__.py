from flask import Flask

app = Flask(__name__)

from dmon.apps import api
