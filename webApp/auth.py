import functools
from flask_babel import gettext
from werkzeug.security import check_password_hash, generate_password_hash
from flask import Blueprint, flash, g, redirect, render_template, request, session, url_for

from webApp.db import get_db

bp = Blueprint('auth', __name__, url_prefix='/auth')


@bp.route('/register', methods=('GET', 'POST'))
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        role = request.form['role']

        db = get_db()
        error = None
        user = db.select({
            'select': ['id'],
            'table': ['users'],
            'where': ['username = ?'],
            'data': [username]
        })

        if not username:
            error = gettext('USERNAME_REQUIRED')
        elif not password:
            error = gettext('PASSWORD_REQUIRED')
        elif user:
            error = gettext('USER') + ' ' + username + ' ' + gettext('ALREADY_REGISTERED')

        if error is None:
            db.insert({
                'table': 'users',
                'columns': {
                    'username': username,
                    'password': generate_password_hash(password),
                    'role': role
                }
            })
            flash(gettext('USER_CREATED_OK'))
            return redirect(url_for('auth.login'))
        flash(error)

    return render_template('templates/auth/register.html')


@bp.route('/login', defaults={'fallback': None}, methods=['GET', 'POST'])
@bp.route('/login?fallback=<path:fallback>', methods=['GET', 'POST'])
def login(fallback):
    if fallback is not None:
        fallback = fallback.replace('%', '/')
    else:
        fallback = url_for('pdf.index', time='TODAY')

    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        db = get_db()
        error = None
        user = db.select({
            'select': ['*'],
            'table': ['users'],
            'where': ['username = ?'],
            'data': [username]
        })

        if not user:
            error = gettext('USERNAME_REQUIRED')
        elif not check_password_hash(user[0]['password'], password):
            error = gettext('PASSWORD_REQUIRED')
        elif user[0]['status'] == 'DEL':
            error = gettext('USER_DELETED')
        elif user[0]['enabled'] == 0:
            error = gettext('USER_DISABLED')

        if error is None:
            lang = session['lang']
            session.clear()
            session['user_id'] = user[0]['id']
            session['user_name'] = user[0]['username']
            session['lang'] = lang

            return redirect(fallback)

        flash(error)

    return render_template('templates/auth/login.html')


@bp.before_app_request
def load_logged_in_user():
    user_id = session.get('user_id')

    if user_id is None:
        g.user = None
    else:
        db = get_db()
        g.user = db.select({
            'select': ['*'],
            'table': ['users'],
            'where': ['id = ?'],
            'data': [user_id]
        })[0]


@bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))


def current_login_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        user_id = kwargs['user_id']
        if user_id:
            if g.user['role'] == 'admin' or g.user['id'] == user_id:
                return view(**kwargs)
            else:
                return render_template('templates/error/403.html')
        else:
            if g.user is None:
                return redirect(url_for('auth.login', fallback=str(request.path.replace('/', '%'))))
        return view(**kwargs)
    return wrapped_view


def login_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None:
            return redirect(url_for('auth.login', fallback=str(request.path.replace('/', '%'))))
        return view(**kwargs)
    return wrapped_view


def admin_login_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None:
            return redirect(url_for('auth.login'))
        elif g.user['role'] != 'admin':
            return render_template('templates/error/403.html')
        return view(**kwargs)
    return wrapped_view
