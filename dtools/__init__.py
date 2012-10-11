import os
import re
import subprocess
import shutil
import time
import logging

from tai64n import decode_tai64n


SV_DIR = '/etc/sv'
LOG_DIR = '/var/log/sv'
SERVICE_DIR = '/etc/service'
SV_SCRIPT = """#!/bin/sh
exec 2>&1
%(extra)s
exec setuidgid %(user)s %(cmd)s"""
LOG_SCRIPT = """#!/bin/sh
exec setuidgid root multilog t s%(max_size)s ./main"""
RE_PID = re.compile(r'\(pid\s+(\d+)\)')

logger = logging.getLogger(__name__)


class ServiceError(Exception): pass
class ProcessError(Exception): pass


def list():
    '''Get the list of supervised services.
    '''
    if not os.path.exists(SV_DIR):
        return []
    return os.listdir(SV_DIR)

def get_pid(name):
    '''Get the supervised process pid.
    '''
    stdout, stderr, return_code = _popen(['svstat', _get_sv_dir(name)])
    res = RE_PID.search(stdout)
    if res:
        pid = int(res.group(1))
        return pid

def get_log(name, include_time=True):
    '''Get the service log.
    '''
    log_file = os.path.join(_get_svlog_dir(name), 'main/current')
    if not os.path.exists(log_file):
        return ''

    with open(log_file) as fd:
        data = fd.read()
    lines = reversed(data.splitlines())

    res = []
    for line in lines:
        if line:
            time, log = line.split(' ', 1)
            if include_time:
                log = '%s %s' % (decode_tai64n(time.lstrip('@')).strftime('%Y-%m-%d %H:%M:%S'), log)
            res.append(log)
    return '\n'.join(res)

def add(name, script=None, max_log_size=100000, **kwargs):
    '''Add a service and supervise it.

    :param script: script content
    :param max_log_size: maximum log size
    :param kwargs: extra parameters:
        - cmd: command to execute
        - user: user under wich the service must run
        - extra: extra script content executed before the command
    '''
    name = re.sub(r'\W+', '_', name)

    sv_dir = _get_sv_dir(name)
    if not os.path.exists(sv_dir):
        makedirs(sv_dir)

    # Create service run script
    if not script:
        if not kwargs.get('cmd'):
            raise ServiceError('missing script or cmd parameters')

        script = SV_SCRIPT % {
                'cmd': kwargs.get('cmd'),
                'user': kwargs.get('user', 'root'),
                'extra': kwargs.get('extra', ''),
                }

    sv_script = _get_sv_script(name)
    with open(sv_script, 'wb') as fd:
        fd.write(script)

    _set_log(name)

    # Create log run script
    svlog_script = _get_svlog_script(name)
    with open(svlog_script, 'wb') as fd:
        fd.write(LOG_SCRIPT % {'max_size': max_log_size})

    _set_scripts(name)

def _set_log(name):
    '''Create log directory and service log symlink.
    '''
    log_dir = os.path.join(LOG_DIR, name)
    if not os.path.exists(log_dir):
        makedirs(log_dir)

    svlog_dir = _get_svlog_dir(name)
    if not os.path.exists(svlog_dir):
        makedirs(svlog_dir)

    log_symlink = os.path.join(svlog_dir, 'main')
    if not os.path.exists(log_symlink):
        os.symlink(log_dir, log_symlink)

def _set_scripts(name):
    for file in (_get_sv_script(name), _get_svlog_script(name)):
        try:
            os.chmod(file, 0755)
        except OSError, e:
            raise ServiceError('failed to update %s permissions: %s' % (file, e))

    # Enable service
    sv_symlink = _get_service_symlink(name)
    if not os.path.exists(sv_symlink):
        os.symlink(_get_sv_dir(name), sv_symlink)

def get(name):
    '''Get the service run script.
    '''
    with open(_get_sv_script(name)) as fd:
        res = fd.read()
    return res

def update(name, script):
    '''Update the service run script.
    '''
    stop(name)
    with open(_get_sv_script(name), 'wb') as fd:
        fd.write(script)
    start(name)

def _wait_stopped(name):
    '''Wait for the service to stop to avoid supervise error messages.
    '''
    for i in range(10):
        if not get_pid(name):
            return True
        time.sleep(.5)

def remove(name, remove_log=True):
    '''Remove a service.
    '''
    exit(name)
    _wait_stopped(name)

    sv_symlink = _get_service_symlink(name)
    if os.path.exists(sv_symlink):
        try:
            os.remove(sv_symlink)
        except Exception, e:
            raise ServiceError(e)

    sv_dir = _get_sv_dir(name)
    if os.path.exists(sv_dir):
        rmtree(sv_dir)

    if remove_log:
        log_dir = os.path.join(LOG_DIR, name)
        if os.path.exists(log_dir):
            rmtree(log_dir)

def validate(name):
    try:
        _set_log(name)
        _set_scripts(name)
        return True
    except ServiceError:
        pass

def start(name):
    '''Start the service.
    '''
    if validate(name):
        return _svc_exec(name, '-u')

def stop(name):
    '''Stop the service.
    '''
    return _svc_exec(name, '-d')

def exit(name):
    '''Stop the service and the supervise process.
    '''
    return _svc_exec(name, '-dx')

def kill(name):
    '''Kill the service process.
    '''
    return _svc_exec(name, '-k')

def _svc_exec(name, arg):
    cmd = ['svc', arg, _get_sv_dir(name), _get_svlog_dir(name)]
    if _popen(cmd)[2] == 0:
        return True

def _popen(cmd):
    stdout, stderr, return_code = None, None, None
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    try:
        stdout, stderr = proc.communicate()
        return_code = proc.returncode
    except Exception, e:
        raise ProcessError(e)
    return stdout, stderr, return_code

def makedirs(dir):
    try:
        os.makedirs(dir)
    except OSError, e:
        raise ServiceError(e)

def rmtree(dir):
    try:
        shutil.rmtree(dir)
    except OSError, e:
        raise ServiceError(e)

def _get_sv_dir(name):
    return os.path.join(SV_DIR, name)

def _get_svlog_dir(name):
    return os.path.join(_get_sv_dir(name), 'log')

def _get_sv_script(name):
    return os.path.join(_get_sv_dir(name), 'run')

def _get_svlog_script(name):
    return os.path.join(_get_svlog_dir(name), 'run')

def _get_service_symlink(name):
    return os.path.join(SERVICE_DIR, name)
