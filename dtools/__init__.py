import os
import re
import subprocess
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
    if not os.path.exists(SERVICE_DIR):
        return []
    return os.listdir(SERVICE_DIR)

def get_pid(name):
    '''Get the supervised process pid.
    '''
    sv_path = _get_sv_path(name)
    stdout, stderr, return_code = _popen(['svstat', sv_path])
    res = RE_PID.search(stdout)
    if res:
        pid = int(res.group(1))
        return pid

def get_log(name, include_time=True):
    '''Get the service log.
    '''
    log_file = os.path.join(_get_svlog_path(name), 'main/current')
    with open(log_file) as fd:
        data = fd.read()
    lines = reversed(data.splitlines())

    res = []
    for line in lines:
        time, log = line.split(' ', 1)
        if include_time:
            log = '%s %s' % (decode_tai64n(time.lstrip('@')).strftime('%Y-%m-%d %H:%M:%S'), log)
        res.append(log)
    return '\n'.join(res)

def add(name, script=None, user=None, cmd=None, extra=None, max_log_size=100000):
    '''Add a service and supervise it.

    :param script: script content
    :param user: user under wich the service must run
    :param cmd: command to execute
    :param extra: extra script content placed before the command
    :param max_log_size: maximum log size
    '''
    if not script and not cmd:
        raise ServiceError('missing script or command')
    if not user:
        user = 'root'

    name = re.sub(r'\W+', '_', name)

    # Create directory in /etc/sv
    sv_path = _get_sv_path(name)
    sv_log_path = _get_svlog_path(name)
    if not os.path.exists(sv_log_path):
        try:
            os.makedirs(sv_log_path)
        except Exception, e:
            raise ServiceError(e)

    # Create log directory
    log_path = os.path.join(LOG_DIR, name)
    if not os.path.exists(log_path):
        try:
            os.makedirs(log_path)
        except Exception, e:
            raise ServiceError(e)

    # Create log symlink
    log_symlink = os.path.join(sv_log_path, 'main')
    if not os.path.exists(log_symlink):
        os.symlink(log_path, log_symlink)

    # Create service run script
    sv_run = os.path.join(sv_path, 'run')
    if cmd:
        script = SV_SCRIPT % {'extra': extra or '', 'user': user, 'cmd': cmd}
    with open(sv_run, 'wb') as fd:
        fd.write(script)

    # Create log run script
    log_run = os.path.join(sv_log_path, 'run')
    with open(log_run, 'wb') as fd:
        fd.write(LOG_SCRIPT % {'max_size': max_log_size})

    for file in (sv_run, log_run,):
        try:
            os.chmod(file, 0755)
        except OSError, e:
            raise ServiceError(e)

    # Enable service
    sv_symlink = os.path.join(SERVICE_DIR, name)
    if not os.path.exists(sv_symlink):
        os.symlink(sv_path, sv_symlink)

def get(name):
    '''Get the service run script.
    '''
    sv_run = os.path.join(_get_sv_path(name), 'run')
    with open(sv_run) as fd:
        res = fd.read()
    return res

def update(name, script):
    '''Update the service run script.
    '''
    stop(name)
    sv_run = os.path.join(_get_sv_path(name), 'run')
    with open(sv_run, 'wb') as fd:
        fd.write(script)
    start(name)

def remove(name):
    '''Remove a service.
    '''
    sv_symlink = os.path.join(SERVICE_DIR, name)
    if os.path.exists(sv_symlink):
        try:
            os.remove(sv_symlink)
        except Exception, e:
            raise ServiceError(e)

    exit(name)

def check_service(name):
    '''Check the service files and directories.
    '''
    sv_path = _get_sv_path(name)
    sv_log_path = _get_svlog_path(name)

    sv_run = os.path.join(sv_path, 'run')
    if not os.path.exists(sv_run):
        return False
    log_symlink = os.path.join(sv_log_path, 'main')
    if not os.path.exists(log_symlink):
        return False
    sv_symlink = os.path.join(SERVICE_DIR, name)
    if not os.path.exists(sv_symlink):
        logger.error('missing service symlink (%s) for service "%s"', log_symlink, name)
        return False
    log_symlink = os.path.join(sv_log_path, 'main')
    if not os.path.exists(log_symlink):
        logger.error('missing log symlink (%s) for service "%s"', log_symlink, name)
        return False
    log_run = os.path.join(sv_log_path, 'run')
    if not os.path.exists(log_run):
        logger.error('missing log run script (%s) for service "%s"', log_run, name)
        return False

    return True

def start(name):
    '''Start the service.
    '''
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

def _popen(cmd):
    stdout, stderr, return_code = None, None, None
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    try:
        stdout, stderr = proc.communicate()
        return_code = proc.returncode
    except Exception, e:
        raise ProcessError(e)
    return stdout, stderr, return_code

def _svc_exec(name, arg):
    cmd = ['svc', arg, _get_sv_path(name), _get_svlog_path(name)]
    if _popen(cmd)[2] == 0:
        return True

def _get_sv_path(name):
    return os.path.join(SV_DIR, name)

def _get_svlog_path(name):
    return os.path.join(_get_sv_path(name), 'log')
