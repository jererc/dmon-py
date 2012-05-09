from flask import Flask

app = Flask(__name__)

from dtools.webui import views
