# This file is part of Open-Capture.
# Open-Capture is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

# @dev : Nathan Cheval <nathan.cheval@edissyum.com>

import ssl
import imap_tools
from socket import gaierror
from imaplib import IMAP4_SSL

from flask import request
from flask_babel import gettext
from imap_tools import MailBox, MailBoxUnencrypted
from src.backend.models import mailcollect, history


def retrieve_processes(args):
    processes, error = mailcollect.retrieve_processes(args)

    if error is None:
        response = {
            "processes": processes
        }
        return response, 200

    response = {
        "errors": gettext("RETRIEVE_PROCESSES_ERROR"),
        "message": gettext(error)
    }
    return response, 400


def update_process(args):
    process, error = mailcollect.update_process(args)

    if error is None:
        history.add_history({
            'module': 'general',
            'ip': request.remote_addr,
            'submodule': 'update_mailcollect',
            'user_info': request.environ['user_info'],
            'desc': gettext('UPDATE_MAILCOLLECT_PROCESS', process=args['process_name'])
        })
        response = {
            "process": process
        }
        return response, 200

    response = {
        "errors": gettext("UPDATE_PROCESS_ERROR"),
        "message": gettext(error)
    }
    return response, 400


def create_process(args):
    process, error = mailcollect.create_process(args)

    if error is None:
        history.add_history({
            'module': 'general',
            'ip': request.remote_addr,
            'submodule': 'create_mailcollect_process',
            'user_info': request.environ['user_info'],
            'desc': gettext('CREATE_MAILCOLLECT_PROCESS', process=args['columns']['name'])
        })

        return {"process": process}, 200

    response = {
        "errors": gettext("CREATE_PROCESS_ERROR"),
        "message": gettext(error)
    }
    return response, 400


def delete_process(process_name):
    _, error = mailcollect.get_process_by_name({'process_name': process_name})
    if error is None:
        _, error = mailcollect.update_process({'set': {'status': 'DEL', 'enabled': False}, 'process_name': process_name})
        if error is None:
            history.add_history({
                'module': 'general',
                'ip': request.remote_addr,
                'submodule': 'delete_mailcollect_process',
                'user_info': request.environ['user_info'],
                'desc': gettext('DELETE_MAILCOLLECT_PROCESS', process=process_name)
            })
            return '', 200
        else:
            response = {
                "errors": gettext('DELETE_MAILCOLLECT_PROCESS_ERROR'),
                "message": gettext(error)
            }
            return response, 400
    else:
        response = {
            "errors": gettext('DELETE_MAILCOLLECT_PROCESS_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def enable_process(process_name):
    _, error = mailcollect.get_process_by_name({'process_name': process_name})
    if error is None:
        _, error = mailcollect.update_process({'set': {'enabled': True}, 'process_name': process_name})
        if error is None:
            history.add_history({
                'module': 'general',
                'ip': request.remote_addr,
                'submodule': 'enable_mailcollect_process',
                'user_info': request.environ['user_info'],
                'desc': gettext('ENABLE_MAILCOLLECT_PROCESS', process=process_name)
            })
            return '', 200
        else:
            response = {
                "errors": gettext('ENABLE_MAILCOLLECT_PROCESS_ERROR'),
                "message": gettext(error)
            }
            return response, 400
    else:
        response = {
            "errors": gettext('ENABLE_MAILCOLLECT_PROCESS_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def disable_process(process_name):
    _, error = mailcollect.get_process_by_name({'process_name': process_name})
    if error is None:
        _, error = mailcollect.update_process({'set': {'enabled': False}, 'process_name': process_name})
        if error is None:
            history.add_history({
                'module': 'general',
                'ip': request.remote_addr,
                'submodule': 'disable_mailcollect_process',
                'user_info': request.environ['user_info'],
                'desc': gettext('DISABLE_MAILCOLLECT_PROCESS', process=process_name)
            })
            return '', 200
        else:
            response = {
                "errors": gettext('DISABLE_MAILCOLLECT_PROCESS_ERROR'),
                "message": gettext(error)
            }
            return response, 400
    else:
        response = {
            "errors": gettext('DISABLE_MAILCOLLECT_PROCESS_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def retrieve_folders(args):
    try:
        if args['secured_connection']:
            conn = MailBox(host=args['hostname'], port=args['port'], timeout=10)
        else:
            conn = MailBoxUnencrypted(host=args['hostname'], port=args['port'], timeout=10)
    except (gaierror, IMAP4_SSL.error, ssl.SSLError) as _e:
        response = {
            "errors": gettext("MAILCOLLECT_ERROR"),
            "message": str(_e)
        }
        return response, 400

    if conn:
        try:
            conn.login(args['login'], args['password'])
        except (gaierror, IMAP4_SSL.error, imap_tools.errors.MailboxLoginError) as _e:
            response = {
                "errors": gettext("MAILCOLLECT_ERROR"),
                "message": str(_e)
            }
            return response, 400

    folders = conn.folder.list()
    folder_list = []
    for _f in folders:
        folder_list.append(_f.name)
    return sorted(folder_list), 200
