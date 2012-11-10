from flask import Flask

app = Flask(__name__)
app.config.from_object('dtools.settings')

from dtools.webui import views
