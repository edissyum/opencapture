import datetime
from flask import Blueprint, flash, g, redirect, render_template, request, url_for

from flask_babel import gettext
from flask_paginate import Pagination, get_page_args
from werkzeug.security import check_password_hash, generate_password_hash

from webApp.auth import login_required, register

from .functions import get_custom_id, check_python_customized_files

custom_id = get_custom_id()
custom_array = {}
if custom_id:
    custom_array = check_python_customized_files(custom_id[1])

if 'pdf' not in custom_array:
    from . import pdf
else:
    pdf = getattr(__import__(custom_array['pdf']['path'], fromlist=[custom_array['pdf']['module']]), custom_array['pdf']['module'])

bp = Blueprint('user', __name__, url_prefix='/user')


def check_user(user_id):
    _vars = pdf.init()
    _db = _vars[0]

    user = _db.select({
        'select': ['*'],
        'table': ['users'],
        'where': ['id = ?'],
        'data': [user_id]
    })[0]

    return user


@bp.route('/profile', methods=('GET', 'POST'), defaults=({'user_id': None}))
@bp.route('/profile/<int:user_id>', methods=('GET', 'POST'))
@login_required
def profile(user_id):
    if user_id is None:
        user_id = g.user['id']
    user_info = check_user(user_id)

    if user_info is False:
        flash(gettext('ERROR_WHILE_RETRIEVING_USER'))
        return redirect(url_for('user.profile', user_id=user_id))

    if request.method == 'POST':
        old = request.form['old_password']
        new = request.form['new_password']
        change_password(old, new, user_id)

    return render_template('templates/users/user_profile.html', user=user_info)


def change_password(old_password, new_password, user_id):
    _vars = pdf.init()
    _db = _vars[0]

    user = check_user(g.user['id'])

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
@login_required
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
@login_required
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
        'offset': str(offset)
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
@login_required
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
@login_required
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
@login_required
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
@login_required
def create():
    if request.method == 'POST':
        register()
        return redirect(url_for('user.user_list'))
    return render_template('templates/auth/register.html')
