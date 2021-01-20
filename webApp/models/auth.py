from ..controllers.db import get_db
from flask_babel import gettext
from werkzeug.security import check_password_hash, generate_password_hash


def get_user_by_id(args):
    db = get_db()
    error = None
    user = db.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['users'],
        'where': ['id = ?'],
        'data': [args['user_id']]
    })

    if not user:
        error = gettext('BAD_USERNAME')
    else:
        user = user[0]

    return user, error


def registrer(args):
    db = get_db()
    error = None
    user = db.select({
        'select': ['id'],
        'table': ['users'],
        'where': ['username = ?'],
        'data': [args['username']]
    })

    if not args['username']:
        error = gettext('BAD_USERNAME')
    elif not password:
        error = gettext('BAD_PASSWORD')
    elif user:
        error = gettext('USER') + ' ' + args['username'] + ' ' + gettext('ALREADY_REGISTERED')

    if error is None:
        db.insert({
            'table': 'users',
            'columns': {
                'username': args['username'],
                'firstname': args['firstname'],
                'lastname': args['lastname'],
                'password': generate_password_hash(args['password']),
            }
        })
        return True, ''
    else:
        return False, error


def login(args):
    db = get_db()
    error = None
    user = db.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['users'],
        'where': ['username = ?'],
        'data': [args['username']]
    })

    if not user:
        error = gettext('BAD_USERNAME')
    elif not check_password_hash(user[0]['password'], args['password']):
        error = gettext('BAD_PASSWORD')
    elif user[0]['status'] == 'DEL':
        error = gettext('USER_DELETED')
    elif user[0]['enabled'] == 0:
        error = gettext('USER_DISABLED')
    else:
        user = user[0]

    return user, error
