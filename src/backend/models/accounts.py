# This file is part of Open-Capture for Invoices.

# Open-Capture for Invoices is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# Open-Capture is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with Open-Capture for Invoices. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

from flask_babel import gettext
from src.backend.main import create_classes_from_current_config


def retrieve_suppliers(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]

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
    _vars = create_classes_from_current_config()
    _db = _vars[0]
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
    _vars = create_classes_from_current_config()
    _db = _vars[0]
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
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    error = None

    supplier = _db.update({
        'table': ['accounts_supplier'],
        'set': args['set'],
        'where': ['id = %s'],
        'data': [args['supplier_id']]
    })

    if supplier[0] is False:
        error = gettext('SUPPLIER_UPDATE_ERROR')

    return supplier, error


def update_address(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    error = None

    supplier = _db.update({
        'table': ['addresses'],
        'set': args['set'],
        'where': ['id = %s'],
        'data': [args['address_id']]
    })

    if supplier[0] is False:
        error = gettext('UPDATE_ADDRESS_ERROR')

    return supplier, error


def create_address(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    error = None

    supplier = _db.insert({
        'table': 'addresses',
        'columns': args['columns'],
    })

    if not supplier:
        error = gettext('CREATE_ADDRESS_ERROR')

    return supplier, error


def create_supplier(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    error = None

    supplier = _db.insert({
        'table': 'accounts_supplier',
        'columns': args['columns'],
    })

    if not supplier:
        error = gettext('CREATE_SUPPLIER_ERROR')

    return supplier, error


def delete_supplier(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    error = None

    supplier = _db.update({
        'table': ['accounts_supplier'],
        'set': {'status': 'DEL'},
        'where': ['id = %s'],
        'data': [args['supplier_id']]
    })

    if not supplier:
        error = gettext('DELETE_SUPPLIER_ERROR')

    return supplier, error


def retrieve_customers(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]

    customers = _db.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['accounts_customer'],
        'where': ['1 = %s'] if 'where' not in args else args['where'],
        'data': ['1'] if 'data' not in args else args['data'],
        'order_by': ['id ASC'] if 'order_by' not in args else args['order_by'],
        'limit': str(args['limit']) if 'limit' in args else [],
        'offset': str(args['offset']) if 'offset' in args else [],
    })

    return customers


def get_customer_by_id(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    error = None
    customer = _db.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['accounts_customer'],
        'where': ['id = %s'],
        'data': [args['customer_id']]
    })

    if not customer:
        error = gettext('GET_CUSTOMER_BY_ID_ERROR')
    else:
        customer = customer[0]

    return customer, error


def get_accounting_plan_by_customer_id(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    error = None
    accounting_plan = _db.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['accounting_plan'],
        'where': ['customer_id = %s'],
        'data': [args['customer_id']]
    })

    if not accounting_plan:
        error = gettext('GET_CUSTOMER_BY_ID_ERROR')

    return accounting_plan, error


def get_default_accounting_plan():
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    error = None
    accounting_plan = _db.select({
        'select': ['*'],
        'table': ['accounting_plan'],
        'where': ['customer_id is NULL'],
    })
    if not accounting_plan:
        error = gettext('GET_CUSTOMER_BY_ID_ERROR')

    return accounting_plan, error


def update_customer(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    error = None

    customer = _db.update({
        'table': ['accounts_customer'],
        'set': args['set'],
        'where': ['id = %s'],
        'data': [args['customer_id']]
    })

    if customer[0] is False:
        error = gettext('UPDATE_CUSTOMER_ERROR')

    return customer, error


def create_customer(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    error = None

    customer = _db.insert({
        'table': 'accounts_customer',
        'columns': args['columns'],
    })

    if not customer:
        error = gettext('CREATE_CUSTOMER_ERROR')

    return customer, error


def delete_customer(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    error = None

    customer = _db.update({
        'table': ['accounts_customer'],
        'set': {'status': 'DEL'},
        'where': ['id = %s'],
        'data': [args['customer_id']]
    })

    if not customer:
        error = gettext('DELETE_CUSTOMER_ERROR')

    return customer, error
