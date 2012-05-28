from flask import jsonify, request, render_template, escape

from dtools.webui import app
import dtools


SCRIPT_MODEL = """#!/bin/sh
exec 2>&1
export LANG='en_US.UTF-8'
export LC_ALL='en_US.UTF-8'
exec setuidgid <USER> <COMMAND>"""


@app.route('/')
def index():
    items = []
    for name in sorted(dtools.list()):
        items.append({
                'name': name,
                'script': dtools.get(name),
                'pid': dtools.get_pid(name),
                })
    return render_template('services.html', model=SCRIPT_MODEL, items=items)

@app.route('/action')
def action():
    action = request.args.get('action')
    name = request.args.get('name')
    script = request.args.get('script', '').replace('\r', '')

    if action == 'add':
        if name and script:
            dtools.add(name, script=script)

    elif action == 'save':
        if name and script:
            dtools.update(name, script)

    elif action == 'stop':
        dtools.stop(name)
        action = 'start'

    elif action == 'start':
        dtools.start(name)
        action = 'stop'

    elif action == 'remove':
        dtools.remove(name)

    return jsonify(result=action)

@app.route('/status')
def get_status():
    name = request.args.get('name')
    res = dtools.get_pid(name) is not None
    return jsonify(result=res)

@app.route('/get_log/<name>')
def get_log(name):
    log = dtools.get_log(name).decode('utf-8')
    return escape(log)
