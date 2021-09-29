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
# along with Open-Capture for Invoices.  If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

# @dev : Nathan Cheval <nathan.cheval@outlook.fr>

from flask_babel import gettext
from ..main import create_classes_from_current_config


def get_invoice_by_id(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    error = None
    user = _db.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['invoices'],
        'where': ['id = %s'],
        'data': [args['invoice_id']]
    })

    if not user:
        error = gettext('GET_INVOICE_BY_ID_ERROR')
    else:
        user = user[0]

    return user, error


def get_invoices(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]

    invoices = _db.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['invoices'] if 'table' not in args else args['table'],
        'left_join': [] if 'left_join' not in args else args['left_join'],
        'where': ['1 = %s'] if 'where' not in args else args['where'],
        'data': ['1'] if 'data' not in args else args['data'],
        'order_by': ['invoices.id DESC'] if 'order_by' not in args else args['order_by'],
        'group_by': ['invoices.id'] if 'group_by' not in args else args['group_by'],
        'limit': str(args['limit']) if 'limit' in args else [],
        'offset': str(args['offset']) if 'offset' in args else [],
    })
    return invoices


def get_total_invoices(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]

    total = _db.select({
        'select': ['*'] if 'select' not in args else args['select'],
        'table': ['invoices'] if 'table' not in args else args['table'],
        'left_join': [] if 'left_join' not in args else args['left_join'],
        'where': ['1 = %s'] if 'where' not in args else args['where'],
        'data': ['1'] if 'data' not in args else args['data'],
    })
    return total


def update_invoice(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    error = None

    supplier = _db.update({
        'table': ['invoices'],
        'set': args['set'],
        'where': ['id = %s'],
        'data': [args['invoice_id']]
    })

    if supplier[0] is False:
        error = gettext('INVOICE_UPDATE_ERROR')

    return supplier, error


def update_invoices(args):
    _vars = create_classes_from_current_config()
    _db = _vars[0]
    error = None
    supplier = _db.update({
        'table': ['invoices'],
        'set': args['set'],
        'where': args['where'],
        'data': args['data']
    })

    if supplier[0] is False:
        error = gettext('INVOICES_UPDATE_ERROR')

    return supplier, error
