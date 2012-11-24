from flask import jsonify, request, render_template, escape

import dtools
from dtools.webui import app


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
                })
    return render_template('services.html',
            items=items, model=SCRIPT_MODEL)

@app.route('/add')
def add():
    res = None
    name = request.args.get('name')
    script = '\n'.join(request.args.get('script', '').splitlines())
    if name and script:
        dtools.add(name, script=script)
        res = True
    return jsonify(result=res)

@app.route('/update')
def update():
    res = None
    name = request.args.get('name')
    script = '\n'.join(request.args.get('script', '').splitlines())
    if name and script:
        dtools.update(name, script=script)
        res = True
    return jsonify(result=res)

@app.route('/get_status')
def get_status():
    name = request.args.get('name')
    res = dtools.get_pid(name) is not None
    return jsonify(result=res)

@app.route('/set_status')
def set_status():
    res = None
    name = request.args.get('name')
    action = request.args.get('action')
    if name and action:
        getattr(dtools, action)(name)
        res = True
    return jsonify(result=res)

@app.route('/remove')
def remove():
    res = None
    name = request.args.get('name')
    if name:
        dtools.remove(name)
        res = True
    return jsonify(result=res)

@app.route('/get_log/<name>')
def get_log(name):
    res = dtools.get_log(name)
    return escape(res.decode('utf-8'))
