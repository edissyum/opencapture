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
from flask_babel import gettext
from src.backend.import_models import mailcollect
from imap_tools import MailBox, MailBoxUnencrypted


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
        response = {
            "process": process
        }
        return response, 200

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
            conn = MailBox(host=args['hostname'], port=args['port'])
        else:
            conn = MailBoxUnencrypted(host=args['hostname'], port=args['port'])
    except (gaierror, IMAP4_SSL.error, ssl.SSLError) as e:
        response = {
            "errors": gettext("MAILCOLLECT_ERROR"),
            "message": str(e)
        }
        return response, 400

    if conn:
        try:
            conn.login(args['login'], args['password'])
        except (gaierror, IMAP4_SSL.error, imap_tools.errors.MailboxLoginError) as e:
            response = {
                "errors": gettext("MAILCOLLECT_ERROR"),
                "message": str(e)
            }
            return response, 400

    folders = conn.folder.list()
    folder_list = []
    for f in folders:
        folder_list.append(f.name)

    return folder_list, 200
