import functools
from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for
)
from flask_babel import gettext
from werkzeug.security import check_password_hash, generate_password_hash
from webApp.db import get_db

bp = Blueprint('auth', __name__, url_prefix='/auth')


@bp.route('/register', methods=('GET', 'POST'))
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        db = get_db()
        error = None

        if not username:
            error = gettext('USERNAME_REQUIRED')
        elif not password:
            error = gettext('PASSWORD_REQUIRED')
        elif db.execute(
                'SELECT id FROM user WHERE username = ?', (username,)
        ).fetchone() is not None:
            error = gettext('USER') + '{}' + gettext('ALREADY_REGISTERED').format(username)

        if error is None:
            db.execute(
                'INSERT INTO user (username, password) VALUES (?, ?)',
                (username, generate_password_hash(password))
            )
            db.commit()
            flash(gettext('USER_CREATED_OK'))
            return redirect(url_for('auth.login'))

        flash(error)

    return render_template('auth/register.html')


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
        user = db.execute(
            'SELECT * FROM user WHERE username = ?', (username,)
        ).fetchone()

        if user is None:
            error = gettext('USERNAME_REQUIRED')
        elif not check_password_hash(user['password'], password):
            error = gettext('PASSWORD_REQUIRED')
        elif user['status'] == 'DEL':
            error = gettext('USER_DELETED')
        elif user['enabled'] == 0:
            error = gettext('USER_DISABLED')

        if error is None:
            session.clear()
            session['user_id'] = user['id']
            session['user_name'] = user['username']
            return redirect(fallback)

        flash(error)

    return render_template('auth/login.html')


@bp.before_app_request
def load_logged_in_user():
    user_id = session.get('user_id')

    if user_id is None:
        g.user = None
    else:
        g.user = get_db().execute(
            'SELECT * FROM user WHERE id = ?', (user_id,)
        ).fetchone()


@bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

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
        elif g.user[1] != 'admin':
            return render_template('error/403.html'), 403

        return view(**kwargs)

    return wrapped_view

