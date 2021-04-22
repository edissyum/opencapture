import datetime
from flask import Blueprint, flash, g, redirect, render_template, request, url_for

from flask_babel import gettext
from flask_paginate import Pagination, get_page_args
from werkzeug.security import check_password_hash, generate_password_hash
from import_controllers import pdf

bp = Blueprint('user', __name__, url_prefix='/user')


def check_user(user_id, get_password=False):
    _vars = pdf.init()
    _db = _vars[0]

    _select = ['id', 'username', 'firstname', 'lastname', 'role', 'status', 'creation_date', 'enabled']
    if get_password:
        _select.append('password')

    user = _db.select({
        'select': _select,
        'table': ['users'],
        'where': ['id = ?'],
        'data': [user_id]
    })
    if user:
        return user[0], 200
    else:
        response = {
            "errors": gettext('USER_ERROR'),
            "message": gettext('ERROR_WHILE_RETRIEVING_USER')
        }
        return response, 401


def update_profile(user_id, data):
    _vars = pdf.init()
    _db = _vars[0]
    user = check_user(user_id, True)

    if user is not False:
        if data['new_password'] and data['old_password'] and not check_password_hash(user[0]['password'], data['old_password']):
            response = {
                "errors": gettext('UPDATE_PROFILE'),
                "message": gettext('ERROR_OLD_PASSWORD_NOT_MATCH')
            }
            return response, 401

        _set = {
            'firstname': data['firstname'],
            'lastname': data['lastname'],
        }

        if data['new_password']:
            _set.update({
                'password': generate_password_hash(data['new_password'])
            })

        res = _db.update({
            'table': ['users'],
            'set': _set,
            'where': ['id = ?'],
            'data': [user_id]
        })

        if res[0] is not False:
            days_before_exp = 1
            user = check_user(user_id)
            return {"user": user[0], "days_before_exp": days_before_exp}, 200
        else:
            response = {
                "errors": gettext('PROFILE_UPDATE_ERROR'),
                "message": str(res[1])
            }
            return response, 401
    else:
        response = {
            "errors": gettext('PROFILE_UPDATE_ERROR'),
            "message": gettext('ERROR_WHILE_RETRIEVING_USER')
        }
        return response, 401


@bp.route('/profile', methods=('GET', 'POST'), defaults=({'user_id': None}))
@bp.route('/profile/<int:user_id>', methods=('GET', 'POST'))
def profile(user_id):
    if user_id is None:
        user_id = g.user['id']
    user_info = check_user(user_id)

    if user_info is False:
        flash(gettext('ERROR_WHILE_RETRIEVING_USER'))
        return redirect(url_for('user.profile', user_id=user_id))

    if request.method == 'POST':
        if 'old_password' in request.form:
            old = request.form['old_password']
            new = request.form['new_password']
            change_password(old, new, user_id)

        if 'role' in request.form:
            role = request.form['role']
            if role != user_info['role']:
                change_role(role, user_id)
                user_info['role'] = role

    return render_template('templates/users/user_profile.html', user=user_info)


def change_role(role, user_id):
    _vars = pdf.init()
    _db = _vars[0]

    user = check_user(user_id)
    if user is not False:
        res = _db.update({
            'table': ['users'],
            'set': {
                'role': role
            },
            'where': ['id = ?'],
            'data': [user_id]
        })

        if res[0] is not False:
            flash(gettext('UPDATE_ROLE_OK'))
        else:
            flash(gettext('UPDATE_ROLE_ERROR') + ' : ' + str(res[1]))


def change_password(old_password, new_password, user_id):
    _vars = pdf.init()
    _db = _vars[0]

    user = check_user(user_id)
    if user is not False:
        if not check_password_hash(user['password'], old_password):
            flash(gettext('ERROR_OLD_PASSWORD_NOT_MATCH'))
        else:
            res = _db.update({
                'table': ['users'],
                'set': {
                    'password': generate_password_hash(new_password)
                },
                'where': ['id = ?'],
                'data': [user_id]
            })

            if res[0] is not False:
                flash(gettext('UPDATE_OK'))
            else:
                flash(gettext('UPDATE_ERROR') + ' : ' + str(res[1]))
    else:
        flash(gettext('ERROR_WHILE_RETRIEVING_USER'))


@bp.route('/profile/reset_password', defaults=({'user_id': None}))
@bp.route('/profile/<int:user_id>/reset_password')
def reset_password(user_id):
    _vars = pdf.init()
    _db = _vars[0]
    _cfg = _vars[1].cfg
    default_password = _cfg['GLOBAL']['defaultpassword']

    if user_id is None:
        user_id = g.user['id']
    user_info = check_user(user_id)

    if user_info is not False:
        res = _db.update({
            'table': ['users'],
            'set': {
                'password': generate_password_hash(default_password)
            },
            'where': ['id = ?'],
            'data': [user_id]
        })

        if res[0] is not False:
            flash(gettext('UPDATE_OK'))
        else:
            flash(gettext('UPDATE_ERROR') + ' : ' + str(res[1]))
    else:
        flash(gettext('ERROR_WHILE_RETRIEVING_USER'))

    return redirect(url_for('user.profile', user_id=user_id))


@bp.route('/list')
def user_list():
    _vars = pdf.init()
    _db = _vars[0]

    page, per_page, offset = get_page_args(page_parameter='page',
                                           per_page_parameter='per_page')

    total = _db.select({
        'select': ['count(*) as total'],
        'table': ['users'],
        'where': ['status not IN (?)'],
        'data': ['DEL'],
    })[0]['total']

    list_user = _db.select({
        'select': ['*'],
        'table': ['users'],
        'where': ['status not IN (?)'],
        'data': ['DEL'],
        'limit': str(per_page),
        'offset': str(offset),
        'order_by': ['id desc']
    })

    final_list = []
    result = [dict(user) for user in list_user]

    for user in result:
        if user['creation_date'] is not None:
            formatted_date = datetime.datetime.strptime(str(user['creation_date']).split('.')[0], '%Y-%m-%d %H:%M:%S').strftime('%d/%m/%Y')
            user['creation_date'] = formatted_date

        final_list.append(user)

    msg = gettext('SHOW') + ' <span id="count">' + str(offset + 1) + '</span> - <span>' + str(offset + len(list_user)) + '</span> ' + gettext('OF') + ' ' + str(total)

    pagination = Pagination(per_page=per_page,
                            page=page,
                            total=total,
                            display_msg=msg)

    return render_template('templates/users/user_list.html',
                           users=final_list,
                           page=page,
                           per_page=per_page,
                           pagination=pagination)


@bp.route('/enable/<int:user_id>', defaults={'fallback': None})
@bp.route('/enable/<int:user_id>?fallback=<path:fallback>')
def enable(user_id, fallback):
    _vars = pdf.init()
    _db = _vars[0]

    if fallback is not None:
        fallback = url_for('user.user_list') + '?page=' + fallback
    else:
        fallback = url_for('user.user_list')

    user = check_user(user_id)
    if user is not False:
        res = _db.update({
            'table': ['users'],
            'set': {
                'enabled': 1
            },
            'where': ['id = ?'],
            'data': [user_id]
        })

        if res[0] is not False:
            flash(gettext('USER_ENABLED_OK'))
        else:
            flash(gettext('USER_ENABLED_ERROR') + ' : ' + str(res[1]))

    return redirect(fallback)


@bp.route('/disable/<int:user_id>', defaults={'fallback': None})
@bp.route('/disable/<int:user_id>?fallback=<path:fallback>')
def disable(user_id, fallback):
    _vars = pdf.init()
    _db = _vars[0]

    if fallback is not None:
        fallback = url_for('user.user_list') + '?page=' + fallback
    else:
        fallback = url_for('user.user_list')

    user = check_user(user_id)
    if user is not False:
        res = _db.update({
            'table': ['users'],
            'set': {
                'enabled': 0
            },
            'where': ['id = ?'],
            'data': [user_id]
        })

        if res[0] is not False:
            flash(gettext('USER_DISABLED_OK'))
        else:
            flash(gettext('USER_DISABLED_ERROR') + ' : ' + str(res[1]))

    return redirect(fallback)


@bp.route('/delete/<int:user_id>', defaults={'fallback': None})
@bp.route('/delete/<int:user_id>?fallback=<path:fallback>')
def delete(user_id, fallback):
    _vars = pdf.init()
    _db = _vars[0]

    if fallback is not None:
        fallback = url_for('user.user_list') + '?page=' + fallback
    else:
        fallback = url_for('user.user_list')

    user = check_user(user_id)
    if user is not False:
        res = _db.update({
            'table': ['users'],
            'set': {
                'status': 'DEL'
            },
            'where': ['id = ?'],
            'data': [user_id]
        })

        if res[0] is not False:
            flash(gettext('USER_DELETED_OK'))
        else:
            flash(gettext('USER_DELETED_ERROR') + ' : ' + str(res[1]))

    return redirect(fallback)


@bp.route('/create', methods=('GET', 'POST'))
def create():
    if request.method == 'POST':
        register()
        return redirect(url_for('user.user_list'))
    return render_template('templates/auth/register.html')
