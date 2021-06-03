# This file is part of Open-Capture for Invoices.

# Open-Capture for Invoices is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture for Invoices.  If not, see <https://www.gnu.org/licenses/>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>
from flask_babel import gettext

from ..import_controllers import db


def retrieve_suppliers(args):
    _db = db.get_db()

    suppliers = _db.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['accounts_supplier'],
        'where': ['1 = %s'] if 'where' not in args else args['where'],
        'data': ['1'] if 'data' not in args else args['data'],
        'order_by': ['id ASC'] if 'order_by' not in args else args['order_by'],
        'limit': str(args['limit']) if 'limit' in args else [],
        'offset': str(args['offset']) if 'offset' in args else [],
    })

    return suppliers


def get_supplier_by_id(args):
    _db = db.get_db()
    error = None
    supplier = _db.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['accounts_supplier'],
        'where': ['id = %s'],
        'data': [args['supplier_id']]
    })

    if not supplier:
        error = gettext('GET_SUPPLIER_BY_ID_ERROR')
    else:
        supplier = supplier[0]

    return supplier, error


def get_address_by_id(args):
    _db = db.get_db()
    error = None
    address = _db.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['addresses'],
        'where': ['id = %s'],
        'data': [args['address_id']]
    })

    if not address:
        error = gettext('GET_ADDRESS_BY_ID_ERROR')
    else:
        address = address[0]

    return address, error


def update_supplier(args):
    _db = db.get_db()
    error = None

    role = _db.update({
        'table': ['accounts_supplier'],
        'set': args['set'],
        'where': ['id = %s'],
        'data': [args['supplier_id']]
    })

    if role[0] is False:
        error = gettext('SUPPLIER_UPDATE_ERROR')

    return role, error


def update_address(args):
    _db = db.get_db()
    error = None

    role = _db.update({
        'table': ['addresses'],
        'set': args['set'],
        'where': ['id = %s'],
        'data': [args['address_id']]
    })

    if role[0] is False:
        error = gettext('ADDRESS_UPDATE_ERROR')

    return role, error


def create_address(args):
    _db = db.get_db()
    error = None

    role = _db.insert({
        'table': 'addresses',
        'columns': args['columns'],
    })

    if not role:
        error = gettext('ADDRESS_CREATE_ERROR')

    return role, error


def create_supplier(args):
    _db = db.get_db()
    error = None

    role = _db.insert({
        'table': 'accounts_supplier',
        'columns': args['columns'],
    })

    if not role:
        error = gettext('SUPPLIER_CREATE_ERROR')

    return role, error


def delete_supplier(args):
    _db = db.get_db()
    error = None

    role = _db.update({
        'table': ['accounts_supplier'],
        'set': args['set'],
        'where': ['id = %s'],
        'data': [args['supplier_id']]
    })

    if not role:
        error = gettext('SUPPLIER_CREATE_ERROR')

    return role, error
