# This file is part of Open-Capture.
# Copyright Edissyum Consulting since 2020 under licence GPLv3
# Open-Capture is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# See LICENCE file at the root folder for more details.

# @dev : Nathan Cheval <nathan.cheval@edissyum.com>

import ssl
import msal
import imap_tools
import requests
from flask import request
from socket import gaierror
from imaplib import IMAP4_SSL
from flask_babel import gettext
from imap_tools import MailBox, MailBoxUnencrypted, FolderInfo
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


def generate_auth_string(user, token):
    return f"user={user}\x01auth=Bearer {token}\x01\x01"


def generate_graphql_access_token(data):
    get_token_url = data['get_token_url'].replace('{tenant_id}', data['tenant_id'])
    return graphql_request(get_token_url, 'POST', data, [])


def graphql_request(url, method, data, headers):
    if method == 'GET':
        return requests.get(url, headers=headers, timeout=30)

    if method == 'POST':
        return requests.post(url, data=data, headers=headers, timeout=30)
    return None


def retrieve_folders(args):
    folders = []
    if args['method'] == 'oauth':
        try:
            app = msal.ConfidentialClientApplication(args['client_id'], authority=args['authority'] + args['tenant_id'],
                                                     client_credential=args['secret'])
            result = app.acquire_token_silent(args['scopes'], account=None)
            if not result:
                result = app.acquire_token_for_client(scopes=[args['scopes']])

            if 'access_token' not in result:
                response = {
                    "errors": gettext("MAILCOLLECT_ERROR"),
                    "message": result.get('error') + ": " + result.get('error_description')
                }
                return response, 400

            conn = MailBox(args['hostname'])
            conn.client.authenticate("XOAUTH2",
                                     lambda x: generate_auth_string(args['login'], result['access_token']))
        except Exception as _e:
            response = {
                "errors": gettext("MAILCOLLECT_ERROR"),
                "message": str(_e)
            }
            return response, 400
        folders = conn.folder.list()
    elif args['method'] == 'imap':
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
    elif args['method'] == 'graphql':
        access_token = generate_graphql_access_token(args)
        if access_token.status_code != 200:
            response = {
                "errors": gettext("MAILCOLLECT_ERROR"),
                "message": access_token.text
            }
            return response, 400

        graphql_headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + access_token.json()['access_token']
        }
        user = graphql_request(args['users_url'] + '/' + args['login'], 'GET', None, graphql_headers)
        if user.status_code != 200:
            response = {
                "errors": gettext("MAILCOLLECT_ERROR"),
                "message": user.text
            }
            return response, 400
        graphql_user = user.json()

        folders_url = args['users_url'] + '/' + graphql_user['id'] + '/mailFolders'
        folders_list = graphql_request(folders_url + '?$top=200', 'GET', None, graphql_headers)
        if folders_list.status_code != 200:
            response = {
                "errors": gettext("MAILCOLLECT_ERROR"),
                "message": folders_list.text
            }
            return response, 400

        for folder in folders_list.json()['value']:
            if folder['childFolderCount'] and folder['childFolderCount'] > 0:
                subfolders_url = folders_url + '/' + folder['id'] + '/childFolders?$top=200'
                subfolders_list = graphql_request(subfolders_url, 'GET', None, graphql_headers)
                if subfolders_list.status_code != 200:
                    response = {
                        "errors": gettext("MAILCOLLECT_ERROR"),
                        "message": subfolders_list.text
                    }
                    return response, 400
                for subfolder in subfolders_list.json()['value']:
                    folders.append({
                        'name': folder['displayName'] + '/' + subfolder['displayName']
                    })

    folder_list = []
    for _f in folders:
        if type(_f) is FolderInfo:
            folder_list.append(_f.name)
        else:
            folder_list.append(_f['name'])
    return sorted(folder_list), 200
