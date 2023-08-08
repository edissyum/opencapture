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

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>
# @dev : Oussama Brich <oussama.brich@edissyum.com>

import csv
import base64
import subprocess
from io import StringIO

from flask_babel import gettext
from flask import request, g as current_context
from src.backend.import_controllers import auth
from src.backend.functions import retrieve_custom_from_url
from src.backend.main import create_classes_from_custom_id
from src.backend.import_models import user, accounts, forms, history
from werkzeug.security import check_password_hash, generate_password_hash


def create_user(args):
    res, error = user.create_user(args)

    if error is None:
        if 'configurations' in current_context:
            configurations = current_context.configurations
        else:
            custom_id = retrieve_custom_from_url(request)
            _vars = create_classes_from_custom_id(custom_id)
            configurations = _vars[10]

        if configurations['userQuota']['enabled'] is True:
            quota = configurations['userQuota']['quota']
            user_filtered = configurations['userQuota']['users_filtered']
            email_dest = configurations['userQuota']['email_dest']
            active_users, _ = user.get_users({
                'select': ['id', 'username', 'count(*) OVER() as total'],
                'where': ['status NOT IN (%s)', "role <> 1"],
                'data': ['DEL']
            })
            total_active_users = active_users[0]['total']
            for _user in active_users:
                if _user['username'] in user_filtered:
                    total_active_users -= 1

            if quota <= total_active_users:
                custom_id = retrieve_custom_from_url(request)
                if 'smtp' in current_context and current_context.smtp:
                    smtp = current_context.smtp
                else:
                    _vars = create_classes_from_custom_id(custom_id, True)
                    smtp = _vars[8]
                if email_dest and smtp and smtp.is_up:
                    smtp.send_user_quota_notifications(email_dest, custom_id)

        history.add_history({
            'module': 'general',
            'ip': request.remote_addr,
            'submodule': 'create_user',
            'user_info': request.environ['user_info'],
            'desc': gettext('CREATE_USER', user=args['lastname'] + ' ' + args['firstname'] + ' (' + args['username'] + ')')
        })
        return {'id': res}, 200
    else:
        response = {
            "errors": gettext('CREATE_USER_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def get_users(args):
    users, _ = user.get_users(args)

    response = {
        "users": users
    }
    return response, 200


def get_users_full(data):
    args = {
        'select': ['*', 'count(*) OVER() as total'],
        'offset': data['offset'] if 'offset' in data else 0,
        'limit': data['limit'] if 'limit' in data else 'ALL'
    }
    users, _ = user.get_users_full(args)

    response = {
        "users": users
    }
    return response, 200


def get_user_by_id(user_id, get_password=False):
    _select = ['users.id', 'username', 'firstname', 'email', 'lastname', 'role', 'users.status', 'creation_date',
               'users.enabled', 'mode']
    if get_password:
        _select.append('password')

    user_info, error = user.get_user_by_id({
        'select': _select,
        'user_id': user_id
    })

    if error is None:
        return user_info, 200
    else:
        response = {
            "errors": gettext('GET_USER_BY_ID_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def get_user_by_mail(user_mail):
    user_info, error = user.get_user_by_mail({
        'select': ['users.id'],
        'user_mail': user_mail
    })

    if error is None:
        return user_info, 200
    else:
        response = {
            "errors": gettext('GET_USER_BY_ID_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def get_user_by_username(username):
    _select = ['users.id', 'username', 'firstname', 'lastname', 'role', 'users.status', 'creation_date', 'users.enabled']
    user_info, error = user.get_user_by_username({
        'select': _select,
        'username': username
    })

    if error is None:
        return user_info, 200
    else:
        response = {
            "errors": gettext('GET_USER_BY_USERNAME_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def send_email_forgot_password(args):
    user_info, error = user.get_user_by_id({'user_id': args['userId']})
    if error is None:
        if 'smtp' in current_context and current_context.smtp:
            smtp = current_context.smtp
        else:
            custom_id = retrieve_custom_from_url(request)
            _vars = create_classes_from_custom_id(custom_id, True)
            smtp = _vars[8]

        if smtp and smtp.is_up:
            reset_token = auth.generate_reset_token(args['userId'])
            user.update_user({'set': {'reset_token': reset_token}, 'user_id': args['userId']})
            smtp.send_forgot_password_email(user_info['email'], args['currentUrl'], reset_token)

            history.add_history({
                'module': 'general',
                'ip': request.remote_addr,
                'submodule': 'user_forgot_password',
                'user_info': user_info['lastname'] + ' ' + user_info['firstname'] + ' (' + user_info['username'] + ')',
                'desc': gettext('USER_FORGOT_SUCCESS', user=user_info['username'])
            })
        return user_info, 200
    else:
        response = {
            "errors": gettext('SEND_EMAIL_FORGOT_PASSWORD_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def reset_password(args):
    decoded_token, status = auth.decode_reset_token(args['resetToken'])
    if status == 500:
        return decoded_token, status

    user_info, error = user.get_user_by_id({'user_id': decoded_token['sub']})
    if error is None:
        if user_info['reset_token'] == args['resetToken']:
            user.update_user({'set': {'reset_token': '', 'password': generate_password_hash(args['newPassword'])},
                              'user_id': decoded_token['sub']})
            del user_info['password']
            del user_info['reset_token']
            history.add_history({
                'module': 'general',
                'ip': request.remote_addr,
                'submodule': 'user_reset_password',
                'user_info': user_info['lastname'] + ' ' + user_info['firstname'] + ' (' + user_info['username'] + ')',
                'desc': gettext('USER_RESET_PASSWORD_SUCCESS', user=user_info['username'])
            })
            return user_info, 200
        response = {
            "errors": gettext('RESET_PASSWORD_ERROR'),
            "message": gettext('RESET_TOKEN_MISMATCH')
        }
        return response, 400
    response = {
        "errors": gettext('RESET_PASSWORD_ERROR'),
        "message": gettext('GET_USER_BY_ID_ERROR')
    }
    return response, 400


def get_customers_by_user_id(user_id):
    user_info, error = user.get_user_by_id({'user_id': user_id})
    if error is None:
        if user_info['label_short'] == 'superadmin':
            customers = accounts.retrieve_customers({
                'select': ['id'],
                'where': ['status <> %s'],
                'data': ['DEL']
            })
        else:
            customers, error = user.get_customers_by_user_id({'user_id': user_id})

        if error is None:
            if user_info['label_short'] == 'superadmin':
                _customers = []
                for _c in customers:
                    _customers.append(_c['id'])
                customers = _customers
            else:
                if type(eval(customers['customers_id']['data'])) == list:
                    customers = eval(customers['customers_id']['data'])
        return customers, 200
    else:
        response = {
            "errors": gettext('GET_CUSTOMER_BY_ID_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def get_forms_by_user_id(user_id):
    user_info, error = user.get_user_by_id({'user_id': user_id})
    if error is None:
        if user_info['label_short'] == 'superadmin':
            user_forms, error = forms.get_forms({
                'select': ['id'],
                'where': ['status <> %s'],
                'data': ['DEL']
            })
        else:
            user_forms, error = user.get_forms_by_user_id({'user_id': user_id})

        if error is None:
            if user_info['label_short'] == 'superadmin':
                _user_forms = []
                for form in user_forms:
                    _user_forms.append(form['id'])
                user_forms = _user_forms
            else:
                if type(eval(user_forms['forms_id']['data'])) == list:
                    user_forms = eval(user_forms['forms_id']['data'])
        return user_forms, 200
    else:
        response = {
            "errors": gettext('GET_CUSTOMER_BY_ID_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def update_user(user_id, data):
    if 'configurations' in current_context:
        configurations = current_context.configurations
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        configurations = _vars[10]

    minutes_before_exp = configurations['jwtExpiration']
    user_info, error = user.get_user_by_id({'user_id': user_id})

    if error is None:
        if 'new_password' in data and 'old_password' in data and data['new_password'] and data['old_password'] and \
                not check_password_hash(user_info['password'], data['old_password']):
            response = {
                "errors": gettext('UPDATE_PROFILE'),
                "message": gettext('ERROR_OLD_PASSWORD_NOT_MATCH')
            }
            return response, 400
        elif 'password' in data and 'password_check' in data and data['password'] and data['password_check'] and \
                data['password'] != data['password_check']:
            response = {
                "errors": gettext('UPDATE_USER'),
                "message": gettext('ERROR_PASSWORD_NOT_MATCH')
            }
            return response, 400

        _set = {
            'firstname': data['firstname'],
            'lastname': data['lastname'],
            'email': data['email'],
            'role': data['role'],
            'mode': data['mode'] if 'mode' in data else 'standard',
        }

        if 'new_password' in data and data['new_password']:
            _set.update({
                'password': generate_password_hash(data['new_password'])
            })
        elif 'password' in data and data['password']:
            _set.update({
                'password': generate_password_hash(data['password'])
            })

        _, error = user.update_user({'set': _set, 'user_id': user_id})

        if error is None:
            user_info = user.get_user_by_id({'user_id': user_id})
            history.add_history({
                'module': 'general',
                'ip': request.remote_addr,
                'submodule': 'update_user',
                'user_info': user_info[0]['lastname'] + ' ' + user_info[0]['firstname'] + ' (' + user_info[0]['username'] + ')',
                'desc': gettext('USER_UPDATED', user=user_info[0]['username'])
            })
            return {"user": user_info[0], "minutes_before_exp": minutes_before_exp}, 200
        else:
            response = {
                "errors": gettext('UPDATE_USER_ERROR'),
                "message": gettext(error)
            }
            return response, 400
    else:
        response = {
            "errors": gettext('UPDATE_USER_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def delete_user(user_id):
    user_info, error = user.get_user_by_id({'user_id': user_id})
    if error is None:
        _, error = user.update_user({'set': {'status': 'DEL'}, 'user_id': user_id})
        if error is None:
            history.add_history({
                'module': 'general',
                'ip': request.remote_addr,
                'submodule': 'delete_user',
                'user_info': request.environ['user_info'],
                'desc': gettext(
                    'DELETE_USER',
                    user=user_info['lastname'] + ' ' + user_info['firstname'] + ' (' + user_info['username'] + ')'
                )
            })
            return '', 200
        else:
            response = {
                "errors": gettext('DELETE_USER_ERROR'),
                "message": gettext(error)
            }
            return response, 400
    else:
        response = {
            "errors": gettext('DELETE_USER_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def disable_user(user_id):
    user_info, error = user.get_user_by_id({'user_id': user_id})
    if error is None:
        _, error = user.update_user({'set': {'enabled': False}, 'user_id': user_id})
        if error is None:
            history.add_history({
                'module': 'general',
                'ip': request.remote_addr,
                'submodule': 'disable_user',
                'user_info': request.environ['user_info'],
                'desc': gettext(
                    'DISABLE_USER',
                    user=user_info['lastname'] + ' ' + user_info['firstname'] + ' (' + user_info['username'] + ')'
                )
            })
            return '', 200
        else:
            response = {
                "errors": gettext('DISABLE_USER_ERROR'),
                "message": gettext(error)
            }
            return response, 400
    else:
        response = {
            "errors": gettext('DISABLE_USER_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def enable_user(user_id):
    user_info, error = user.get_user_by_id({'user_id': user_id})
    if error is None:
        _, error = user.update_user({'set': {'enabled': True}, 'user_id': user_id})
        if error is None:
            history.add_history({
                'module': 'general',
                'ip': request.remote_addr,
                'submodule': 'enable_user',
                'user_info': request.environ['user_info'],
                'desc': gettext(
                    'ENABLE_USER',
                    user=user_info['lastname'] + ' ' + user_info['firstname'] + ' (' + user_info['username'] + ')'
                )
            })
            return '', 200
        else:
            response = {
                "errors": gettext('ENABLE_USER_ERROR'),
                "message": gettext(error)
            }
            return response, 400
    else:
        response = {
            "errors": gettext('ENABLE_USER_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def update_customers_by_user_id(user_id, customers):
    _, error = user.get_user_by_id({'user_id': user_id})
    if error is None:
        _set = {
            'customers_id': '{"data": "' + str(customers) + '"}',
        }
        _, error = user.update_customers_by_user_id({'set': _set, 'user_id': user_id})
        if error is None:
            return '', 200
        else:
            response = {
                "errors": gettext('UPDATE_CUSTOMERS_USER_ERROR'),
                "message": gettext(error)
            }
            return response, 400
    else:
        response = {
            "errors": gettext('UPDATE_CUSTOMERS_USER_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def update_forms_by_user_id(user_id, forms):
    _, error = user.get_user_by_id({'user_id': user_id})
    if error is None:
        _set = {
            'forms_id': '{"data": "' + str(forms) + '"}',
        }
        _, error = user.update_forms_by_user_id({'set': _set, 'user_id': user_id})
        if error:
            response = {
                "errors": gettext('UPDATE_FORMS_USER_ERROR'),
                "message": gettext(error)
            }
            return response, 400
        return '', 200
    else:
        response = {
            "errors": gettext('UPDATE_FORMS_USER_ERROR'),
            "message": gettext(error)
        }
        return response, 400


def export_users(args):
    delimiter = ','
    columns = []
    values = []

    if args['delimiter'] == 'TAB':
        delimiter = '\t'
    elif args['delimiter'] == 'SEMICOLON':
        delimiter = ';'

    users, _ = user.get_users_full({
        'select': ['username', 'firstname', 'lastname', 'email', 'role']
    })

    try:
        csv_file = StringIO()
        csv_writer = csv.writer(csv_file, delimiter=delimiter, quotechar='"', quoting=csv.QUOTE_ALL)

        for column in args['columns']:
            columns.append(column['label'])
        csv_writer.writerow(columns)
        for _user in users:
            for column in args['columns']:
                if column['id'] in _user:
                    values.append(_user[column['id']])

            csv_writer.writerow(values)
            values = []

        csv_file.seek(0)
        b64 = base64.b64encode(csv_file.getvalue().encode())
        response = {
            'encoded_file': b64.decode()
        }
        return response, 200

    except Exception as e:
        response = {
            "errors": gettext("USER_EXPORT_ERROR"),
            "message": str(e)
        }
        return response, 500


def import_users(args):
    custom_id = retrieve_custom_from_url(request)
    if 'docservers' in current_context:
        docservers = current_context.docservers
    else:
        _vars = create_classes_from_custom_id(custom_id)
        docservers = _vars[9]

    try:
        tmp_file = f"{docservers['TMP_PATH']}/users.csv"
        for file in args['files']:
            _f = args['files'][file]
            _f.save(tmp_file)

            shell_cmd = f"{docservers['PROJECT_PATH']}/custom/{custom_id}/bin/scripts/load_users.sh {tmp_file}"
            subprocess.run(shell_cmd, shell=True)

        return {'OK': True}, 200

    except Exception as e:
        response = {
            "errors": gettext("DOCTYPE_ERROR"),
            "message": str(e)
        }
        return response, 500
