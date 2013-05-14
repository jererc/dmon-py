from flask import request, jsonify

from systools.system.webapp import crossdomain, serialize

import dmon
from dmon.apps import app


@app.route('/status', methods=['GET'])
@crossdomain(origin='*')
def check_status():
    return jsonify(result='dmon')

@app.route('/service/create', methods=['POST', 'OPTIONS'])
@crossdomain(origin='*')
def create_service():
    data = request.json
    if not data.get('name'):
        return jsonify(error='missing name')
    if not data.get('script'):
        return jsonify(error='missing script')

    script = '\n'.join(data['script'].splitlines())
    try:
        dmon.add(data['name'], script=script)
    except Exception, e:
        return jsonify(error=str(e))
    return jsonify(result=True)

@app.route('/service/list', methods=['GET'])
@crossdomain(origin='*')
def list_services():
    items = []
    for name in sorted(dmon.list()):
        items.append({
                'name': name,
                'script': dmon.get(name),
                'status': dmon.get_pid(name) is not None,
                })
    return serialize({'result': items})

@app.route('/service/log', methods=['POST', 'OPTIONS'])
@crossdomain(origin='*')
def get_service_log():
    data = request.json
    if not data.get('name'):
        return jsonify(error='missing name')

    res = dmon.get_log(data['name']).decode('utf-8')
    return jsonify(result=res)

@app.route('/service/update', methods=['POST', 'OPTIONS'])
@crossdomain(origin='*')
def update_service():
    data = request.json
    if not data.get('name'):
        return jsonify(error='missing name')
    if not data.get('script'):
        return jsonify(error='missing script')

    script = '\n'.join(data['script'].splitlines())
    dmon.update(data['name'], script=script)
    return jsonify(result=True)

@app.route('/service/process', methods=['POST', 'OPTIONS'])
@crossdomain(origin='*')
def process_service():
    data = request.json
    if not data.get('name'):
        return jsonify(error='missing name')
    if not data.get('action'):
        return jsonify(error='missing action')

    callable = getattr(dmon, data['action'], None)
    if not callable:
        return jsonify(error='unknown action %s' % data['action'])
    callable(data['name'])
    return jsonify(result=True)

@app.route('/service/remove', methods=['POST', 'OPTIONS'])
@crossdomain(origin='*')
def remove_service():
    data = request.json
    if not data.get('name'):
        return jsonify(error='missing name')

    dmon.remove(data['name'])
    return jsonify(result=True)
