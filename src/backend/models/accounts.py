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

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

from flask import request, g as current_context
from flask_babel import gettext
from src.backend.functions import retrieve_custom_from_url
from src.backend.main import create_classes_from_custom_id


def get_suppliers(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]

    suppliers = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['accounts_supplier'],
        'where': ['1=1'] if 'where' not in args or not args['where'] else args['where'],
        'data': [] if 'data' not in args else args['data'],
        'order_by': ['id ASC'] if 'order_by' not in args else args['order_by'],
        'limit': str(args['limit']) if 'limit' in args else 'ALL',
        'offset': str(args['offset']) if 'offset' in args else 0
    })

    return suppliers


def get_supplier_by_id(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None
    supplier = database.select({
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
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None
    address = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['addresses'],
        'where': ['id = %s'],
        'data': [args['address_id']]
    })

    if address:
        address = address[0]

    return address, error


def update_supplier(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None
    supplier = database.update({
        'table': ['accounts_supplier'],
        'set': args['set'],
        'where': ['id = %s'],
        'data': [args['supplier_id']]
    })

    if supplier[0] is False:
        error = gettext('SUPPLIER_UPDATE_ERROR')

    return supplier, error


def update_address(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None

    supplier = database.update({
        'table': ['addresses'],
        'set': args['set'],
        'where': ['id = %s'],
        'data': [args['address_id']]
    })

    if supplier[0] is False:
        error = gettext('UPDATE_ADDRESS_ERROR')

    return supplier, error


def create_address(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None

    supplier = database.insert({
        'table': 'addresses',
        'columns': args['columns']
    })

    if not supplier:
        error = gettext('CREATE_ADDRESS_ERROR')

    return supplier, error


def create_supplier(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None

    supplier = database.insert({
        'table': 'accounts_supplier',
        'columns': args['columns']
    })

    if not supplier:
        error = gettext('CREATE_SUPPLIER_ERROR')

    return supplier, error


def delete_supplier(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]

    database.delete({
        'table': ['accounts_supplier'],
        'where': ['id = %s'],
        'data': [args['supplier_id']]
    })
    return ''


def retrieve_customers(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]

    customers = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['accounts_customer'],
        'where': ['1=1'] if 'where' not in args or not args['where'] else args['where'],
        'data': [] if 'data' not in args else args['data'],
        'order_by': ['id ASC'] if 'order_by' not in args else args['order_by'],
        'limit': str(args['limit']) if 'limit' in args else 'ALL',
        'offset': str(args['offset']) if 'offset' in args else 0
    })

    return customers


def get_customer_by_id(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None
    customer = database.select({
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
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None
    accounting_plan = database.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['accounting_plan'],
        'where': ['customer_id = %s'],
        'data': [args['customer_id']]
    })

    if not accounting_plan:
        error = gettext('GET_CUSTOMER_BY_ID_ERROR')

    return accounting_plan, error


def get_default_accounting_plan():
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None
    accounting_plan = database.select({
        'select': ['*'],
        'table': ['accounting_plan'],
        'where': ['customer_id is NULL']
    })
    if not accounting_plan:
        error = gettext('GET_CUSTOMER_BY_ID_ERROR')

    return accounting_plan, error


def update_customer(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None

    customer = database.update({
        'table': ['accounts_customer'],
        'set': args['set'],
        'where': ['id = %s'],
        'data': [args['customer_id']]
    })

    if customer[0] is False:
        error = gettext('UPDATE_CUSTOMER_ERROR')

    return customer, error


def create_customer(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None

    customer = database.insert({
        'table': 'accounts_customer',
        'columns': args['columns']
    })

    if not customer:
        error = gettext('CREATE_CUSTOMER_ERROR')

    return customer, error


def delete_customer(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]
    error = None

    customer = database.update({
        'table': ['accounts_customer'],
        'set': {'status': 'DEL'},
        'where': ['id = %s'],
        'data': [args['customer_id']]
    })

    if not customer:
        error = gettext('DELETE_CUSTOMER_ERROR')

    return customer, error

def get_civilities():
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]

    civilities = database.select({
        'select': ['*'],
        'table': ['accounts_civilities']
    })
    return civilities


def get_civility_by_id(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]

    civility = database.select({
        'select': ['*'],
        'table': ['accounts_civilities'],
        'where': ['id = %s'],
        'data': [args['civility_id']]
    })
    return civility

def delete_civility(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]

    database.delete({
        'table': ['accounts_civilities'],
        'where': ['id = %s'],
        'data': [args['civility_id']]
    })
    return True

def get_civility_by_label(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]

    civility = database.select({
        'select': ['*'],
        'table': ['accounts_civilities'],
        'where': ['label = %s'],
        'data': [args['label']]
    })
    return civility

def create_civility(args):
    if 'database' in current_context:
        database = current_context.database
    else:
        custom_id = retrieve_custom_from_url(request)
        _vars = create_classes_from_custom_id(custom_id)
        database = _vars[0]

    error = None
    civility = database.insert({
        'table': 'accounts_civilities',
        'columns': args['columns']
    })

    if not civility:
        error = gettext('CREATE_CIVILITY_ERROR')

    return civility, error
